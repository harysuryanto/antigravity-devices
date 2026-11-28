# Security Policy

## Security Model

**Devices for Antigravity** (`antigravity-devices`) is designed to run strictly on your local machine:

- Preview HTTP and WebSocket servers bind only to `127.0.0.1` (loopback).
- No device frames, touch input, or authentication tokens are logged or transmitted externally.
- The accelerated Android streaming path reuses the local Android Emulator's existing authenticated gRPC endpoint.
- MCP `stdout` is reserved strictly for JSON-RPC; diagnostics go to `stderr`.

## Supported Versions

Security fixes are applied to the latest published release on `main`.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report security issues privately using **[GitHub Security Advisories](https://github.com/harysuryanto/antigravity-devices/security/advisories/new)** on this repository.

Please include:
- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept.
- Affected plugin version and macOS environment details.

We will acknowledge your report as soon as possible and work with you on a fix and coordinated disclosure.
