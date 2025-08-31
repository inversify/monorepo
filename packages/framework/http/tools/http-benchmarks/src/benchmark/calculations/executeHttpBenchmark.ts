import { Scenario } from '@inversifyjs/benchmark-utils';

import { K6Summary } from '../../k6/model/K6Summary';
import { Platform } from '../../scenario/models/Platform';

export async function executeHttpBenchmark(
  scenarioList: Scenario<Platform, K6Summary>[],
): Promise<K6Summary[]> {
  const summaryList: K6Summary[] = [];

  for (const scenario of scenarioList) {
    await scenario.setUp();

    summaryList.push(await scenario.execute());

    await scenario.tearDown();
  }

  return summaryList;
}
