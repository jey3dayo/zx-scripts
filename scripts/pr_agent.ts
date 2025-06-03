#!/usr/bin/env -S deno run --allow-run --allow-env

const [PR_URL, ACTION] = Deno.args;

if (!PR_URL) {
  console.error("Error: PR_URL is required.");
  console.log("Usage: <PR_URL> [ACTION]");
  Deno.exit(1);
}

const ALLOWED_ACTIONS = ["review", "describe", "improve", "update_changelog"];

if (ACTION && !ALLOWED_ACTIONS.includes(ACTION)) {
  console.error(`Invalid action: ${ACTION}`);
  console.error(`Allowed actions: ${ALLOWED_ACTIONS.join(", ")}`);
  Deno.exit(1);
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

if (!OPENAI_API_KEY || !GITHUB_TOKEN) {
  console.error("Missing environment variables: OPENAI_API_KEY, GITHUB_TOKEN");
  Deno.exit(1);
}

const DOCKER_IMAGE = "codiumai/pr-agent:latest";

async function runPrAgent(): Promise<void> {
  const args = [
    "run",
    "--rm",
    "-it",
    `-e`,
    `OPENAI.KEY=${OPENAI_API_KEY}`,
    `-e`,
    `GITHUB.USER_TOKEN=${GITHUB_TOKEN}`,
    DOCKER_IMAGE,
    "--pr_url",
    PR_URL,
  ];

  if (ACTION) {
    args.push(ACTION);
  }

  const process = new Deno.Command("docker", {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });

  const result = await process.output();
  if (!result.success) {
    Deno.exit(result.code);
  }
}

if (import.meta.main) {
  await runPrAgent();
}
