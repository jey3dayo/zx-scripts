#!/usr/bin/env -S deno run --allow-run --allow-env --allow-read

import {
  currentPlatform,
  runCommand,
  updateApt,
  updateBrew,
  updateMise,
  updateNodePkgs,
  updateNvimScripts,
  updatePythonPkgs,
  updateRepos,
} from "./lib/common.ts";

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
