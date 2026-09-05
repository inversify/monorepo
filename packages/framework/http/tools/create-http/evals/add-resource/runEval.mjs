import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evalRoot = path.dirname(fileURLToPath(import.meta.url));
const allowedAgents = new Set(['codex', 'cursor', 'opencode']);
const agent = process.env.EVAL_AGENT ?? 'opencode';

if (!allowedAgents.has(agent)) {
  throw new Error(
    `Unknown EVAL_AGENT="${agent}". Expected one of: ${[...allowedAgents].join(', ')}.`,
  );
}

const require = createRequire(import.meta.url);
const promptfooEntry = require.resolve('promptfoo');
const promptfooBin = path.join(path.dirname(promptfooEntry), 'entrypoint.js');

if (!existsSync(promptfooBin)) {
  throw new Error(
    `promptfoo CLI was not found next to ${promptfooEntry}.`,
  );
}

const providerPath =
  agent === 'cursor'
    ? path.join(evalRoot, 'providers', 'cursorProvider.mjs')
    : path.join(evalRoot, 'providers', `${agent}.yaml`);

const child = spawn(
  process.execPath,
  [
    promptfooBin,
    'eval',
    '-c',
    path.join(evalRoot, 'promptfooconfig.yaml'),
    '--providers',
    `file://${providerPath}`,
    '--no-cache',
    '--max-concurrency',
    '1',
    ...process.argv.slice(2),
  ],
  {
    cwd: evalRoot,
    env: {
      ...process.env,
      PROMPTFOO_CONFIG_DIR: path.join(evalRoot, 'results', '.promptfoo'),
    },
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
