import { generateApiTypesSource } from '../calculations/generateApiTypesSource.js';

export class ApiTypesSourceFixtures {
  public static get any(): string {
    return generateApiTypesSource();
  }
}
