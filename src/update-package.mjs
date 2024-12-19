import os from "node:os";
import {
  platform,
  updateApt,
  updateBrew,
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
  updateBrew(),
  updateApt(),
  updateNvimScripts(),
  updateRepos(),
  updateMise(),
]);
