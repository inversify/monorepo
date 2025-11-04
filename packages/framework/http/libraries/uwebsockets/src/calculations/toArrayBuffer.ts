/**
 * Converts a Node.js Buffer or string to an ArrayBuffer.
 *
 * This function handles both Buffer and string inputs (as Readable streams
 * in non-object mode can emit either type). For Buffers, it extracts the
 * underlying ArrayBuffer and handles the case where the Buffer's underlying
 * storage is a SharedArrayBuffer. For strings, it encodes them as UTF-8.
 *
 * @param chunk - The Node.js Buffer or string to convert
 * @returns An ArrayBuffer containing the chunk's data
 */
export function toArrayBuffer(chunk: Buffer | string): ArrayBuffer {
  const buffer: Buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;

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
