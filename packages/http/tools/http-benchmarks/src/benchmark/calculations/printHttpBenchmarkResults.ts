import { K6Summary } from '../../k6/model/K6Summary';

const FIXED_DECIMALS: number = 3;

export function printHttpBenchmarkResults(
  name: string,
  summaryList: K6Summary[],
): void {
  console.log(name);
  console.table(
    summaryList.map((summary: K6Summary) => ({
      'Latency avg (ms)':
        summary.metrics.http_req_duration.values.avg.toFixed(FIXED_DECIMALS),
      'Latency med (ms)':
        summary.metrics.http_req_duration.values.med.toFixed(FIXED_DECIMALS),
      Samples: summary.metrics.http_reqs.values.count,
      'Task name': summary.name,
      'Throughput avg (req/s)':
        summary.metrics.http_reqs.values.rate.toFixed(FIXED_DECIMALS),
    })),
    [
      'Task name',
      'Latency avg (ms)',
      'Latency med (ms)',
      'Throughput avg (req/s)',
      'Samples',
    ],
  );

  const referenceMean: number | undefined =
    summaryList[0]?.metrics.http_reqs.values.rate;
  const referenceName: string | undefined = summaryList[0]?.name;

  if (referenceMean !== undefined && referenceName !== undefined) {
    for (const summary of summaryList.slice(1)) {
      const mean: number = summary.metrics.http_reqs.values.rate;

      const speedup: number = referenceMean / mean;

      console.log(
        `${referenceName} vs ${summary.name} Speedup: ${speedup.toFixed(FIXED_DECIMALS)}x`,
      );
    }
  }
  console.log();
}
