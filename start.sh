#!/usr/bin/env bash
# Start SEERC Trainer on macOS/Linux
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js not found. Install it from https://nodejs.org"; exit 1; }
node server.js --open
