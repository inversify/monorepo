import { OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Response(
  response: OpenApi3Dot1ResponseObject,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {};
}
