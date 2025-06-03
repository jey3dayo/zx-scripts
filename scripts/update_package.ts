#!/usr/bin/env -S deno run --allow-run --allow-env --allow-read

import {
  currentPlatform,
  updateNodePkgs,
  updatePythonPkgs,
  updateBrew,
  updateApt,
  updateNvimScripts,
  updateRepos,
  updateMise,
} from "./lib/common.ts";

async function runCommand(command: string, args: string[]): Promise<void> {
  try {
    const process = new Deno.Command(command, {
      args,
      stdout: "inherit",
      stderr: "inherit",
    });
    await process.output();
  } catch (e) {
    console.log(`Error running ${command} ${args.join(" ")}:`, e);
  }
}

// Main execution
async function main(): Promise<void> {
  if (currentPlatform === "linux") {
    await runCommand("sudo", ["whoami"]);
  }

  await Promise.all([
    runCommand("sheldon", ["lock", "--update"]),
    updateNodePkgs(),
    updatePythonPkgs(),
    updateBrew(),
    updateApt(),
    updateNvimScripts(),
    updateRepos(),
    updateMise(),
  ]);
}

if (import.meta.main) {
  await main();
}