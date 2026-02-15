import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { BenchRunner } from "./bench-runner.js";
import { BENCH_PRESETS, type BenchPreset } from "./types.js";

const argv = await yargs(hideBin(process.argv))
  .option("preset", {
    type: "string",
    choices: ["quick", "standard", "production", "stress"] as const,
    default: "standard" as const,
    describe: "Benchmark preset type",
  })
  .option("apps", {
    type: "string",
    array: true,
    describe: "Comma-separated app list",
  })
  .option("duration", {
    alias: "d",
    type: "number",
    describe: "Override duration",
  })
  .option("connections", {
    alias: "c",
    type: "number",
    describe: "Override connections",
  })
  .option("pipelining", {
    alias: "p",
    type: "number",
    describe: "Override pipelining",
  })
  .option("workers", {
    alias: "w",
    type: "number",
    describe: "Override workers",
  })
  .strict()
  .help()
  .parse();

const preset: BenchPreset = argv.preset || "standard";
const baseConfig = BENCH_PRESETS[preset];

// Apply overrides
const config = {
  ...baseConfig,
  ...(argv.duration && { duration: argv.duration }),
  ...(argv.connections && { connections: argv.connections }),
  ...(argv.pipelining && { pipelining: argv.pipelining }),
  ...(argv.workers && { workers: argv.workers }),
  ...(argv.apps && { apps: argv.apps.map((a) => a.trim()) }),
};

const runner = new BenchRunner(config);
runner.run();
