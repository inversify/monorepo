import { Bench, type BenchOptions } from 'tinybench';

import { type Scenario } from '../../scenario/models/Scenario.js';

interface BuildBenchmarkOptions {
  benchOptions?: BenchOptions;
  scenarios: Scenario[];
}

export function buildBenchmark(options: BuildBenchmarkOptions): Bench {
  const bench: Bench = new Bench(options.benchOptions);

  for (const scenario of options.scenarios) {
    bench.add(
      scenario.platform,
      async (): Promise<void> => {
        await scenario.execute();
      },
      {
        afterAll: async (): Promise<void> => {
          await scenario.tearDown();
        },
        beforeAll: async (): Promise<void> => {
          await scenario.setUp();
        },
      },
    );
  }

  return bench;
}
