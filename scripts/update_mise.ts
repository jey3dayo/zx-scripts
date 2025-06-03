#!/usr/bin/env -S deno run --allow-run

import { updateMise } from "./lib/common.ts";

if (import.meta.main) {
  await updateMise();
}
