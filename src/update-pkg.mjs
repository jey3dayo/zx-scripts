#!/usr/bin/env zx
import os from "os";

const homeDir = os.homedir();
const platform = os.platform();

if (platform === "linux") $`sudo whoami`;

async function isCommandInstalled(command) {
  try {
    const { stdout, stderr } = await $`which ${command}`;
    return !stderr && !!stdout;
  } catch (e) {
    console.log(`Error checking ${command} installation:`);
    return false;
  }
}

// python
async function updatePythonPkgs() {
  let pkgs = ["pip", "ruff"];

  try {
    await $`pip3 install -U ${pkgs}`;
    await $`pip3 list --format json --outdated | jq .[].name | xargs -r pip3 install -U`;
    // await $`pipx reinstall-all`
    await $`pipx upgrade-all`;
  } catch (e) {
    console.log(e);
  }
}

// node
async function updateNodePkgs() {
  let pkgs = [
    "npm-check-updates",
    "neovim",
    "husky",
    "@bufbuild/protoc-gen-es",
    "@connectrpc/protoc-gen-connect-es",
    "aicommits",
    "textlint",
    "textlint-rule-preset-ja-technical-writing",
  ];

  try {
    await $`npm i --global ${pkgs}`;
    await $`npm -g update`;
  } catch (e) {
    console.log(e);
  }
}

async function updateApt() {
  if (platform !== "linux") return;

  try {
    await $`sudo apt update`;
    await $`sudo apt upgrade -y`;
  } catch (e) {
    console.log(e);
  }
}

async function updateBrew() {
  if (platform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("brew is not installed. Skipping update.");
    return;
  }

  try {
    await $`brew update`;
    await $`brew upgrade`;
    await $`brew cleanup`;
  } catch (e) {
    console.log(e);
  }
}

async function updateNvim() {
  if (!(await isCommandInstalled("nvim"))) {
    console.log("nvim is not installed. Skipping update.");
    return;
  }

  try {
    await $`nvim --headless "+Lazy! sync" +qa`;
    await $`nvim --headless "+MasonUpdate" +qa`;
    await $`nvim --headless "+TSUpdateSync" +qa`;
    // await $`brew reinstall neovim`;
  } catch (e) {
    console.log(e);
  }
}

async function updateRepos() {
  const repos = [
    `${homeDir}/src/github.com/dimdenGD/OldTweetDeck`,
    `${homeDir}/src/github.com/junegunn/fzf`,
    `${homeDir}/Library/Caches/Homebrew/neovim--git`,
  ];

  for (const repo of repos) {
    try {
      cd(repo);
      await $`git pull`;
    } catch (e) {
      console.log(`Error updating repository ${repo}:`, e);
    }
  }
}

async function updateMise() {
  try {
    await $`mise upgrade`;
    await $`mise install node@16`;
    await $`mise install node@18`;
    await $`mise install node@20`;
    await $`mise install bun`;
  } catch (e) {
    console.log(e);
  }
}

async function pruneDocker() {
  if (!(await isCommandInstalled("docker"))) {
    console.log("Docker is not installed. Skipping pruning.");
    return;
  }

  try {
    await $`docker container prune -f`;
    await $`docker image prune -a -f`;
  } catch (e) {
    console.log(e);
  }
}

await Promise.all([
  $`sheldon lock --update`,
  updateNodePkgs(),
  updatePythonPkgs(),
  updateBrew(),
  updateApt(),
  updateNvim(),
  updateRepos(),
  updateMise(),
  pruneDocker(),
]);
