import chalk from "chalk";
import { promises as fs } from "fs";
import Table from "cli-table3";
import path from "node:path";
import results from "./results/bench-results.json" with { type: "json" };

async function saveToMarkdown() {
  const resultsDir = path.join(process.cwd(), "results");
  const filename = path.join(resultsDir, "bench-results.md");
  const { details, config, systemInfo } = results;
  const sorted = [...details].sort((a: any, b: any) => b.requests.average - a.requests.average);

  const headers = ["Rank", "Framework", "Req/Sec Avg", "Latency Avg", "Throughput Avg"];
  const table = new Table({ head: headers });
  const mdRows: unknown[] = [];

  sorted.forEach((data: any, index) => {
    const rank = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
    // CLI table
    table.push([
      rank,
      data.app,
      data.requests.average.toLocaleString(),
      `${data.latency.average.toFixed(2)} ms`,
      `${(data.throughput.average / 1024 / 1024).toFixed(2)} MB`,
    ]);
    mdRows.push([
      `<span style="color:gray">${rank}</span>`,
      `<span>${data.app}</span>`,
      `<span>${data.requests.average.toLocaleString()}</span>`,
      `<span>${data.latency.average.toFixed(2)} ms</span>`,
      `<span>${(data.throughput.average / 1024 / 1024).toFixed(2)} MB</span>`,
    ]);
  });
  ///
  console.log(table.toString());
  /// MARKDOWN
  let configMd = `### ⚙️ Benchmark Configuration\n`.trim();
  configMd += `\n`;
  configMd += `- **Apps:** ${config.apps.join(", ")}\n`;
  configMd += `- **Duration:** ${config.duration}s\n`;
  configMd += `- **Warmup:** ${config.warmupDuration}s\n`;
  configMd += `- **Connections:** ${config.connections}\n`;
  configMd += `- **Pipelining:** ${config.pipelining}\n`;
  configMd += ` - **Workers:** ${config.workers}\n`;
  configMd += `\n`;

  let systemMd = "### 🖥️ System Information \n";
  systemMd += "\n";
  systemMd += `- **Platform:** ${systemInfo.platform} (${systemInfo.arch})\n`;
  systemMd += `- **CPU Cores:** ${systemInfo.cpus}\n`;
  systemMd += `- **CPU Speed:** ${systemInfo.cpuSpeed} MHz\n`;
  systemMd += `- **Total Memory:** ${(systemInfo.totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\n`;

  const sep = headers.map(() => "---");
  const resultsTableMd = [
    "### 📊 Benchmark Results",
    "",
    `| ${headers.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
    ...mdRows.map((r: any) => `| ${r.join(" | ")} |`),
  ].join("\n");
  const finalMarkdown = ["## Performance Details", configMd, systemMd, resultsTableMd].join("\n\n");
  await fs.mkdir(resultsDir, { recursive: true });
  await fs.writeFile(filename, finalMarkdown, "utf8");
  console.log(chalk.gray(`\n💾 Markdown report saved to: ${filename}`));
}

saveToMarkdown();
