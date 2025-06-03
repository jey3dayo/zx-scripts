#!/usr/bin/env -S deno run --allow-run --allow-env --allow-read

import {
  currentPlatform,
  pruneDocker,
  updateAndCleanupBrew,
  updateApt,
  updateMise,
  updateNodePkgs,
  updateNvimScripts,
  updatePythonPkgs,
  updateRepos,
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

async function main(): Promise<void> {
  if (currentPlatform === "linux") {
    await runCommand("sudo", ["whoami"]);
  }

  await Promise.all([
    runCommand("sheldon", ["lock", "--update"]),
    updateNodePkgs(),
    updatePythonPkgs(),
    updateAndCleanupBrew(),
    updateApt(),
    updateNvimScripts(),
    updateRepos(),
    updateMise(),
    pruneDocker(),
  ]);
}

if (import.meta.main) {
  await main();
}