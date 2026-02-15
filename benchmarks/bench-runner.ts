import { fork } from "child_process";
import Table from "cli-table3";
import autocannon, { type Result } from "autocannon";
import { promises as fs } from "fs";
import path from "node:path";
import chalk from "chalk";
import os from "os";
import type { BenchConfig, BenchSummary } from "./types.js";

class BenchRunner {
  private summaries: BenchSummary[] = [];
  private details: unknown[] = [];
  private config: BenchConfig;
  private readonly defaultApps = ["elysia", "express", "fastify", "h3", "hono", "koa", "piax", "raw-http"];

  constructor(config: BenchConfig) {
    this.config = {
      apps: this.defaultApps,
      ...config,
    };
  }

  /**
   * @func getAutoConfig
   * @disabled
   */
  private getAutoConfig(): Omit<BenchConfig, "apps"> {
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const cpuSpeed = cpus[0]?.speed || 2500;
    const totalMemGB = os.totalmem() / 1024 / 1024 / 1024;

    const baseDuration = cpuSpeed > 3000 ? 10 : 15;
    const baseConnections = Math.floor(totalMemGB * 25);

    return {
      duration: Math.max(5, Math.min(60, baseDuration)),
      connections: Math.max(10, Math.min(500, baseConnections)),
      pipelining: cpuCount >= 4 ? 10 : 1,
      workers: Math.max(1, Math.min(8, cpuCount - 1)),
      warmupDuration: 3,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async run() {
    if (!this.config.apps?.length) {
      console.error(chalk.red.bold("No apps configured"));
      return;
    }

    this.printHeader();
    this.printConfiguration();

    for (const app of this.config.apps) {
      await this.testApplication(app);
    }

    this.printSummary();
    await this.saveResults();
  }

  private printHeader() {
    console.log(chalk.blue.bold("\n🚀 Piax Framework Benchmark"));
    console.log(chalk.gray("=".repeat(50)));
  }

  private printConfiguration() {
    console.log(chalk.yellow.bold("\n⚙️  Configuration:"));
    console.log(chalk.gray(`  Duration:       ${this.config.duration}s`));
    console.log(chalk.gray(`  Connections:    ${this.config.connections}`));
    console.log(chalk.gray(`  Pipelining:     ${this.config.pipelining}`));
    console.log(chalk.gray(`  Workers:        ${this.config.workers || "auto"}`));
    console.log(chalk.gray(`  Warm-up:        ${this.config.warmupDuration || 0}s`));
    console.log(chalk.gray(`  Apps:           ${this.config.apps?.join(", ") || "none"}`));
  }

  private async testApplication(app: string) {
    console.log(chalk.cyan(`\n📊 Testing ${chalk.bold(app)}...`));
    let serverProcess;
    try {
      // Start server
      serverProcess = fork(`./apps/${app}.js`, [], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      });

      // Wait for server to be ready
      await this.waitForServerReady(serverProcess);

      // Run warm-up if configured
      if (this.config.warmupDuration && this.config.warmupDuration > 0) {
        console.log(chalk.gray("  Warming up..."));
        await this.runWarmup();
      }

      // Run main benchmark
      const result = await this.runBenchmark();

      // Create summary
      const summary: BenchSummary = {
        app,
        reqAvg: Math.round(result.requests.average),
        latencyAvg: result.latency.average,
        throughputAvg: result.throughput.average,
        errors: result.errors,
      };
      this.details.push({ app, ...result });
      this.summaries.push(summary);
      this.printApplicationResult(summary);
    } catch (error: any) {
      console.error(chalk.red(`  ❌ Failed: ${error.message}`));
      this.summaries.push({
        app,
        reqAvg: 0,
        latencyAvg: 0,
        throughputAvg: 0,
        errors: 1,
      });
    } finally {
      // Cleanup server process
      if (serverProcess?.connected) {
        serverProcess.kill("SIGTERM");
        await this.sleep(1000);
      }
    }
  }

  private waitForServerReady(process: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Server startup timeout"));
      }, 10000);

      const readyHandler = (msg: string) => {
        if (msg === "READY") {
          clearTimeout(timeout);
          resolve();
        }
      };

      process.on("message", readyHandler);
      process.on("exit", () => {
        clearTimeout(timeout);
        reject(new Error("Server exited before ready"));
      });

