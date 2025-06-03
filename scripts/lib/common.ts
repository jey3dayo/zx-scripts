import { homedir, platform } from "node:os";

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

// Unified command execution with proper error handling
export async function runCommand(
  command: string,
  args: string[],
): Promise<boolean> {
  try {
    const process = new Deno.Command(command, {
      args,
      stdout: "inherit",
      stderr: "inherit",
    });
    const result = await process.output();
    if (!result.success) {
      console.error(
        `❌ Command failed: ${command} ${
          args.join(" ")
        } (exit code: ${result.code})`,
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error(`❌ Error running ${command} ${args.join(" ")}:`, e);
    return false;
  }
}

// Shell command execution for complex commands with pipes
export async function runShellCommand(command: string): Promise<boolean> {
  try {
    const process = new Deno.Command("sh", {
      args: ["-c", command],
      stdout: "inherit",
      stderr: "inherit",
    });
    const result = await process.output();
    if (!result.success) {
      console.error(
        `❌ Shell command failed: ${command} (exit code: ${result.code})`,
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error(`❌ Error running shell command "${command}":`, e);
    return false;
  }
}

// Safe function wrapper with error handling
export async function safeExecute(
  name: string,
  fn: () => Promise<void>,
): Promise<void> {
  try {
    console.log(`🔄 Starting ${name}...`);
    await fn();
    console.log(`✅ Completed ${name}`);
  } catch (e) {
    console.error(`❌ Failed ${name}:`, e);
  }
}

// Python
export async function updatePythonPkgs(): Promise<void> {
  await safeExecute("Python packages update", async () => {
    const pkgs = ["pip", "ruff"];

    await runCommand("pip3", ["install", "-U", ...pkgs]);
    await runShellCommand(
      "pip3 list --format json --outdated | jq .[].name | xargs -r pip3 install -U",
    );
    await runCommand("pipx", ["upgrade-all"]);
  });
}

// Node
export async function updateNodePkgs(): Promise<void> {
  await safeExecute("Node.js packages update", async () => {
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

    await runCommand("npm", ["i", "--global", ...pkgs]);
    await runCommand("npm", ["-g", "update"]);
  });
}

export async function updateApt(): Promise<void> {
  if (currentPlatform !== "linux") return;

  await safeExecute("APT packages update", async () => {
    await runCommand("sudo", ["apt", "update"]);
    await runCommand("sudo", ["apt", "upgrade", "-y"]);
  });
}

export async function updateBrew(): Promise<void> {
  if (currentPlatform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("⚠️ brew is not installed. Skipping update.");
    return;
  }

  await safeExecute("Homebrew update", async () => {
    await runCommand("brew", ["update"]);
    await runCommand("brew", ["upgrade"]);
    await runCommand("brew", ["bundle", "dump", "--global", "--force"]);
  });
}

export async function updateAndCleanupBrew(): Promise<void> {
  if (currentPlatform !== "darwin") return;

  if (!(await isCommandInstalled("brew"))) {
    console.log("⚠️ brew is not installed. Skipping update.");
    return;
  }

  await safeExecute("Homebrew update and cleanup", async () => {
    await runCommand("brew", ["update"]);
    await runCommand("brew", ["upgrade"]);
    await runCommand("brew", ["cleanup"]);
    await runCommand("brew", ["bundle", "dump", "--global", "--force"]);
  });
}

export async function updateNvim(): Promise<void> {
  await safeExecute("Neovim reinstall", async () => {
    await runCommand("brew", ["reinstall", "neovim"]);
  });
}

export async function updateNvimScripts(): Promise<void> {
  if (!(await isCommandInstalled("nvim"))) {
    console.log("⚠️ nvim is not installed. Skipping update.");
    return;
  }

  await safeExecute("Neovim plugins update", async () => {
    await runCommand("nvim", ["--headless", "+Lazy! sync", "+qa"]);
    await runCommand("nvim", ["--headless", "+MasonUpdate", "+qa"]);
    await runCommand("nvim", ["--headless", "+TSUpdateSync", "+qa"]);
  });
}

export async function updateRepos(): Promise<void> {
  const repos = [
    `${currentHomeDir}/src/github.com/dimdenGD/OldTweetDeck`,
    `${currentHomeDir}/src/github.com/junegunn/fzf`,
    `${currentHomeDir}/Library/Caches/Homebrew/neovim--git`,
  ];

  await safeExecute("Git repositories update", async () => {
    for (const repo of repos) {
      try {
        const process = new Deno.Command("git", {
          args: ["pull"],
          cwd: repo,
          stdout: "inherit",
          stderr: "inherit",
        });
        const result = await process.output();
        if (!result.success) {
          console.error(`⚠️ Failed to update repository: ${repo}`);
        }
      } catch (e) {
        console.error(`⚠️ Error updating repository ${repo}:`, e);
      }
    }
  });
}

export async function updateMise(): Promise<void> {
  if (!(await isCommandInstalled("mise"))) {
    console.log("⚠️ mise is not installed. Skipping update.");
    return;
  }

  await safeExecute("mise environment update", async () => {
    await runCommand("mise", ["upgrade"]);

    const nodeVersions = ["16", "18", "20", "22"];
    for (const version of nodeVersions) {
      await runCommand("mise", ["install", `node@${version}`]);
    }

    await runCommand("mise", ["install", "bun"]);
  });
}

export async function pruneDocker(): Promise<void> {
  if (!(await isDockerRunning())) {
    console.log("⚠️ Docker is not running. Skipping pruning.");
    return;
  }

  await safeExecute("Docker cleanup", async () => {
    await runCommand("docker", ["container", "prune", "-f"]);
    await runCommand("docker", ["image", "prune", "-a", "-f"]);
    await runCommand("docker", ["volume", "prune", "-f"]);
    await runCommand("docker", ["network", "prune", "-f"]);
  });
}
