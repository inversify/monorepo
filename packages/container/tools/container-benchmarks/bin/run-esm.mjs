#!/usr/bin/env node
'use strict';

import { run } from '../lib/esm/bin/run.js';

console.log('[ESM] Running benchmarks...\n');

await run();