      // Fallback: wait 2 seconds and assume ready
      setTimeout(() => {
        clearTimeout(timeout);
        console.log(chalk.gray("  Server assumed ready..."));
        resolve();
      }, 2000);
    });
  }

  private async runWarmup(): Promise<void> {
    await autocannon({
      url: "http://localhost:3000",
      duration: this.config.warmupDuration!,
      connections: Math.min(10, this.config.connections),
      requests: [{ method: "GET", path: "/" }],
    });
  }

  private async runBenchmark(): Promise<Result> {
    return new Promise((resolve, reject) => {
      autocannon(
        {
          url: "http://localhost:3000",
          duration: this.config.duration,
          connections: this.config.connections,
          pipelining: this.config.pipelining,
          workers: this.config.workers ?? 1,
          headers: { "Content-Type": "application/json" },
          requests: [
            { method: "GET", path: "/" },
            { method: "GET", path: "/api/users" },
            { method: "GET", path: "/api/users/123" },
            {
              method: "POST",
              path: "/api/users",
              body: JSON.stringify({ name: "John", age: 30 }),
            },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    });
  }

  private printApplicationResult(summary: BenchSummary) {
    const reqColor = this.getRequestColor(summary.reqAvg);
    const latColor = this.getLatencyColor(summary.latencyAvg);

    console.log(chalk.green("  ✓ Completed"));
    console.log(`    Requests/sec: ${reqColor(summary.reqAvg.toLocaleString())}`);
    console.log(`    Latency:      ${latColor(summary.latencyAvg.toFixed(2) + " ms")}`);
    console.log(`    Throughput:   ${chalk.blue((summary.throughputAvg / 1024 / 1024).toFixed(2) + " MB/s")}`);

    if (summary.errors > 0) {
      console.log(chalk.yellow(`    Errors:       ${summary.errors}`));
    }
  }

  private getRequestColor(requests: number) {
    if (requests > 20000) return chalk.green.bold;
    if (requests > 10000) return chalk.green;
    if (requests > 5000) return chalk.yellow;
    return chalk.red;
  }

  private getLatencyColor(latency: number) {
    if (latency < 5) return chalk.green.bold;
    if (latency < 20) return chalk.green;
    if (latency < 100) return chalk.yellow;
    return chalk.red;
  }

  private printSummary() {
    if (this.summaries.length === 0) {
      console.log(chalk.red("\nNo results to display"));
      return;
    }
    const sorted = [...this.summaries].sort((a, b) => b.reqAvg - a.reqAvg);
    const fastest = sorted[0];

    console.log(chalk.blue.bold("\n📈 BENCHMARK SUMMARY"));
    console.log(chalk.gray("=".repeat(70)));

    const table = new Table({
      head: [
        chalk.cyan("Rank"),
        chalk.cyan("Framework"),
        chalk.cyan("Req/Sec"),
        chalk.cyan("Latency"),
        chalk.cyan("Throughput"),
        chalk.cyan("Status"),
      ],
      colWidths: [8, 15, 15, 15, 15, 12],
      style: { border: ["gray"] },
    });

    sorted.forEach((summary, index) => {
      const rank = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ` ${index + 1}`;

      const isFastest = summary.app === fastest!.app;
      const frameworkName = isFastest ? chalk.yellow.bold(summary.app) : summary.app;

      const reqColor = this.getRequestColor(summary.reqAvg);
      const latColor = this.getLatencyColor(summary.latencyAvg);
      const status = summary.errors > 0 ? chalk.red("Error") : chalk.green("OK");

      table.push([
        rank,
        frameworkName,
        reqColor(summary.reqAvg.toLocaleString()),
        latColor(summary.latencyAvg.toFixed(2) + " ms"),
        chalk.blue((summary.throughputAvg / 1024 / 1024).toFixed(2) + " MB"),
        status,
      ]);
    });

    console.log(table.toString());
    // Performance comparison
    if (sorted.length > 1) {
      const slowest = sorted[sorted.length - 1];
      const improvement = (((fastest!.reqAvg - slowest!.reqAvg) / slowest!.reqAvg) * 100).toFixed(1);

      console.log(chalk.green.bold(`\n🏆 Fastest: ${fastest!.app} (${fastest!.reqAvg.toLocaleString()} req/sec)`));
      console.log(chalk.gray(`📊 Performance range: ${improvement}% difference between fastest and slowest`));
    }
  }

  private async saveResults() {
    const resultsDir = path.join(process.cwd(), "results");
    const filename = path.join(resultsDir, "bench-results.json");

    try {
      await fs.mkdir(resultsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const resultData = {
        timestamp: new Date().toISOString(),
        config: this.config,
        systemInfo: {
          cpus: os.cpus().length,
          cpuSpeed: os.cpus()[0]?.speed,
          totalMem: os.totalmem(),
          platform: os.platform(),
          arch: os.arch(),
        },
        summaries: this.summaries,
        details: this.details,
      };
      await fs.writeFile(filename, JSON.stringify(resultData, null, 2), "utf8");
      console.log(chalk.gray(`\n💾 Results saved to: ${filename}`));
    } catch (error: any) {
      console.error(chalk.red("❌ Failed to save results:"), error);
    }
  }
}

//new BenchmarkRunner().run();

export { BenchRunner };
