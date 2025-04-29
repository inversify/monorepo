import { HttpResponse } from '../../responses/HttpResponse';
import { PipeMetadata } from './PipeMetadata';

export interface Pipe<TInput = unknown, TOutput = unknown> {
  execute(input: TInput, metadata: PipeMetadata): Promise<TOutput> | TOutput;
  getHttpResponse?(error: unknown): HttpResponse;
}
