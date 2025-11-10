import { Body, Controller, Post } from '@inversifyjs/http-core';

// Note: When using Fastify with multipart/form-data, you need:
// import { Multipart } from '@fastify/multipart';

export interface UploadResult {
  fileName: string;
  username: string;
}

// Begin-example
@Controller('/uploads')
export class BodyMultipartFastifyController {
  @Post()
  public async uploadFile(
    // Type would be: AsyncIterableIterator<Multipart> | undefined
    @Body() body: AsyncIterableIterator<unknown> | undefined,
  ): Promise<UploadResult> {
    // With Fastify, multipart/form-data returns an async iterator of Multipart objects
    // when useMultipartFormData option is enabled
    let fileName: string = '';
    let username: string = '';

    if (body !== undefined) {
      for await (const field of body) {
        const multipartField: {
          fieldname: string;
          filename: string;
          type: string;
          value: unknown;
        } = field as {
          fieldname: string;
          filename: string;
          type: string;
          value: unknown;
        };

        if (multipartField.type === 'file') {
          fileName = multipartField.filename;
        } else if (multipartField.fieldname === 'username') {
          username = multipartField.value as string;
        }
      }
    }

    return { fileName, username };
  }
}
