async function isCommandInstalled(command) {
  try {
    const { stdout, stderr } = await $`which ${command}`;
    return !stderr && !!stdout;
  } catch (e) {
    console.log(`Error checking ${command} installation:`);
    return false;
  }
}

async function pruneDocker() {
  if (!(await isCommandInstalled("docker"))) {
    console.log("Docker is not installed. Skipping pruning.");
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

await pruneDocker();
