import { Buffer } from 'node:buffer';

/**
 * Converts a Node.js Buffer or string to an ArrayBuffer.
 *
 * This function handles both Buffer and string inputs (as Readable streams
 * in non-object mode can emit either type). For Buffers, it extracts the
 * underlying ArrayBuffer and handles the case where the Buffer's underlying
 * storage is a SharedArrayBuffer. For strings, it encodes them as UTF-8.
 *
 * @param chunk - The Node.js Buffer or string to convert. In object mode, this can be any type.
 * @returns An ArrayBuffer containing the chunk's data
 */
export function toArrayBuffer(chunk: unknown): ArrayBuffer {
  const buffer: Buffer =
    typeof chunk === 'string'
      ? Buffer.from(chunk)
      : Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-function-type
            (chunk as bigint | boolean | Function | number | object).toString(),
          );

  const arrayBuffer: ArrayBuffer | SharedArrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  if (arrayBuffer instanceof SharedArrayBuffer) {
    const newArrayBuffer: ArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);

    new Uint8Array(newArrayBuffer).set(new Uint8Array(arrayBuffer));

    return newArrayBuffer;
  }

  return arrayBuffer;
}
