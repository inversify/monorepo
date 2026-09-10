import { ApiStyle } from '../../models/ApiStyle.js';
import { generateStatusV1FromStatusBuilderSource } from '../calculations/generateStatusV1FromStatusBuilderSource.js';

export class StatusV1FromStatusBuilderSourceFixtures {
  public static get any(): string {
    return StatusV1FromStatusBuilderSourceFixtures.withApiStyleCodeFirst;
  }

  public static get withApiStyleCodeFirst(): string {
    return generateStatusV1FromStatusBuilderSource(ApiStyle.codeFirst);
  }

  public static get withApiStyleSchemaFirst(): string {
    return generateStatusV1FromStatusBuilderSource(ApiStyle.schemaFirst);
  }
}
