#!/usr/bin/env node
'use strict';

const run = require('../lib/cjs/index.js').run;

console.log('[CJS] Running benchmarks...\n');

void run();
