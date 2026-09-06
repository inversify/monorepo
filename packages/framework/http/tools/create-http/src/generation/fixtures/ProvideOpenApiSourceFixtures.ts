import { generateProvideOpenApiSource } from '../calculations/generateProvideOpenApiSource.js';

export class ProvideOpenApiSourceFixtures {
  public static get any(): string {
    return generateProvideOpenApiSource();
  }
}
