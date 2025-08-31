import { K6Metrics } from './K6Metrics';

export interface K6Summary {
  name: string;
  metrics: K6Metrics;
}
