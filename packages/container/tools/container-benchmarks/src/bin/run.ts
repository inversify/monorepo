#!/usr/bin/env node

const MS_PER_SCENARIO: number = 1000;

import {
  buildBenchmark,
  printBenchmarkResults,
} from '@inversifyjs/benchmark-utils';
import { type Bench } from 'tinybench';

import { AwilixGetComplexServiceInSingletonScope } from '../scenario/awilix/AwilixGetComplexServiceInSingletonScope.js';
import { AwilixGetComplexServiceInTransientScope } from '../scenario/awilix/AwilixGetComplexServiceInTransientScope.js';
import { AwilixGetServiceInSingletonScope } from '../scenario/awilix/AwilixGetServiceInSingletonScope.js';
import { AwilixGetServiceInTransientScope } from '../scenario/awilix/AwilixGetServiceInTransientScope.js';
import { Inversify6GetComplexServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInSingletonScope.js';
import { Inversify6GetComplexServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInTransientScope.js';
import { Inversify6GetServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetServiceInSingletonScope.js';
import { Inversify6GetServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetServiceInTransientScope.js';
import { Inversify7GetComplexServiceInSingletonScope } from '../scenario/Inversify7/Inversify7GetComplexServiceInSingletonScope.js';
import { Inversify7GetComplexServiceInTransientScope } from '../scenario/Inversify7/Inversify7GetComplexServiceInTransientScope.js';
import { Inversify7GetServiceInSingletonScope } from '../scenario/Inversify7/Inversify7GetServiceInSingletonScope.js';
import { Inversify7GetServiceInTransientScope } from '../scenario/Inversify7/Inversify7GetServiceInTransientScope.js';
import { Inversify8GetComplexServiceInSingletonScope } from '../scenario/inversify8/Inversify8GetComplexServiceInSingletonScope.js';
import { Inversify8GetComplexServiceInTransientScope } from '../scenario/inversify8/Inversify8GetComplexServiceInTransientScope.js';
import { Inversify8GetServiceInSingletonScope } from '../scenario/inversify8/Inversify8GetServiceInSingletonScope.js';
import { Inversify8GetServiceInTransientScope } from '../scenario/inversify8/Inversify8GetServiceInTransientScope.js';
import { InversifyCurrentGetComplexResolvedValueServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexResolvedValueServiceInTranstientScope.js';
import { InversifyCurrentGetComplexServiceInSingletonScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexServiceInSingletonScope.js';
import { InversifyCurrentGetComplexServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexServiceInTransientScope.js';
import { InversifyCurrentGetServiceInSingletonScope } from '../scenario/inversifyCurrent/InversifyCurrentGetServiceInSingletonScope.js';
import { InversifyCurrentGetServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetServiceInTransientScope.js';
import { NestCoreGetComplexServiceInSingletonScopeScenario } from '../scenario/nestCore/NestCoreGetComplexServiceInSingletonScopeScenario.js';
import { NestCoreGetComplexServiceInTransientScopeScenario } from '../scenario/nestCore/NestCoreGetComplexServiceInTransientScopeScenario.js';
import { NestCoreGetServiceInSingletonScopeScenario } from '../scenario/nestCore/NestCoreGetServiceInSingletonScopeScenario.js';
import { NestCoreGetServiceInTransientScopeScenario } from '../scenario/nestCore/NestCoreGetServiceInTransientScopeScenario.js';
import { TsyringeGetComplexServiceInSingletonScope } from '../scenario/tsyringe/TsyringeGetComplexServiceInSingletonScope.js';
import { TsyringeGetComplexServiceInTransientScope } from '../scenario/tsyringe/TsyringeGetComplexServiceInTransientScope.js';
import { TsyringeGetServiceInSingletonScope } from '../scenario/tsyringe/TsyringeGetServiceInSingletonScope.js';
import { TsyringeGetServiceInTransientScope } from '../scenario/tsyringe/TsyringeGetServiceInTransientScope.js';

export async function run(): Promise<void> {
  // Run get service in singleton scope scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Get service in singleton scope',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new InversifyCurrentGetServiceInSingletonScope(),
        new Inversify6GetServiceInSingletonScope(),
        new Inversify7GetServiceInSingletonScope(),
        new Inversify8GetServiceInSingletonScope(),
        new AwilixGetServiceInSingletonScope(),
        new NestCoreGetServiceInSingletonScopeScenario(),
        new TsyringeGetServiceInSingletonScope(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }

  // Run get service in transient scope scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Get service in transient scope',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new InversifyCurrentGetServiceInTransientScope(),
        new Inversify6GetServiceInTransientScope(),
        new Inversify7GetServiceInTransientScope(),
        new Inversify8GetServiceInTransientScope(),
        new AwilixGetServiceInTransientScope(),
        new NestCoreGetServiceInTransientScopeScenario(),
        new TsyringeGetServiceInTransientScope(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }

  // Run get complex service in singleton scope scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Get complex service in singleton scope',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new InversifyCurrentGetComplexServiceInSingletonScope(),
        new Inversify6GetComplexServiceInSingletonScope(),
        new Inversify7GetComplexServiceInSingletonScope(),
        new Inversify8GetComplexServiceInSingletonScope(),
        new AwilixGetComplexServiceInSingletonScope(),
        new NestCoreGetComplexServiceInSingletonScopeScenario(),
        new TsyringeGetComplexServiceInSingletonScope(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }

  // Run get complex service in transient scope scenarios
  {
    const benchmark: Bench = buildBenchmark({
      benchOptions: {
        name: 'Get complex service in transient scope',
        time: MS_PER_SCENARIO,
      },
      scenarios: [
        new InversifyCurrentGetComplexServiceInTransientScope(),
        new InversifyCurrentGetComplexResolvedValueServiceInTransientScope(),
        new Inversify6GetComplexServiceInTransientScope(),
        new Inversify7GetComplexServiceInTransientScope(),
        new Inversify8GetComplexServiceInTransientScope(),
        new AwilixGetComplexServiceInTransientScope(),
        new NestCoreGetComplexServiceInTransientScopeScenario(),
        new TsyringeGetComplexServiceInTransientScope(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }
}
