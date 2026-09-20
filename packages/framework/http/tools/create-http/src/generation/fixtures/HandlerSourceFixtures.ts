import { generateHandlerSource } from '../calculations/generateHandlerSource.js';

export class HandlerSourceFixtures {
  public static get any(): string {
    return generateHandlerSource();
  }
}
