import { generateStatusContainerModuleSource } from '../calculations/generateStatusContainerModuleSource.js';

export class StatusContainerModuleSourceFixtures {
  public static get any(): string {
    return generateStatusContainerModuleSource();
  }
}
