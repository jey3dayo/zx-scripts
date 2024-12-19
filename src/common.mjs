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
