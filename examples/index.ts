import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import path from "node:path";
import fs from "node:fs";
import { execa } from "execa";

const argv = await yargs(hideBin(process.argv))
  .scriptName("piax")
  .usage("$0 --sample <name>")
  .option("sample", {
    alias: "s",
    type: "string",
    default: "basic-app",
    describe: "Run a sample app (name, folder, or direct path)",
  })
  .strict()
  .help()
  .parse();

const input = argv.sample;
const root = process.cwd();

function resolveSample(input: string): string | null {
  const directPath = path.resolve(root, input);

  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
    const indexFiles = ["index.ts", "index.js"];
    for (const file of indexFiles) {
      const full = path.join(directPath, file);
      if (fs.existsSync(full)) return full;
    }
  }

  const sampleFolder = path.join(root, "samples", input);
  if (fs.existsSync(sampleFolder) && fs.statSync(sampleFolder).isDirectory()) {
    const indexFiles = ["index.ts", "index.js"];
    for (const file of indexFiles) {
      const full = path.join(sampleFolder, file);
      if (fs.existsSync(full)) return full;
    }
  }

  const extensions = [".ts", ".js"];
  for (const ext of extensions) {
    const file = path.join(root, "samples", `${input}${ext}`);
    if (fs.existsSync(file)) return file;
  }

  return null;
}

const resolvedPath = resolveSample(input);

if (!resolvedPath) {
  console.log(
    chalk.redBright("❌ Sample not found\n") +
      chalk.gray(`→ Input: ${input}\n`) +
      chalk.gray(`→ Looked in:\n`) +
      chalk.gray(`   • ${path.join(root, input)}\n`) +
      chalk.gray(`   • samples/${input}\n`) +
      chalk.gray(`   • samples/${input}.ts | .js\n`),
  );
  process.exit(1);
}

console.log(chalk.magenta(`🚀 Running sample → ${chalk.bold(input)}`));
console.log(chalk.gray(`   ${resolvedPath}\n`));

const child = execa("tsx", ["watch", "--clear-screen=false", resolvedPath], {
  stdio: "inherit",
  env: { ...process.env, FORCE_COLOR: "1" },
});

process.on("SIGINT", () => {
  child.kill("SIGTERM");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});

child.catch((error) => {
  if (error.signal === "SIGTERM" || error.signal === "SIGINT" || error.exitCode === 130) {
    process.exit(0);
  }
  console.error(chalk.redBright("❌ Process failed:"), error.message);
  process.exit(error.exitCode || 1);
});
