import os from "os";
import {
  isCommandInstalled,
  isDockerRunning,
  pruneDocker,
  updateApt,
  updateBrew,
  updateMise,
  updateNodePkgs,
  updateNvimScripts,
  updatePythonPkgs,
  updateRepos,
} from "./common.mjs";

const platform = os.platform();
if (platform === "linux") $`sudo whoami`;

await Promise.all([
  $`sheldon lock --update`,
  updateNodePkgs(),
  updatePythonPkgs(),
  updateBrew(),
  updateApt(),
  updateNvimScripts(),
  updateRepos(),
  updateMise(),
  pruneDocker(),
]);
