import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';

export const errorTracesReaderService: symbol = Symbol(
  'ErrorTracesReaderService',
);

export interface ErrorTracesReader {
  read(error: unknown): Promise<readonly ErrorTrace[] | null>;
}
