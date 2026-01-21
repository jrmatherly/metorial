# Metorial Project Overview

## Load When

- Session start
- Understanding project purpose
- Quick reference for structure

---

## Purpose

**Metorial** (YC F25) is an open-source integration platform for agentic AI. This repository contains **MCP Containers** - a collection of pre-built MCP (Model Context Protocol) servers in Docker containers.

**Goal**: Enable AI agents to connect to APIs, data sources, and tools via a unified interface.

## Tech Stack

| Component | Technology |
| ---------- | ------------ |
| Runtime | Bun |
| Language | TypeScript |
| Package Manager | Yarn workspaces |
| Containerization | Docker + Nixpacks |
| Protocol | Model Context Protocol (MCP) |
| SDK | @metorial/mcp-server-sdk |

## Repository Statistics

| Category | Count |
| ---------- | ------- |
| Custom servers | 33 |
| Catalogued servers | 408 |
| Shared packages | 12 |
| Scripts | 5 |

## Quick Commands

```bash
bun install              # Install dependencies
bun add-server           # Add new server (interactive)
bun run build            # Build servers
bun run check-versions   # Verify versions
```

## Directory Quick Reference

| Path | Purpose |
| ------ | --------- |
| `servers/` | Custom MCP server implementations |
| `packages/sdk/` | @metorial/mcp-server-sdk |
| `packages/manifest/` | Manifest utilities |
| `packages/nixpacks/` | Build utilities |
| `catalog/` | Third-party server index |
| `scripts/` | Development automation |

## Related Repositories

| Repository | Purpose |
| ------------ | --------- |
| metorial-platform | Engine powering Metorial |
| metorial-node | JavaScript/TypeScript SDK |
| metorial-python | Python SDK |
| mcp-index | Server discovery index |

---

**Last Updated**: 2026-01-21
