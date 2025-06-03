#!/usr/bin/env -S deno run --allow-run

import { updateNvimScripts } from "./lib/common.ts";

if (import.meta.main) {
  await updateNvimScripts();
}