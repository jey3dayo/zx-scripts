import os from "node:os";
import {
  platform,
  pruneDocker,
  updateAndCleanupBrew,
  updateApt,
  updateMise,
  updateNodePkgs,
  updateNvimScripts,
  updatePythonPkgs,
  updateRepos,
} from "./common.mjs";

if (platform === "linux") $`sudo whoami`;

await Promise.all([
  $`sheldon lock --update`,
  updateNodePkgs(),
  updatePythonPkgs(),
  updateAndCleanupBrew(),
  updateApt(),
  updateNvimScripts(),
  updateRepos(),
  updateMise(),
  pruneDocker(),
]);
