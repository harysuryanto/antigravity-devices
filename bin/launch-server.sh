#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SERVER_SCRIPT="$PLUGIN_ROOT/scripts/server.mjs"

is_supported_node() {
  candidate=$1
  [ -n "$candidate" ] && [ -x "$candidate" ] || return 1
  version=$("$candidate" -v 2>/dev/null || true)
  major=$(printf '%s' "$version" | sed -n 's/^v\([0-9][0-9]*\)\..*/\1/p')
  [ -n "$major" ] && [ "$major" -ge 22 ]
}

find_node() {
  if [ -n "${ANTIGRAVITY_DEVICES_NODE:-}" ] && is_supported_node "$ANTIGRAVITY_DEVICES_NODE"; then
    printf '%s\n' "$ANTIGRAVITY_DEVICES_NODE"
    return 0
  fi

  if path_node=$(command -v node 2>/dev/null || true); then
    if is_supported_node "$path_node"; then
      printf '%s\n' "$path_node"
      return 0
    fi
  fi

  for candidate in \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME/.volta/bin/node" \
    "$HOME/.asdf/shims/node" \
    "$HOME/.local/share/mise/shims/node" \
    "$HOME/.fnm/current/bin/node" \
    "$HOME/Library/Application Support/fnm/current/bin/node"
  do
    if is_supported_node "$candidate"; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  if [ -d "$HOME/.nvm/versions/node" ]; then
    for candidate in $(ls -1d "$HOME"/.nvm/versions/node/v*/bin/node 2>/dev/null | sort -r); do
      if is_supported_node "$candidate"; then
        printf '%s\n' "$candidate"
        return 0
      fi
    done
  fi

  return 1
}

if ! NODE_BIN=$(find_node); then
  printf '%s\n' "antigravity-devices: Node.js 22+ is required. Install Node.js 22+ or set ANTIGRAVITY_DEVICES_NODE." >&2
  exit 1
fi

exec "$NODE_BIN" "$SERVER_SCRIPT" "$@"
