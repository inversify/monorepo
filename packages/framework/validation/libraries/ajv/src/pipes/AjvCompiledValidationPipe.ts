import { isPromise } from '@inversifyjs/common';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import Ajv, { AnySchema, ValidateFunction } from 'ajv';

import { stringifyAjvErrors } from '../calculations/stringifyAjvErrors';
import { AjvValidationPipe } from './AjvValidationPipe';

export class AjvCompiledValidationPipe extends AjvValidationPipe {
  protected override async _validate(
    schema: AnySchema,
    input: unknown,
  ): Promise<void> {
    if (typeof schema === 'boolean') {
      return super._validate(schema, input);
    }

    if (schema.$id === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.invalidConfiguration,
        'Schema must have an $id property when using AjvCompiledValidationPipe',
      );
    }

    const validateFunction: ValidateFunction<unknown> | undefined =
      this._ajv.getSchema(schema.$id) ??
      this._ajv.addSchema(schema, schema.$id).getSchema(schema.$id);

    if (validateFunction === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.unknown,
        `Unexpected missing schema after being added to Ajv instance: ${schema.$id}`,
      );
    }

    const result: boolean | Promise<unknown> = validateFunction(input);

    if (!isPromise(result)) {
      if (result) {
        return;
      }

      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        stringifyAjvErrors(validateFunction.errors ?? []),
      );
    }

    try {
      await this._ajv.validate(schema, input);
    } catch (error: unknown) {
      if (error instanceof Ajv.ValidationError) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          stringifyAjvErrors(error.errors),
        );
      }
    }
  }
}
