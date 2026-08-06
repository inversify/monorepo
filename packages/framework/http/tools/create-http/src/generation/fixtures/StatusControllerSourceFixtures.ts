import { generateStatusControllerSource } from '../calculations/generateStatusControllerSource.js';

export class StatusControllerSourceFixtures {
  public static get any(): string {
    return generateStatusControllerSource();
  }
}
