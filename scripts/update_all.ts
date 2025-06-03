#!/usr/bin/env -S deno run --allow-run --allow-env --allow-read

import {
  currentPlatform,
  pruneDocker,
  runCommand,
  updateAndCleanupBrew,
  updateApt,
  updateMise,
  updateNodePkgs,
  updateNvimScripts,
  updatePythonPkgs,
  updateRepos,
} from "./lib/common.ts";

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
