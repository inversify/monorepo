import { generateStatusV1FromStatusBuilderSource } from '../calculations/generateStatusV1FromStatusBuilderSource.js';

export class StatusV1FromStatusBuilderSourceFixtures {
  public static get any(): string {
    return generateStatusV1FromStatusBuilderSource();
  }
}
