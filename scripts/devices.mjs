import { execFile, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const run = async (command, args, timeout = 8_000) =>
  (await exec(command, args, { timeout })).stdout;
const ranges = { ios: [3200, 3201, 3202, 3203], android: [3300, 3301, 3302, 3303] };
const origin = (port) => "http://127.0.0.1:" + port;
export const frameDomains = Object.values(ranges).flat().map(origin);

const home = homedir();
const sdk = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, join(home, "Library/Android/sdk")]
  .find((dir) => dir && existsSync(join(dir, "platform-tools/adb")));
const adbPath = sdk ? join(sdk, "platform-tools/adb") : "adb";
const emulator = sdk ? join(sdk, "emulator/emulator") : "emulator";
const adb = (args) => run(adbPath, args);
let previews = Promise.resolve();
const children = new Map();

async function listIOS() {
  const { devices } = JSON.parse(await run("/usr/bin/xcrun", ["simctl", "list", "devices", "available", "-j"]));
  return Object.entries(devices).flatMap(([runtime, entries]) => {
    const version = runtime.match(/\.iOS-(.+)$/)?.[1];
    if (!version) return [];
    return entries.map(({ udid, name, state }) => ({
      id: "ios:" + udid, target: udid, name, platform: "ios",
      detail: "iOS " + version.replaceAll("-", "."),
      state: state === "Booted" ? "running" : state === "Booting" ? "starting" : "stopped"
    }));
  });
}

async function runningAndroid() {
  const output = await adb(["devices"]);
  const serials = [...output.matchAll(/^(emulator-\d+)\s+device\s*$/gm)].map((match) => match[1]);
  return Promise.all(serials.map(async (serial) => {
    const name = await adb(["-s", serial, "emu", "avd", "name"])
      .then((output) => output.split(/\r?\n/)[0].trim()).catch(() => "");
    return { serial, name };
  }));
}

async function listAndroid() {
  const [running, avds] = await Promise.all([
    runningAndroid(),
    run(emulator, ["-list-avds"])
  ]);
  const names = new Set(avds.split(/\r?\n/).map((name) => name.trim()).filter(Boolean));
  const found = new Set();
  const devices = running.map(({ serial, name }) => {
    // If multiple instances of an AVD are open, keep each visible and addressable.
    const primary = name && !found.has(name);
    if (name) found.add(name);
    return {
      id: primary ? "avd:" + name : "android:" + serial,
      target: serial, name: primary ? name : name ? name + " (" + serial + ")" : serial,
      platform: "android", detail: "Android emulator", state: "running"
    };
  });
  for (const name of names) {
    if (found.has(name)) continue;
    devices.push({
      id: "avd:" + name, target: name, name, platform: "android",
      detail: "Android emulator", state: "stopped"
    });
  }
  return devices;
}

export async function listDevices() {
  const [ios, android] = await Promise.allSettled([listIOS(), listAndroid()]);
  const platforms = [[ios, "ios"], [android, "android"]];
  const issues = {};
  const devices = [];
  for (const [listing, platform] of platforms) {
    if (listing.status === "fulfilled") {
      devices.push(...listing.value);
    } else {
      issues[platform] = platform === "ios"
        ? "Couldn’t list simulators. Check the selected Xcode installation."
        : "Couldn’t list emulators. Check Android SDK Platform-Tools and Emulator.";
    }
  }
  devices.sort((a, b) => Number(b.state === "running") - Number(a.state === "running")
    || a.name.localeCompare(b.name) || a.detail.localeCompare(b.detail));
  return { devices, issues };
}

async function startAndroid(device) {
  if (device.state === "running") {
    const ready = await adb(["-s", device.target, "shell", "getprop", "sys.boot_completed"]).catch(() => "");
    if (ready.trim() === "1") return device.target;
    return waitForAndroid(device.name, device.target);
  }
  const process = spawn(emulator, ["-avd", device.target, "-no-window"], {
    detached: true, stdio: "ignore"
  });
  let failed = false;
  process.on("error", () => { failed = true; });
  process.on("exit", (code) => { if (code) failed = true; });
  process.unref();
  return waitForAndroid(device.target, null, () => failed);
}

