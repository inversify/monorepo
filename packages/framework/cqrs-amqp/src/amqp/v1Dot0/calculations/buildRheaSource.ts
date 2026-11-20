import { type Source } from 'rhea';

import { type Amqp1Dot0Filter } from '../models/Amqp1Dot0Filter.js';
import { type Amqp1Dot0Source } from '../models/Amqp1Dot0Source.js';
import { buildRheaTerminusOptions } from './buildRheaTerminusOptions.js';
import { buildRheaValue } from './buildRheaValue.js';
import { omitUndefined } from './omitUndefined.js';

function buildRheaFilters(
  filters: Readonly<Record<string, Amqp1Dot0Filter>> | undefined,
): Record<string, unknown> | undefined {
  if (filters === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(filters).map(
      ([name, filter]: [string, Amqp1Dot0Filter]): [string, unknown] => [
        name,
        buildRheaValue(filter),
      ],
    ),
  );
}

export function buildRheaSource(
  address: string,
  source: Amqp1Dot0Source | undefined,
): Source {
  return {
    ...buildRheaTerminusOptions(source),
    ...omitUndefined({
      distribution_mode: source?.distributionMode,
      filter: buildRheaFilters(source?.filters),
    }),
    address,
  };
}
