import { Pipe, PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class ClassValidationPipe implements Pipe {
  public async execute(
    input: unknown,
    metadata: PipeMetadata,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const inputType: Function | undefined = getOwnReflectMetadata<Function[]>(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      metadata.targetClass.prototype,
      'design:paramtypes',
      metadata.methodName,
    )?.[metadata.parameterIndex];

    if (inputType === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.invalidConfiguration,
        `Param type metadata for ${metadata.targetClass.name}.${metadata.methodName.toString()}[${metadata.parameterIndex.toString()}] is not defined. Are you enabling "emitDecoratorMetadata" and "experimentalDecorators" Typescript compiler options?`,
      );
    }

    const instance: object = plainToInstance(
      inputType as ClassConstructor<object>,
      input,
    );

    const validationResult: ValidationError[] = await validate(instance, {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      stopAtFirstError: false,
      whitelist: true,
    });

    if (validationResult.length > 0) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        validationResult
          .map((error: ValidationError) => error.toString(false, false))
          .join('\n'),
      );
    }

    return instance;
  }
}
