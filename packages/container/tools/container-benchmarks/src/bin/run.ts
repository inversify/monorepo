#!/usr/bin/env node

const MS_PER_SCENARIO: number = 1000;

import {
  buildBenchmark,
  printBenchmarkResults,
} from '@inversifyjs/benchmark-utils';
import { Bench } from 'tinybench';

import { Inversify6GetComplexServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInSingletonScope';
import { Inversify6GetComplexServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInTransientScope';
import { Inversify6GetServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetServiceInSingletonScope';
import { Inversify6GetServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetServiceInTransientScope';
import { Inversify7GetComplexServiceInSingletonScope } from '../scenario/Inversify7/Inversify7GetComplexServiceInSingletonScope';
import { Inversify7GetComplexServiceInTransientScope } from '../scenario/Inversify7/Inversify7GetComplexServiceInTransientScope';
import { Inversify7GetServiceInSingletonScope } from '../scenario/Inversify7/Inversify7GetServiceInSingletonScope';
import { Inversify7GetServiceInTransientScope } from '../scenario/Inversify7/Inversify7GetServiceInTransientScope';
import { Inversify8GetComplexServiceInSingletonScope } from '../scenario/inversify8/Inversify8GetComplexServiceInSingletonScope';
import { Inversify8GetComplexServiceInTransientScope } from '../scenario/inversify8/Inversify8GetComplexServiceInTransientScope';
import { Inversify8GetServiceInSingletonScope } from '../scenario/inversify8/Inversify8GetServiceInSingletonScope';
import { Inversify8GetServiceInTransientScope } from '../scenario/inversify8/Inversify8GetServiceInTransientScope';
import { InversifyCurrentGetComplexResolvedValueServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexResolvedValueServiceInTranstientScope';
import { InversifyCurrentGetComplexServiceInSingletonScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexServiceInSingletonScope';
import { InversifyCurrentGetComplexServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetComplexServiceInTransientScope';
import { InversifyCurrentGetServiceInSingletonScope } from '../scenario/inversifyCurrent/InversifyCurrentGetServiceInSingletonScope';
import { InversifyCurrentGetServiceInTransientScope } from '../scenario/inversifyCurrent/InversifyCurrentGetServiceInTransientScope';
import { NestCoreGetComplexServiceInSingletonScopeScenario } from '../scenario/nestCore/NestCoreGetComplexServiceInSingletonScopeScenario';
import { NestCoreGetComplexServiceInTransientScopeScenario } from '../scenario/nestCore/NestCoreGetComplexServiceInTransientScopeScenario';
import { NestCoreGetServiceInSingletonScopeScenario } from '../scenario/nestCore/NestCoreGetServiceInSingletonScopeScenario';
import { NestCoreGetServiceInTransientScopeScenario } from '../scenario/nestCore/NestCoreGetServiceInTransientScopeScenario';
import { TsyringeGetComplexServiceInSingletonScope } from '../scenario/tsyringe/TsyringeGetComplexServiceInSingletonScope';
import { TsyringeGetComplexServiceInTransientScope } from '../scenario/tsyringe/TsyringeGetComplexServiceInTransientScope';
import { TsyringeGetServiceInSingletonScope } from '../scenario/tsyringe/TsyringeGetServiceInSingletonScope';
import { TsyringeGetServiceInTransientScope } from '../scenario/tsyringe/TsyringeGetServiceInTransientScope';

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
        new NestCoreGetComplexServiceInTransientScopeScenario(),
        new TsyringeGetComplexServiceInTransientScope(),
      ],
    });

    await benchmark.run();

    printBenchmarkResults(benchmark);
  }
}
