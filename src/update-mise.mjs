#!/usr/bin/env zx

async function isCommandInstalled(command) {
  try {
    const { stdout, stderr } = await $`which ${command}`;
    return !stderr && !!stdout;
  } catch (e) {
    console.log(`Error checking ${command} installation:`);
    return false;
  }
}


async function updateMise() {
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

await updateMise();
