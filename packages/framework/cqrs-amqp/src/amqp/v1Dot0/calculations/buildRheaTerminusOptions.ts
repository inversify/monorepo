import { type TerminusOptions } from 'rhea';

import { type Amqp1Dot0Terminus } from '../models/Amqp1Dot0Terminus.js';
import { type Amqp1Dot0TerminusDurability } from '../models/Amqp1Dot0TerminusDurability.js';
import { type Amqp1Dot0TerminusExpiryPolicy } from '../models/Amqp1Dot0TerminusExpiryPolicy.js';
import { omitUndefined } from './omitUndefined.js';

const DURABILITY_CODES: Readonly<Record<Amqp1Dot0TerminusDurability, number>> =
  {
    configuration: 1,
    none: 0,
    unsettledState: 2,
  };

const EXPIRY_POLICIES: Readonly<Record<Amqp1Dot0TerminusExpiryPolicy, string>> =
  {
    connectionClose: 'connection-close',
    linkDetach: 'link-detach',
    never: 'never',
    sessionEnd: 'session-end',
  };

export function buildRheaTerminusOptions(
  terminus: Amqp1Dot0Terminus | undefined,
): Omit<TerminusOptions, 'address'> {
  if (terminus === undefined) {
    return {};
  }

  return omitUndefined({
    capabilities:
      terminus.capabilities === undefined
        ? undefined
        : [...terminus.capabilities],
    durable:
      terminus.durable === undefined
        ? undefined
        : DURABILITY_CODES[terminus.durable],
    expiry_policy:
      terminus.expiryPolicy === undefined
        ? undefined
        : EXPIRY_POLICIES[terminus.expiryPolicy],
    timeout: terminus.timeout,
  });
}
