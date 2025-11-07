import { Multipart } from '@fastify/multipart';
import { Body, Controller, Post } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';

@Controller('/warriors')
export class WarriorsPostMultipartBodyFastifyController {
  @Post()
  public async createWarrior(
    @Body() body: AsyncIterableIterator<Multipart> | undefined,
  ): Promise<WarriorCreationResponse> {
    const formData: Record<string, string | string[]> =
      await this.#reduceMultipartBody(body);

    return {
      damage: 10,
      health: 100,
      name: formData['name'] as string,
      range: 1,
      speed: 10,
      type: formData['type'] as WarriorCreationResponseType,
    };
  }

  async #reduceMultipartBody(
    body: AsyncIterableIterator<Multipart> | undefined,
  ): Promise<Record<string, string | string[]>> {
    const formData: Record<string, string | string[]> = {};

    if (body !== undefined) {
      for await (const field of body) {
        let decodedData: string;

        if (field.type === 'file') {
          decodedData = (await field.toBuffer()).toString();
        } else {
          decodedData = field.value as string;
        }

        const existingValue: string | string[] | undefined =
          formData[field.fieldname];

        if (existingValue === undefined) {
          formData[field.fieldname] = decodedData;
        } else {
          if (Array.isArray(existingValue)) {
            existingValue.push(decodedData);
          } else {
            formData[field.fieldname] = [existingValue, decodedData];
          }
        }
      }
    }

    return formData;
  }
}
