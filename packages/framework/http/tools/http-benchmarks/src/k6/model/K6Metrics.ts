import { type K6MetricHttpReqDuration } from './K6MetricHttpReqDuration';
import { type K6MetricHttpReqs } from './K6MetricHttpReqs';

export interface K6Metrics {
  http_reqs: K6MetricHttpReqs;
  http_req_duration: K6MetricHttpReqDuration;
}
