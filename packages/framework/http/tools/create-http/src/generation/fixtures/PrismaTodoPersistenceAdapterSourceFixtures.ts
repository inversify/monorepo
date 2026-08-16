import { generatePrismaTodoPersistenceAdapterSource } from '../calculations/generatePrismaTodoPersistenceAdapterSource.js';

export class PrismaTodoPersistenceAdapterSourceFixtures {
  public static get any(): string {
    return generatePrismaTodoPersistenceAdapterSource();
  }
}