async function waitForAndroid(name, serial, failed = () => false) {
  const deadline = Date.now() + 85_000;
  while (Date.now() < deadline && !failed()) {
    const running = serial || (await runningAndroid()).find((device) => device.name === name)?.serial;
    if (running) {
      const ready = await adb(["-s", running, "shell", "getprop", "sys.boot_completed"]).catch(() => "");
      if (ready.trim() === "1") return running;
    }
    await delay(750);
  }
  throw new Error("Couldn’t start " + name + ". Check it in Android Studio’s Device Manager, then refresh.");
}

function serveSim() {
  const installs = join(home, ".paseo", "plugins", "devices");
  if (existsSync(installs)) {
    for (const entry of readdirSync(installs)) {
      const cli = join(installs, entry, "checkout/plugins/devices/node_modules/serve-sim/dist/serve-sim.js");
      if (existsSync(cli)) return cli;
    }
  }
  throw new Error("The iOS preview needs the Devices plugin installed in Paseo.");
}

async function matches(port, platform, target) {
  const ios = platform === "ios";
  try {
    const response = await fetch(origin(port) + (ios ? "/api" : "/health"), {
      redirect: "error", signal: AbortSignal.timeout(650)
    });
    const data = response.ok && await response.json();
    return Boolean(ios ? data?.device === target && data.streamUrl
      : data?.ok && data.serial === target && data.status === "streaming");
  } catch {
    return false;
  }
}

function isFree(port) {
  return new Promise((resolve) => {
    const socket = createServer();
    socket.on("error", () => resolve(false));
    socket.listen(port, "127.0.0.1", () => socket.close(() => resolve(true)));
  });
}

async function stream(platform, target) {
  const ios = platform === "ios";
  const ports = ranges[platform];
  const active = await Promise.all(ports.map((port) => matches(port, platform, target)));
  const existing = ports[active.indexOf(true)];
  if (existing) return origin(existing) + "/";

  const available = await Promise.all(ports.map(isFree));
  const port = ports[available.indexOf(true)];
  if (!port) throw new Error("All local " + (ios ? "iOS" : "Android") + " preview ports are in use.");
  const flags = ["--host", "127.0.0.1", "--port", String(port)];
  const bun = join(home, ".bun/bin/bun");
  const androidPreview = fileURLToPath(new URL("./android-preview.mjs", import.meta.url));
  const emuCli = fileURLToPath(new URL("../android-tools/node_modules/serve-emu/src/cli.ts", import.meta.url));
  if (!ios && (!existsSync(bun) || !existsSync(emuCli))) {
    throw new Error("The Android preview needs Bun and the bundled serve-emu package.");
  }
  const env = sdk ? {
    ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk,
    PATH: join(sdk, "platform-tools") + ":" + (process.env.PATH || "/usr/bin:/bin")
  } : process.env;
  const worker = ios
    ? spawn(process.execPath, [serveSim(), ...flags, "--panes", "none", "--fit", target], { stdio: "ignore" })
    : spawn(bun, [androidPreview, String(port), target], { stdio: "ignore", env });
  children.set(port, worker);
  let failed = false;
  worker.on("error", () => { failed = true; });
  worker.on("exit", () => {
    failed = true;
    if (children.get(port) === worker) children.delete(port);
  });

  for (let attempt = 0; attempt < 55; attempt++) {
    if (await matches(port, platform, target)) return origin(port) + "/";
    if (failed) break;
    await delay(300);
  }
  worker.kill();
  throw new Error("Couldn’t start the " + (ios ? "iOS" : "Android") + " preview. Try opening the device again.");
}

async function start(id) {
  const { devices } = await listDevices();
  const device = devices.find((entry) => entry.id === id);
  if (!device) throw new Error("This device is no longer available. Refresh the device list.");

  let target = device.target;
  if (device.platform === "ios" && device.state !== "running") {
    try {
      await run("/usr/bin/xcrun", ["simctl", "bootstatus", target, "-b"], 85_000);
    } catch {
      throw new Error("Couldn’t start " + device.name + ". Check it in Xcode, then refresh.");
    }
  }
  if (device.platform === "android") target = await startAndroid(device);
  return { device, url: await stream(device.platform, target) };
}

export function openDevice(id) {
  const result = previews.then(() => start(id));
  previews = result.catch(() => {});
  return result;
}

export function stopPreviews() {
  for (const worker of children.values()) worker.kill();
}
