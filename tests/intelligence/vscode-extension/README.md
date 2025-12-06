# Test Intelligence VSCode Extension

## Features

- 🎨 **Embedded Dashboard** - Full dashboard in VSCode webview
- 📊 **Sidebar Metrics** - Real-time metrics in activity bar
- ⚠️ **High Risk Tests** - List of tests needing attention
- ⚡ **Quick Actions** - Run tests, scan security, sync GitHub
- 🔔 **Status Bar** - Live server status
- 🔄 **Auto-refresh** - Metrics update every 5 seconds

## Installation

### Option 1: Install from VSIX

```bash
cd tests/intelligence/vscode-extension
npm install
npm run compile
npm run package
code --install-extension test-intelligence-1.0.0.vsix
```

### Option 2: Development Mode

```bash
cd tests/intelligence/vscode-extension
npm install
npm run compile
```

Then press F5 to open Extension Development Host.

## Usage

### Commands (Ctrl+Shift+P):

- **Test Intelligence: Open Dashboard** - Opens full dashboard in webview
- **Test Intelligence: Run Full Suite** - Execute all tests
- **Test Intelligence: Quick Check** - Fast validation
- **Test Intelligence: Prioritize Tests** - Show high-risk tests
- **Test Intelligence: Security Scan** - OWASP scan
- **Test Intelligence: Sync GitHub** - Sync repository

### Sidebar:

Click the Test Intelligence icon in the activity bar to see:
- **Metrics** panel (Security Score, Speedup, Uptime)
- **High Risk Tests** panel (Top 10 failing tests)

### Status Bar:

Click status bar item to open dashboard.

## Configuration

`File > Preferences > Settings > Test Intelligence`

- `testIntelligence.autoStart` - Auto-start server (default: true)
- `testIntelligence.port` - Server port (default: 3456)
- `testIntelligence.refreshInterval` - Refresh interval in ms (default: 5000)

## Screenshots

### Dashboard in VSCode:
![Dashboard](screenshots/dashboard.png)

### Sidebar Metrics:
![Metrics](screenshots/metrics.png)

## Requirements

- VSCode 1.80.0 or higher
- Node.js 18+ with pnpm
- Test Intelligence server running
