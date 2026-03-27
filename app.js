// Hostinger entry point — requires a .js file.
    // Spawns tsx server.ts directly, identical to npm start.
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Determine the directory of the current file and the path to the tsx binary.
const __dir = dirname(fileURLToPath(import.meta.url));
const tsx = resolve(__dir, 'node_modules', '.bin', 'tsx');

// Spawn the server process, inheriting stdio and environment variables.
const proc = spawn(tsx, ['server.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dir,
});

// Exit with the same code as the child process, or 1 if it was null/undefined.
proc.on('close', (code) => process.exit(code ?? 1));
