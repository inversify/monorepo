import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface UploadResult {
  fileName: string;
  username: string;
}

// Begin-example
@Controller('/uploads')
export class BodyMultipartHonoController {
  @Post()
  public async uploadFile(@Body() body: FormData): Promise<UploadResult> {
    // With Hono, multipart/form-data is automatically parsed into FormData
    const file: File | string | null = body.get('file');
    const fileName: string = file instanceof File ? file.name : '';
    const username: string = (body.get('username') as string | null) ?? '';

    return { fileName, username };
  }
}
