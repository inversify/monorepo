import { beforeAll, describe, expect, it } from 'vitest';

import { type CallDetail } from './callApi.js';
import {
  formatTimelineMark,
  readTimeline,
  readTimelineMarks,
  type Timeline,
  type TimelineLane,
} from './timeline.js';

describe(readTimeline, () => {
  describe('having a request, a guard, and a later middleware', () => {
    describe('when called', () => {
      let result: Timeline;

      beforeAll(() => {
        result = readTimeline(callWithStages());
      });

      it('should put the request span first and order stages by start', () => {
        expect(
          result.lanes.map((lane: TimelineLane) => ({
            durationMs: lane.durationMs,
            kind: lane.kind,
            label: lane.label,
            offsetMs: lane.offsetMs,
          })),
        ).toStrictEqual([
          {
            durationMs: 18,
            kind: 'request',
            label: 'POST /users',
            offsetMs: 0,
          },
          {
            durationMs: 2,
            kind: 'middleware',
            label: 'AuthMiddleware',
            offsetMs: 1,
          },
          {
            durationMs: 4,
            kind: 'guard',
            label: 'AuthGuard',
            offsetMs: 2,
          },
        ]);
        expect(result.totalMs).toBe(18);
      });
    });
  });
});

describe(readTimelineMarks, () => {
  describe('having an 18 millisecond span', () => {
    describe('when called', () => {
      let result: readonly number[];

      beforeAll(() => {
        result = readTimelineMarks(18);
      });

      it('should include the start, regular steps, and the end', () => {
        expect(result).toStrictEqual([0, 5, 10, 15, 18]);
      });
    });
  });
});

describe(formatTimelineMark, () => {
  describe('having a sub-second mark', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = formatTimelineMark(18);
      });

      it('should label milliseconds', () => {
        expect(result).toBe('18 ms');
      });
    });
  });

  describe('having a 1.5 second mark', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = formatTimelineMark(1500);
      });

      it('should label seconds', () => {
        expect(result).toBe('1.5 s');
      });
    });
  });
});

function callWithStages(): CallDetail {
  return {
    controller: undefined,
    guards: [
      {
        allowed: true,
        durationMs: 4,
        endedAt: '2026-10-19T20:00:00.006Z',
        error: undefined,
        id: 'guard-1',
        name: 'AuthGuard',
        startedAt: '2026-10-19T20:00:00.002Z',
      },
    ],
    httpErrors: [],
    id: 'call-1',
    interceptors: [],
    middlewares: [
      {
        durationMs: 2,
        endedAt: '2026-10-19T20:00:00.003Z',
        error: undefined,
        id: 'middleware-1',
        name: 'AuthMiddleware',
        phase: 'preHandler',
        startedAt: '2026-10-19T20:00:00.001Z',
      },
    ],
    nativeMiddlewares: [],
    pipes: [],
    request: {
      headers: [],
      method: 'POST',
      startedAt: '2026-10-19T20:00:00.000Z',
      url: '/users',
    },
    response: {
      aborted: false,
      headers: [],
      sentAt: '2026-10-19T20:00:00.018Z',
      statusCode: 201,
    },
  };
}
