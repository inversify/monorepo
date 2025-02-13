#!/usr/bin/env node

const MS_PER_SCENARIO: number = 1000;
const FIXED_DECIMALS: number = 3;

import { Bench, Task } from 'tinybench';

import { buildBenchmark } from '../benchmark/calculations/buildBenchmark';
import { Inversify6GetComplexServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInSingletonScope';
import { Inversify6GetComplexServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetComplexServiceInTransientScope';
import { Inversify6GetServiceInSingletonScope } from '../scenario/Inversify6/Inversify6GetServiceInSingletonScope';
import { Inversify6GetServiceInTransientScope } from '../scenario/Inversify6/Inversify6GetServiceInTransientScope';
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
        new NestCoreGetServiceInSingletonScopeScenario(),
        new TsyringeGetServiceInSingletonScope(),
      ],
    });

    await benchmark.run();

    printResults(benchmark);
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
        new NestCoreGetServiceInTransientScopeScenario(),
        new TsyringeGetServiceInTransientScope(),
      ],
    });

    await benchmark.run();

    printResults(benchmark);
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
        new NestCoreGetComplexServiceInSingletonScopeScenario(),
        new TsyringeGetComplexServiceInSingletonScope(),
      ],
    });

    await benchmark.run();

    printResults(benchmark);
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
        new Inversify6GetComplexServiceInTransientScope(),
        new NestCoreGetComplexServiceInTransientScopeScenario(),
        new TsyringeGetComplexServiceInTransientScope(),
      ],
    });

    await benchmark.run();

    printResults(benchmark);
  }
}

function printResults(benchmark: Bench): void {
  console.log(benchmark.name);
  console.table(benchmark.table());

  const [
    inversifyCurrentTask,
    inversify6Task,
    nestCoreTask,
    tsyringeTask,
  ]: Task[] = benchmark.tasks;

  const inversifyCurrentMean: number | undefined =
    inversifyCurrentTask?.result?.throughput.mean;
  const inversify6Mean: number | undefined =
    inversify6Task?.result?.throughput.mean;
  const nestCoreMean: number | undefined =
    nestCoreTask?.result?.throughput.mean;
  const tsyringeMean: number | undefined =
    tsyringeTask?.result?.throughput.mean;

  if (
    inversifyCurrentMean !== undefined &&
    inversify6Mean !== undefined &&
    nestCoreMean !== undefined &&
    tsyringeMean !== undefined
  ) {
    const inversify6Speedup: number = inversifyCurrentMean / inversify6Mean;
    const nestCoreSpeedup: number = inversifyCurrentMean / nestCoreMean;
    const tsyringeSpeedup: number = inversifyCurrentMean / tsyringeMean;

    console.log(
      `Current inversify vs inversify 6 Speedup: ${inversify6Speedup.toFixed(FIXED_DECIMALS)}x`,
    );
    console.log(
      `Current inversify vs NestJS Core Speedup: ${nestCoreSpeedup.toFixed(FIXED_DECIMALS)}x`,
    );
    console.log(
      `Current inversify vs tsyringe Speedup: ${tsyringeSpeedup.toFixed(FIXED_DECIMALS)}x\n`,
    );
  }
}
