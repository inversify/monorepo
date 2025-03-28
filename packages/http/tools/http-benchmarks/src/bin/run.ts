#!/usr/bin/env node

const MS_PER_SCENARIO: number = 2000;

import {
  buildBenchmark,
  printBenchmarkResults,
} from '@inversifyjs/benchmark-utils';
import { Bench } from 'tinybench';

import { CurrentInversifyExpressBasicGetScenario } from '../scenario/currentInversifyExpress/CurrentInversifyExpressBasicGetScenario';
import { CurrentInversifyHonoBasicGetScenario } from '../scenario/currentInversifyHono/CurrentInversifyHonoBasicGetScenario';
import { ExpressBasicGetScenario } from '../scenario/express/ExpressBasicGetScenario';
import { FastifyBasicGetScenario } from '../scenario/fastify/FastifyBasicGetScenario';
import { HonoBasicGetScenario } from '../scenario/hono/HonoBasicGetScenario';
import { NestJsExpressBasicGetScenario } from '../scenario/nestJSExpress/NestJsExpressBasicGetScenario';
import { NestJsFastifyBasicGetScenario } from '../scenario/nestJSFastify/NestJsFastifyBasicGetScenario';

export async function run(): Promise<void> {
  // Run basic get request scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Basic Get Request',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new CurrentInversifyExpressBasicGetScenario(),
        new ExpressBasicGetScenario(),
        new FastifyBasicGetScenario(),
        new NestJsExpressBasicGetScenario(),
        new NestJsFastifyBasicGetScenario(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }

  // Run Hono basic get request scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Hono Basic Get Request',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new CurrentInversifyHonoBasicGetScenario(),
        new HonoBasicGetScenario(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }
}
