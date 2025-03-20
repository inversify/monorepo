#!/usr/bin/env node

const MS_PER_SCENARIO: number = 1000;

import {
  buildBenchmark,
  printBenchmarkResults,
} from '@inversifyjs/benchmark-utils';
import { Bench } from 'tinybench';

import { CurrentInversifyFastifyBasicGetScenario } from '../scenario/currentInversifyFastify/CurrentInversifyFastifyBasicGetScenario';
import { ExpressBasicGetScenario } from '../scenario/express/ExpressBasicGetScenario';
import { FastifyBasicGetScenario } from '../scenario/fastify/FastifyBasicGetScenario';
import { NestJsExpressBasicGetScenario } from '../scenario/nestJSExpress/NestJsExpressBasicGetScenario';
import { NestJsFastifyBasicGetScenario } from '../scenario/nestJSFastify/NestJsFastifyBasicGetScenario';

export async function run(): Promise<void> {
  // Run basic get request scenarios on express
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Basic Get Request',

        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new ExpressBasicGetScenario(),
        new NestJsExpressBasicGetScenario(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }

  // Run basic get request scenarios on fastify
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Basic Get Request',

        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new CurrentInversifyFastifyBasicGetScenario(),
        new FastifyBasicGetScenario(),
        new NestJsFastifyBasicGetScenario(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }
}
