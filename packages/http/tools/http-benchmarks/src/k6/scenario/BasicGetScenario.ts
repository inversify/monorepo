import { check } from 'k6';
import http, { RefinedResponse, ResponseType } from 'k6/http';
import { Options } from 'k6/options';

export const options: Options = {
  batch: 8,
  stages: [
    {
      duration: '10s',
      target: 1024,
    },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

const BASEURL: string = 'http://localhost:3000/';

export default function () {
  const response: RefinedResponse<ResponseType> = http.get(BASEURL);

  check(response, {
    'response is ok': (r: RefinedResponse<ResponseType>) => r.body === 'ok',
    'status is 200': (r: RefinedResponse<ResponseType>) => r.status === 200,
  });
}

export function handleSummary(data: string): { stdout: unknown } {
  return {
    stdout: JSON.stringify(data),
  };
}
