#!/usr/bin/env tsx
// [P2][APP][CODE] System Pulse
// Tags: P2, APP, CODE

import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

interface SystemMetrics {
  cpu: number;
  memory: { used: number; total: number; percentage: number };
  processes: number;
  uptime: string;
  timestamp: Date;
}

class TerminalViz {
  private history: number[] = [];
  private maxHistory = 50;

  clearScreen() {
    process.stdout.write("\x1b[2J\x1b[H");
  }

  drawHeader(title: string) {
    const width = process.stdout.columns || 80;
    const padding = Math.floor((width - title.length) / 2);
    console.log("\x1b[1m\x1b[36m" + "═".repeat(width) + "\x1b[0m");
    console.log("\x1b[1m\x1b[35m" + " ".repeat(padding) + title + "\x1b[0m");
    console.log("\x1b[1m\x1b[36m" + "═".repeat(width) + "\x1b[0m\n");
  }

  drawBar(label: string, value: number, max: number = 100, width: number = 40) {
    const percentage = Math.min((value / max) * 100, 100);
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    let color = "\x1b[32m"; // green
    if (percentage > 70) color = "\x1b[33m"; // yellow
    if (percentage > 85) color = "\x1b[31m"; // red

    const bar = color + "█".repeat(filled) + "\x1b[90m" + "░".repeat(empty) + "\x1b[0m";
    const percentStr = percentage.toFixed(1).padStart(5);

    console.log(`\x1b[1m${label.padEnd(12)}\x1b[0m ${bar} ${percentStr}%`);
  }

  drawSparkline(values: number[], height: number = 8) {
    if (values.length === 0) return;

    const max = Math.max(...values, 1);
    const normalized = values.map((v) => Math.floor((v / max) * (height - 1)));

    const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    const line = normalized
      .map((n) => {
        const color = n < 3 ? "\x1b[32m" : n < 6 ? "\x1b[33m" : "\x1b[31m";
        return color + blocks[n] + "\x1b[0m";
      })
      .join("");

    console.log("\n\x1b[1mCPU History (50s):\x1b[0m");
    console.log(line);
    console.log("\x1b[90m" + "─".repeat(values.length) + "\x1b[0m\n");
  }

  drawMetricBox(label: string, value: string, color: string = "\x1b[36m") {
    console.log(`${color}▸\x1b[0m \x1b[1m${label}:\x1b[0m ${value}`);
  }

  addToHistory(value: number) {
    this.history.push(value);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    return this.history;
  }
}

class SystemMonitor {
  private viz: TerminalViz;
  private running: boolean = false;

  constructor() {
    this.viz = new TerminalViz();
  }

  async getCPUUsage(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        "top -bn2 -d 0.5 | grep 'Cpu(s)' | tail -1 | awk '{print $2}' | cut -d'%' -f1",
      );
      return parseFloat(stdout.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async getMemoryUsage(): Promise<{ used: number; total: number; percentage: number }> {
    try {
      const { stdout } = await execAsync("free -m | grep Mem");
      const parts = stdout.trim().split(/\s+/);
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const percentage = (used / total) * 100;
      return { used, total, percentage };
    } catch {
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  async getProcessCount(): Promise<number> {
    try {
      const { stdout } = await execAsync("ps aux | wc -l");
      return parseInt(stdout.trim()) - 1;
    } catch {
      return 0;
    }
  }

  async getUptime(): Promise<string> {
    try {
      const { stdout } = await execAsync("uptime -p");
      return stdout.trim().replace("up ", "");
    } catch {
      return "unknown";
    }
  }

  async getTopProcesses(): Promise<Array<{ name: string; cpu: number; mem: number }>> {
    try {
      const { stdout } = await execAsync(
        "ps aux --sort=-%cpu | head -6 | tail -5 | awk '{print $11,$3,$4}'",
      );
      return stdout
        .trim()
        .split("\n")
        .map((line) => {
          const [name, cpu, mem] = line.split(" ");
          return {
            name: name.split("/").pop() || name,
            cpu: parseFloat(cpu),
            mem: parseFloat(mem),
          };
        });
    } catch {
      return [];
    }
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const [cpu, memory, processes, uptime] = await Promise.all([
      this.getCPUUsage(),
      this.getMemoryUsage(),
      this.getProcessCount(),
      this.getUptime(),
    ]);

    return {
      cpu,
      memory,
      processes,
      uptime,
      timestamp: new Date(),
    };
  }

  async render() {
    const metrics = await this.collectMetrics();
    const topProcs = await this.getTopProcesses();
    const history = this.viz.addToHistory(metrics.cpu);

    this.viz.clearScreen();
    this.viz.drawHeader("⚡ SYSTEM PULSE - Real-Time Monitor ⚡");

    console.log("\x1b[1m📊 Current Metrics\x1b[0m\n");
    this.viz.drawBar("CPU", metrics.cpu);
    this.viz.drawBar("Memory", metrics.memory.percentage);

    this.viz.drawSparkline(history);

    console.log("\x1b[1m📈 System Info\x1b[0m\n");
    this.viz.drawMetricBox("Processes", metrics.processes.toString(), "\x1b[33m");
    this.viz.drawMetricBox(
      "Memory",
      `${metrics.memory.used}MB / ${metrics.memory.total}MB`,
      "\x1b[34m",
    );
    this.viz.drawMetricBox("Uptime", metrics.uptime, "\x1b[35m");
    this.viz.drawMetricBox("Time", metrics.timestamp.toLocaleTimeString(), "\x1b[36m");

    if (topProcs.length > 0) {
      console.log("\n\x1b[1m🔥 Top Processes by CPU\x1b[0m\n");
      console.log(
        "\x1b[90m" + "Process".padEnd(30) + "CPU%".padStart(8) + "MEM%".padStart(8) + "\x1b[0m",
      );
      console.log("\x1b[90m" + "─".repeat(46) + "\x1b[0m");
      topProcs.forEach((proc) => {
        const cpuColor = proc.cpu > 50 ? "\x1b[31m" : proc.cpu > 20 ? "\x1b[33m" : "\x1b[32m";
        console.log(
          proc.name.slice(0, 29).padEnd(30) +
            cpuColor +
            proc.cpu.toFixed(1).padStart(8) +
            "\x1b[0m" +
            "\x1b[36m" +
            proc.mem.toFixed(1).padStart(8) +
            "\x1b[0m",
        );
      });
    }

    console.log("\n\x1b[90mPress Ctrl+C to exit\x1b[0m");
  }

  start() {
    this.running = true;

    console.log("\x1b[1m\x1b[36m🚀 Starting System Pulse Monitor...\x1b[0m\n");

    const interval = setInterval(() => {
      if (!this.running) {
        clearInterval(interval);
        return;
      }
      this.render().catch(console.error);
    }, 1000);

    const cleanup = () => {
      this.running = false;
      clearInterval(interval);
      this.viz.clearScreen();
      console.log("\n\x1b[1m\x1b[32m✓ Monitor stopped gracefully\x1b[0m\n");
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    // Handle stdin for Ctrl+C in different terminal modes
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", (key) => {
        // Ctrl+C (03) or q
        if (key[0] === 3 || key.toString() === "q") {
          cleanup();
        }
      });
    }

    this.render();
  }
}

const monitor = new SystemMonitor();
monitor.start();
