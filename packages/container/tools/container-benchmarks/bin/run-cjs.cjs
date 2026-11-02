#!/usr/bin/env node
'use strict';

const run = require('../lib/cjs/bin/run.js').run;

console.log('[CJS] Running benchmarks...\n');

void run();
