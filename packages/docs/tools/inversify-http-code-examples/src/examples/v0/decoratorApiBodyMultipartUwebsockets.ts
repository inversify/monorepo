import { TextDecoder } from 'node:util';

import { Body, Controller, Post } from '@inversifyjs/http-core';

// Note: When using uWebSockets.js with multipart/form-data, you need:
// import { MultipartField } from 'uWebSockets.js';

export interface UploadResult {
  fileName: string;
  username: string;
}

// Begin-example
@Controller('/uploads')
export class BodyMultipartUwebsocketsController {
  @Post()
  public async uploadFile(
    // Type would be: MultipartField[] | undefined
    @Body() body: unknown[] | undefined,
  ): Promise<UploadResult> {
    // With uWebSockets.js, multipart/form-data is parsed into an array of MultipartField objects
    let fileName: string = '';
    let username: string = '';

    if (body !== undefined) {
      const textDecoder: TextDecoder = new TextDecoder();

      for (const field of body) {
        const multipartField: {
          name: string;
          filename?: string;
          data: Uint8Array;
        } = field as {
          name: string;
          filename?: string;
          data: Uint8Array;
        };

        if (multipartField.filename !== undefined) {
          fileName = multipartField.filename;
        } else if (multipartField.name === 'username') {
          username = textDecoder.decode(multipartField.data);
        }
      }
    }

    return { fileName, username };
  }
}
