import { type StandardSchemaV1 } from '@standard-schema/spec';

import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigValidator } from '../models/ConfigValidator.js';
import { InversifyConfigError } from '../models/InversifyConfigError.js';
import { isStandardSchemaV1 } from './isStandardSchemaV1.js';

export async function validateConfig<TConfig>(
  input: ConfigObject,
  validate: ConfigValidator<TConfig> | StandardSchemaV1<TConfig>,
): Promise<TConfig> {
  if (isStandardSchemaV1<TConfig>(validate)) {
    const result: StandardSchemaV1.Result<TConfig> =
      await validate['~standard'].validate(input);

    if (result.issues !== undefined) {
      throw new InversifyConfigError(
        result.issues
          .map((issue: StandardSchemaV1.Issue) => issue.message)
          .join('\n'),
      );
    }

    return result.value;
  }

  return validate.validate(input);
}
