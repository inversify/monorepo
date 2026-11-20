import { type TransportDeclaration } from '@inversifyjs/framework-cqrs';

import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { type Amqp1Dot0TransportParams } from '../models/Amqp1Dot0TransportParams.js';

export function isAmqp1Dot0TransportDeclaration(
  declaration: TransportDeclaration,
): declaration is TransportDeclaration & Amqp1Dot0TransportParams {
  const candidate: Partial<Amqp1Dot0TransportParams> & TransportDeclaration =
    declaration;

  return (
    candidate.identifier === amqp1Dot0TransportIdentifier &&
    typeof candidate.address === 'string' &&
    candidate.address !== '' &&
    (typeof candidate.connectionIdentifier === 'string' ||
      typeof candidate.connectionIdentifier === 'symbol')
  );
}
