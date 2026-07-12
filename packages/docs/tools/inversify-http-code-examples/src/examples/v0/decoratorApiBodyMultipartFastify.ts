import { Multipart } from '@fastify/multipart';
import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface UploadResult {
  fileName: string;
  username: string;
}

// Begin-example
@Controller('/uploads')
export class BodyMultipartFastifyController {
  @Post()
  public async uploadFile(
    @Body() body: AsyncIterableIterator<Multipart> | undefined,
  ): Promise<UploadResult> {
    let fileName: string = '';
    let username: string = '';

    if (body !== undefined) {
      for await (const field of body) {
        if (field.type === 'file') {
          await field.toBuffer();
          fileName = field.filename;
        } else if (field.fieldname === 'username') {
          username = field.value as string;
        }
      }
    }

    return { fileName, username };
  }
}
