import { generateBuilderSource } from '../calculations/generateBuilderSource.js';

export class BuilderSourceFixtures {
  public static get any(): string {
    return generateBuilderSource();
  }
}
