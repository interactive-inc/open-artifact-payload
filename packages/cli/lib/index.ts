#!/usr/bin/env bun

import { runCli } from "./run-cli"
import { readHiddenSecret } from "./read-hidden-secret"

const exitCode = await runCli({
  argv: process.argv.slice(2),
  env: process.env,
  fetchPort: async (input, init) => await fetch(input, init),
  io: {
    writeOutput: (value) => process.stdout.write(value),
    writeError: (value) => process.stderr.write(value),
    readSecret: async (prompt) => await readHiddenSecret(prompt),
  },
})

process.exitCode = exitCode
