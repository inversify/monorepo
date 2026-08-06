import { generateStatusResponseSource } from '../calculations/generateStatusResponseSource.js';

export class StatusResponseSourceFixtures {
  public static get any(): string {
    return generateStatusResponseSource();
  }
}
