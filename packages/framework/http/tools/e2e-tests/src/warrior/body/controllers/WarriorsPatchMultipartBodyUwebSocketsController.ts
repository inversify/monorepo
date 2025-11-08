import { TextDecoder } from 'node:util';

import { Body, Controller, Patch } from '@inversifyjs/http-core';
import { MultipartField } from 'uWebSockets.js';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';

@Controller('/warriors')
export class WarriorsPatchMultipartBodyUwebSocketsController {
  @Patch()
  public async updateWarrior(
    @Body() body: MultipartField[] | undefined,
  ): Promise<WarriorCreationResponse> {
    const formData: Record<string, string | string[]> =
      this.#reduceMultipartBody(body);

    return {
      damage: 10,
      health: 100,
      name: formData['name'] as string,
      range: 1,
      speed: 10,
      type: formData['type'] as WarriorCreationResponseType,
    };
  }

  #reduceMultipartBody(
    body: MultipartField[] | undefined,
  ): Record<string, string | string[]> {
    const textDecoder: TextDecoder = new TextDecoder();
    return (body ?? []).reduce(
      (
        formData: Record<string, string | string[]>,
        field: MultipartField,
      ): Record<string, string | string[]> => {
        const decodedData: string = textDecoder.decode(field.data);

        const existingValue: string | string[] | undefined =
          formData[field.name];

        if (existingValue === undefined) {
          formData[field.name] = decodedData;
        } else {
          if (Array.isArray(existingValue)) {
            existingValue.push(decodedData);
          } else {
            formData[field.name] = [existingValue, decodedData];
          }
        }

        return formData;
      },
      {},
    );
  }
}
