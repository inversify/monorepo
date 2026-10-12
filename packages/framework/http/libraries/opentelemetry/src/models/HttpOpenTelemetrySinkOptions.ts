import { type Meter, type Tracer } from '@opentelemetry/api';

export interface HttpOpenTelemetrySinkOptions {
  readonly meter?: Meter;
  readonly meterName?: string;
  readonly tracer?: Tracer;
  readonly tracerName?: string;
}
