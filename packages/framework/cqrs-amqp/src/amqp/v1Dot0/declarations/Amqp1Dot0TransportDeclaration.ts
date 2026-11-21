import { type TransportDeclaration } from '@inversifyjs/framework-cqrs';

import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { type Amqp1Dot0TransportParams } from '../models/Amqp1Dot0TransportParams.js';

export class Amqp1Dot0TransportDeclaration implements TransportDeclaration {
  public readonly address: string;
  public readonly connectionIdentifier: string | symbol;
  public readonly identifier: symbol;

  constructor(params: Amqp1Dot0TransportParams) {
    if (params.address === '') {
      throw new Error('AMQP 1.0 address must be a non-empty string');
    }

    this.address = params.address;
    this.connectionIdentifier = params.connectionIdentifier;
    this.identifier = amqp1Dot0TransportIdentifier;
  }
}
