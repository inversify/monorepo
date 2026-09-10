import { ApiStyle } from '../../models/ApiStyle.js';
import { createStatusControllerSourceModel } from '../calculations/createStatusControllerSourceModel.js';
import { generateStatusControllerSource } from '../calculations/generateStatusControllerSource.js';

export class StatusControllerSourceFixtures {
  public static get any(): string {
    return StatusControllerSourceFixtures.withApiStyleCodeFirst;
  }

  public static get withApiStyleCodeFirst(): string {
    return generateStatusControllerSource(
      createStatusControllerSourceModel(ApiStyle.codeFirst),
    );
  }

  public static get withApiStyleSchemaFirst(): string {
    return generateStatusControllerSource(
      createStatusControllerSourceModel(ApiStyle.schemaFirst),
    );
  }
}
