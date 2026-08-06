import { runMain } from 'citty';

import { createHttpCommand } from './createHttpCommand.js';

export async function runCreateHttp(rawArgs?: string[]): Promise<void> {
  if (rawArgs === undefined) {
    await runMain(createHttpCommand);
    return;
  }

  await runMain(createHttpCommand, { rawArgs });
}
