/**
 * An AMQP 1.0 message id: a `string`, a `ulong`, or a `binary`. Received
 * `uuid` ids are 16-byte binaries.
 */
export type Amqp1Dot0MessageId = number | string | Uint8Array;
