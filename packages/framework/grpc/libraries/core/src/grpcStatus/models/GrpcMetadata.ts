import { type Buffer } from 'node:buffer';

export type GrpcMetadata = Record<string, string | Buffer>;
