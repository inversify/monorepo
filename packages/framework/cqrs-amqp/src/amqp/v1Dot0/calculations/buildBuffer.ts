// rhea copies binaries with Buffer methods, which plain Uint8Arrays lack.
export function buildBuffer(bytes: Uint8Array): Buffer {
  return Buffer.isBuffer(bytes)
    ? bytes
    : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
