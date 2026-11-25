import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { frameDomains, listDevices, openDevice, stopPreviews } from "./devices.mjs";

const uri = "ui://agy-devices/preview.html";
const mimeType = "text/html;profile=mcp-app";
const noArgs = { type: "object", properties: {}, additionalProperties: false };
const resource = { uri, mimeType, name: "Devices" };
const appOnly = { ui: { visibility: ["app"] } };
const tools = [
  {
    name: "open_devices",
    description: "Show the local iOS simulators and Android emulators in the device picker.",
    inputSchema: noArgs,
    _meta: {
      ui: { resourceUri: uri, visibility: ["model", "app"] },
      "com.google.antigravity/ui": {
        entrypoints: [{ type: "aux_pane", title: "Devices" }]
      }
    }
  },
  {
    name: "list_devices", description: "Refresh the local device list.", inputSchema: noArgs, _meta: appOnly
  },
  {
    name: "open_device", description: "Open the selected device in the picker.",
    inputSchema: {
      type: "object", additionalProperties: false, required: ["id"],
      properties: { id: { type: "string", maxLength: 200 } }
    },
    _meta: appOnly
  }
];

function result(data, text) {
  return {
    content: [{ type: "text", text: text ?? JSON.stringify(data) }],
    structuredContent: data
  };
}

const unsupportedPlatformMessage = "Devices is currently only supported for Antigravity on macOS.";

async function callTool(name, args) {
  try {
    if (process.platform !== "darwin") throw new Error(unsupportedPlatformMessage);
    switch (name) {
      case "open_devices":
      case "list_devices":
        return result(await listDevices());
      case "open_device":
        if (typeof args?.id !== "string" || args.id.length > 200) throw new Error("Select a device from the list.");
        return result(await openDevice(args.id));
      default:
        throw new Error("Unknown device tool.");
    }
  } catch (error) {
    return { content: [{ type: "text", text: error.message }], isError: true };
  }
}

async function respond({ method, params, id }) {
  if (id === undefined) return;
  switch (method) {
    case "initialize":
      return {
        protocolVersion: params?.protocolVersion ?? "2025-11-25",
        capabilities: { resources: {}, tools: {} },
        serverInfo: { name: "agy-devices", version: "0.5.0" }
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools };
    case "resources/list":
      return { resources: [resource] };
    case "resources/read":
      if (params?.uri === uri) {
        return { contents: [{
          uri, mimeType, text: readFileSync(new URL("./preview.html", import.meta.url), "utf8"),
          _meta: { ui: { csp: { frameDomains }, prefersBorder: false } }
        }] };
      }
      break;
    case "tools/call":
      return callTool(params?.name, params?.arguments);
  }
  throw new Error("Unknown MCP method or resource.");
}

const input = createInterface({ input: process.stdin });
input.on("line", async (line) => {
  let message;
  try {
    message = JSON.parse(line);
    const response = await respond(message);
    if (message.id !== undefined) {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, result: response }) + "\n");
    }
  } catch (error) {
    process.stdout.write(JSON.stringify({
      jsonrpc: "2.0", id: message?.id ?? null,
      error: { code: -32603, message: error.message }
    }) + "\n");
  }
});
input.on("close", () => process.exit(0));
process.on("exit", stopPreviews);
process.on("SIGTERM", () => process.exit(0));
