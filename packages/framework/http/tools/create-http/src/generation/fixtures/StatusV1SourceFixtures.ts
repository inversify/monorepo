import { generateStatusV1Source } from '../calculations/generateStatusV1Source.js';

export class StatusV1SourceFixtures {
  public static get any(): string {
    return generateStatusV1Source();
  }
}
