#!/usr/bin/env node

import { Scenario } from '@inversifyjs/benchmark-utils';

import { executeHttpBenchmark } from '../benchmark/calculations/executeHttpBenchmark';
import { printHttpBenchmarkResults } from '../benchmark/calculations/printHttpBenchmarkResults';
import { K6Summary } from '../k6/model/K6Summary';
import { CurrentInversifyExpressBasicGetScenario } from '../scenario/currentInversifyExpress/CurrentInversifyExpressBasicGetScenario';
import { ExpressBasicGetScenario } from '../scenario/express/ExpressBasicGetScenario';
import { FastifyBasicGetScenario } from '../scenario/fastify/FastifyBasicGetScenario';
import { Platform } from '../scenario/models/Platform';
import { NestJsExpressBasicGetScenario } from '../scenario/nestJSExpress/NestJsExpressBasicGetScenario';
import { NestJsFastifyBasicGetScenario } from '../scenario/nestJSFastify/NestJsFastifyBasicGetScenario';

export async function run(): Promise<void> {
  // Run express basic get request scenarios
  {
    const scenarioList: Scenario<Platform, K6Summary>[] = [
      new CurrentInversifyExpressBasicGetScenario(),
      new ExpressBasicGetScenario(),
      new NestJsExpressBasicGetScenario(),
    ];

    const summaryList: K6Summary[] = await executeHttpBenchmark(scenarioList);

    printHttpBenchmarkResults('Express Basic Get Request', summaryList);
  }

  // Run fastify basic get request scenarios
  {
    const scenarioList: Scenario<Platform, K6Summary>[] = [
      new FastifyBasicGetScenario(),
      new NestJsFastifyBasicGetScenario(),
    ];

    const summaryList: K6Summary[] = await executeHttpBenchmark(scenarioList);

    printHttpBenchmarkResults('Fastify Basic Get Request', summaryList);
  }
}
