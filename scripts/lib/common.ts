import { platform, homedir } from "node:os";

export const currentPlatform = platform();
export const currentHomeDir = homedir();

export async function isCommandInstalled(command: string): Promise<boolean> {
  try {
    const process = new Deno.Command("which", {
      args: [command],
      stdout: "piped",
      stderr: "piped",
    });
    const { success, stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);
    return success && !errorOutput && !!output;
  } catch (e) {
    console.log(`Error checking ${command} installation:`, e);
    return false;
  }
}

export async function isDockerRunning(): Promise<boolean> {
  try {
    const process = new Deno.Command("docker", {
      args: ["ps"],
      stdout: "piped",
      stderr: "piped",
    });
    const { success } = await process.output();
    return success;
  } catch (e) {
    return false;
  }
}

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

// Python
export async function updatePythonPkgs(): Promise<void> {
  const pkgs = ["pip", "ruff"];

  try {
    await runCommand("pip3", ["install", "-U", ...pkgs]);
    
    // Complex command with pipes - using shell
    const process = new Deno.Command("sh", {
      args: ["-c", "pip3 list --format json --outdated | jq .[].name | xargs -r pip3 install -U"],
      stdout: "inherit",
      stderr: "inherit",
    });
    await process.output();
    
    await runCommand("pipx", ["upgrade-all"]);
  } catch (e) {
    console.log(e);
  }
}

// Node
export async function updateNodePkgs(): Promise<void> {
  const pkgs = [
    "corepack",
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
    await runCommand("npm", ["i", "--global", ...pkgs]);
    await runCommand("npm", ["-g", "update"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateApt(): Promise<void> {
  if (currentPlatform !== "linux") return;

  try {
    await runCommand("sudo", ["apt", "update"]);
    await runCommand("sudo", ["apt", "upgrade", "-y"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateBrew(): Promise<void> {
  if (currentPlatform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("brew is not installed. Skipping update.");
    return;
  }

  try {
    await runCommand("brew", ["update"]);
    await runCommand("brew", ["upgrade"]);
    await runCommand("brew", ["bundle", "dump", "--global", "--force"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateAndCleanupBrew(): Promise<void> {
  if (currentPlatform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("brew is not installed. Skipping update.");
    return;
  }

  try {
    await runCommand("brew", ["update"]);
    await runCommand("brew", ["upgrade"]);
    await runCommand("brew", ["cleanup"]);
    await runCommand("brew", ["bundle", "dump", "--global", "--force"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateNvim(): Promise<void> {
  try {
    await runCommand("brew", ["reinstall", "neovim"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateNvimScripts(): Promise<void> {
  if (!(await isCommandInstalled("nvim"))) {
    console.log("nvim is not installed. Skipping update.");
    return;
  }

  try {
    await runCommand("nvim", ["--headless", "+Lazy! sync", "+qa"]);
    await runCommand("nvim", ["--headless", "+MasonUpdate", "+qa"]);
    await runCommand("nvim", ["--headless", "+TSUpdateSync", "+qa"]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateRepos(): Promise<void> {
  const repos = [
    `${currentHomeDir}/src/github.com/dimdenGD/OldTweetDeck`,
    `${currentHomeDir}/src/github.com/junegunn/fzf`,
    `${currentHomeDir}/Library/Caches/Homebrew/neovim--git`,
  ];

  for (const repo of repos) {
    try {
      const process = new Deno.Command("git", {
        args: ["pull"],
        cwd: repo,
        stdout: "inherit",
        stderr: "inherit",
      });
      await process.output();
    } catch (e) {
      console.log(`Error updating repository ${repo}:`, e);
    }
  }
}

export async function updateMise(): Promise<void> {
  if (!(await isCommandInstalled("mise"))) {
    console.log("mise is not installed. Skipping update.");
    return;
  }

  try {
    console.log("🔄 Upgrading mise...");
    await runCommand("mise", ["upgrade"]);

    console.log("📦 Installing Node.js versions...");
    const nodeVersions = ["16", "18", "20", "22"];
    for (const version of nodeVersions) {
      console.log(`Installing Node.js ${version}...`);
      await runCommand("mise", ["install", `node@${version}`]);
    }

    console.log("🏃 Installing Bun...");
    await runCommand("mise", ["install", "bun"]);

    console.log("✨ mise update completed!");
  } catch (e) {
    console.error("❌ Error during mise update:", e);
  }
}

export async function pruneDocker(): Promise<void> {
  if (!(await isDockerRunning())) {
    console.log("Docker is not running. Skipping pruning.");
    return;
  }

  try {
    console.log("🐳 Pruning Docker containers...");
    await runCommand("docker", ["container", "prune", "-f"]);

    console.log("🐳 Pruning Docker images...");
    await runCommand("docker", ["image", "prune", "-a", "-f"]);

    console.log("🐳 Pruning Docker volumes...");
    await runCommand("docker", ["volume", "prune", "-f"]);

    console.log("🐳 Pruning Docker networks...");
    await runCommand("docker", ["network", "prune", "-f"]);

    console.log("✨ Docker cleanup completed!");
  } catch (e) {
    console.error("❌ Error during Docker pruning:", e);
  }
}