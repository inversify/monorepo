import { type RecognizedString } from 'uWebSockets.js';

export function stringifyRecognizedString(value: RecognizedString): string {
  if (typeof value === 'string') {
    return value;
  }

  if (ArrayBuffer.isView(value)) {
    return Buffer.from(
      value.buffer,
      value.byteOffset,
      value.byteLength,
    ).toString();
  }

  return Buffer.from(value).toString();
}
