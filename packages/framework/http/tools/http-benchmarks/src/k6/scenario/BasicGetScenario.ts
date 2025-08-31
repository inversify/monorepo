import { check } from 'k6';
import http, { RefinedResponse, ResponseType } from 'k6/http';
import { Options } from 'k6/options';

const DEFAULT_PORT: number = 3000;
const ACCEPTED_HTTP_STATUS_CODE: number = 200;

export const options: Options = {
  batch: 8,
  stages: [
    {
      duration: '10s',
      target: Number(__ENV['VUS']),
    },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

const BASEURL: string = `http://localhost:${String(DEFAULT_PORT)}/`;

export default function () {
  const response: RefinedResponse<ResponseType> = http.get(BASEURL);

  check(response, {
    'response is ok': (r: RefinedResponse<ResponseType>) => r.body === 'ok',
    'status is 200': (r: RefinedResponse<ResponseType>) =>
      r.status === ACCEPTED_HTTP_STATUS_CODE,
  });
}

export function handleSummary(data: string): { stdout: unknown } {
  return {
    stdout: JSON.stringify(data),
  };
}
