import * as vscode from 'vscode';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | null = null;
let statusBarItem: vscode.StatusBarItem;
let dashboardPanel: vscode.WebviewPanel | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('Test Intelligence extension activated');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'testIntelligence.openDashboard';
    statusBarItem.text = '$(testing-loading-icon) Test Intelligence';
    statusBarItem.tooltip = 'Click to open Test Intelligence Dashboard';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Auto-start server if enabled
    const config = vscode.workspace.getConfiguration('testIntelligence');
    if (config.get('autoStart')) {
        startServer();
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('testIntelligence.openDashboard', openDashboard),
        vscode.commands.registerCommand('testIntelligence.runFull', runFullSuite),
        vscode.commands.registerCommand('testIntelligence.runQuick', runQuickCheck),
        vscode.commands.registerCommand('testIntelligence.prioritize', prioritizeTests),
        vscode.commands.registerCommand('testIntelligence.securityScan', securityScan),
        vscode.commands.registerCommand('testIntelligence.syncGitHub', syncGitHub)
    );

    // Register tree data providers
    const metricsProvider = new MetricsProvider();
    const highRiskProvider = new HighRiskTestsProvider();

    vscode.window.registerTreeDataProvider('testIntelligence.metrics', metricsProvider);
    vscode.window.registerTreeDataProvider('testIntelligence.highRiskTests', highRiskProvider);

    // Auto-refresh
    const refreshInterval = config.get<number>('refreshInterval', 5000);
    setInterval(() => {
        metricsProvider.refresh();
        highRiskProvider.refresh();
    }, refreshInterval);
}

export function deactivate() {
    if (serverProcess) {
        serverProcess.kill();
    }
}

function startServer() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const serverPath = path.join(workspaceFolders[0].uri.fsPath, 'tests', 'intelligence', 'server.ts');

    statusBarItem.text = '$(sync~spin) Starting...';

    serverProcess = spawn('npx', ['tsx', serverPath], {
        cwd: path.dirname(serverPath),
        stdio: 'pipe'
    });

    serverProcess.stdout?.on('data', (data) => {
        console.log(`Server: ${data}`);
    });

    serverProcess.on('error', (err) => {
        vscode.window.showErrorMessage(`Failed to start Test Intelligence server: ${err.message}`);
        statusBarItem.text = '$(error) Test Intelligence (Error)';
    });

    setTimeout(() => {
        statusBarItem.text = '$(testing-passed-icon) Test Intelligence';
        statusBarItem.tooltip = 'Test Intelligence Running (http://localhost:3456)';
    }, 2000);
}

function openDashboard() {
    if (dashboardPanel) {
        dashboardPanel.reveal(vscode.ViewColumn.One);
    } else {
        dashboardPanel = vscode.window.createWebviewPanel(
            'testIntelligenceDashboard',
            'Test Intelligence Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        dashboardPanel.webview.html = getWebviewContent();

        dashboardPanel.onDidDispose(() => {
            dashboardPanel = null;
        });
    }
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <iframe src="http://localhost:3456" allow="fullscreen"></iframe>
</body>
</html>`;
}

async function runFullSuite() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Running Full Test Suite',
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });

        try {
            const response = await fetch('http://localhost:3456/api/run');
            const result = await response.json() as any;

            const failed = result.stages?.filter((s: any) => s.status === 'failed').length || 0;

            if (failed > 0) {
                vscode.window.showWarningMessage(`Test suite completed with ${failed} failed stage(s)`);
            } else {
                vscode.window.showInformationMessage('✅ All test stages passed!');
            }
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to run tests: ${err.message}`);
        }
    });
}

async function runQuickCheck() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Running Quick Check',
        cancellable: false
    }, async (progress) => {
        try {
            const response = await fetch('http://localhost:3456/api/run/quick');
            const result = await response.json();
            vscode.window.showInformationMessage('✅ Quick check completed');
        } catch (err: any) {
            vscode.window.showErrorMessage(`Quick check failed: ${err.message}`);
        }
    });
}

async function prioritizeTests() {
    try {
        const response = await fetch('http://localhost:3456/api/prioritize');
        const data = await response.json() as any;

        const items = data.priorities.slice(0, 10).map((p: any) =>
            `${p.name.split('/').pop()} (${(p.failureProbability * 100).toFixed(0)}% risk)`
        );

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Top 10 High-Risk Tests',
            canPickMany: false
        });
    } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to prioritize: ${err.message}`);
    }
}

async function securityScan() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Running Security Scan (OWASP)',
        cancellable: false
    }, async (progress) => {
        try {
            const response = await fetch('http://localhost:3456/api/security');
            const result = await response.json() as any;

            const critical = result.summary.critical;
            const grade = result.grade;

            if (critical > 0) {
                vscode.window.showErrorMessage(`🔴 ${critical} critical vulnerabilities found! Grade: ${grade}`);
            } else {
                vscode.window.showInformationMessage(`✅ Security scan complete. Grade: ${grade}`);
            }
        } catch (err: any) {
            vscode.window.showErrorMessage(`Security scan failed: ${err.message}`);
        }
    });
}

async function syncGitHub() {
    try {
        const response = await fetch('http://localhost:3456/api/github/sync');
        const result = await response.json() as any;

        if (result.name) {
            vscode.window.showInformationMessage(`✅ Synced: ${result.owner}/${result.name} (${result.testCount} tests)`);
        } else {
            vscode.window.showWarningMessage('Not a git repository');
        }
    } catch (err: any) {
        vscode.window.showErrorMessage(`GitHub sync failed: ${err.message}`);
    }
}

// Tree Data Providers
class MetricsProvider implements vscode.TreeDataProvider<MetricItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<MetricItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: MetricItem): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<MetricItem[]> {
        try {
            const [security, parallel, status] = await Promise.all([
                fetch('http://localhost:3456/api/security').then(r => r.json()) as Promise<any>,
                fetch('http://localhost:3456/api/parallel').then(r => r.json()) as Promise<any>,
                fetch('http://localhost:3456/api/status').then(r => r.json()) as Promise<any>
            ]);

            return [
                new MetricItem('Security Score', `${security.score}/100 (${security.grade})`,
                    security.score > 80 ? 'pass' : 'warning'),
                new MetricItem('Speedup', `${parallel.speedup.toFixed(1)}x`, 'zap'),
                new MetricItem('Uptime', `${Math.floor(status.uptime / 60)}m`, 'pulse')
            ];
        } catch {
            return [new MetricItem('Server offline', 'Start server', 'error')];
        }
    }
}

class HighRiskTestsProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TestItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: TestItem): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<TestItem[]> {
        try {
            const response = await fetch('http://localhost:3456/api/prioritize');
            const data = await response.json() as any;

            return data.priorities
                .filter((p: any) => p.failureProbability > 0.5)
                .slice(0, 10)
                .map((p: any) => new TestItem(
                    p.name.split('/').pop(),
                    `${(p.failureProbability * 100).toFixed(0)}% risk`,
                    'warning'
                ));
        } catch {
            return [];
        }
    }
}

class MetricItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        description: string,
        iconName: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon(iconName.replace('$(', '').replace(')', ''));
    }
}

class TestItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        description: string,
        iconName: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon(iconName.replace('$(', '').replace(')', ''));
    }
}
