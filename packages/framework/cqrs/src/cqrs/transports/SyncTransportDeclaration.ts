import { type TransportDeclaration } from '../models/TransportDeclaration.js';
import { syncTransportIdentifier } from './SyncTransportProvider.js';

export class SyncTransportDeclaration implements TransportDeclaration {
  public readonly identifier: symbol;

  constructor() {
    this.identifier = syncTransportIdentifier;
  }
}
