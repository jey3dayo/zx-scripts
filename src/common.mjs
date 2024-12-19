export async function isCommandInstalled(command) {
  try {
    const { stdout, stderr } = await $`which ${command}`;
    return !stderr && !!stdout;
  } catch (e) {
    console.log(`Error checking ${command} installation:`);
    return false;
  }
}

export async function isDockerRunning() {
  try {
    const { stderr } = await $`docker ps`;
    return !stderr;
  } catch (e) {
    return false;
  }
}

// python
export async function updatePythonPkgs() {
  const pkgs = ["pip", "ruff"];

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
export async function updateNodePkgs() {
  const pkgs = [
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

export async function updateApt() {
  if (platform !== "linux") return;

  try {
    await $`sudo apt update`;
    await $`sudo apt upgrade -y`;
  } catch (e) {
    console.log(e);
  }
}

export async function updateBrew() {
  if (platform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("brew is not installed. Skipping update.");
    return;
  }

  try {
    await $`brew update`;
    await $`brew upgrade`;
    await $`brew cleanup`;
    await $`brew bundle dump --global --force`;
  } catch (e) {
    console.log(e);
  }
}

export async function updateNvim() {
  try {
    await $`brew reinstall neovim`;
  } catch (e) {
    console.log(e);
  }
}

export async function updateNvimScripts() {
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

export async function updateRepos() {
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

export async function updateMise() {
  if (!(await isCommandInstalled("mise"))) {
    console.log("mise is not installed. Skipping update.");
    return;
  }

  try {
    console.log("🔄 Upgrading mise...");
    await $`mise upgrade`;

    console.log("📦 Installing Node.js versions...");
    const nodeVersions = ["16", "18", "20", "22"];
    for (const version of nodeVersions) {
      console.log(`Installing Node.js ${version}...`);
      await $`mise install node@${version}`;
    }

    console.log("🏃 Installing Bun...");
    await $`mise install bun`;

    console.log("✨ mise update completed!");
  } catch (e) {
    console.error("❌ Error during mise update:", e);
  }
}

export async function pruneDocker() {
  if (!(await isDockerRunning("docker"))) {
    console.log("Docker is not running. Skipping pruning.");
    return;
  }

  try {
    console.log("🐳 Pruning Docker containers...");
    await $`docker container prune -f`;

    console.log("🐳 Pruning Docker images...");
    await $`docker image prune -a -f`;

    console.log("🐳 Pruning Docker volumes...");
    await $`docker volume prune -f`;

    console.log("🐳 Pruning Docker networks...");
    await $`docker network prune -f`;

    console.log("✨ Docker cleanup completed!");
  } catch (e) {
    console.error("❌ Error during Docker pruning:", e);
  }
}
