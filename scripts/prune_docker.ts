#!/usr/bin/env -S deno run --allow-run

import { pruneDocker } from "./lib/common.ts";

if (import.meta.main) {
  await pruneDocker();
}