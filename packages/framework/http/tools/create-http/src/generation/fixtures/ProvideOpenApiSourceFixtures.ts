import { ApiStyle } from '../../models/ApiStyle.js';
import { createProvideOpenApiSourceModel } from '../calculations/createProvideOpenApiSourceModel.js';
import { generateProvideOpenApiSource } from '../calculations/generateProvideOpenApiSource.js';

export class ProvideOpenApiSourceFixtures {
  public static get any(): string {
    return ProvideOpenApiSourceFixtures.withApiStyleCodeFirst;
  }

  public static get withApiStyleCodeFirst(): string {
    return generateProvideOpenApiSource(
      createProvideOpenApiSourceModel(ApiStyle.codeFirst),
    );
  }

  public static get withApiStyleSchemaFirst(): string {
    return generateProvideOpenApiSource(
      createProvideOpenApiSourceModel(ApiStyle.schemaFirst),
    );
  }
}
