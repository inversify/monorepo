import { beforeAll, describe, expect, it } from 'vitest';

import {
  readTimelineTarget,
  type TimelineTarget,
} from './readTimelineTarget.js';
import { type TimelineLane } from './timeline.js';

describe(readTimelineTarget, () => {
  describe('having a guard lane', () => {
    describe('when called', () => {
      let result: TimelineTarget;

      beforeAll(() => {
        result = readTimelineTarget(lane('guard', 'guard-guard-1'));
      });

      it('should open that guard', () => {
        expect(result).toStrictEqual({
          section: 'guards',
          stageId: 'guard-guard-1',
        });
      });
    });
  });

  describe('having a request lane', () => {
    describe('when called', () => {
      let result: TimelineTarget;

      beforeAll(() => {
        result = readTimelineTarget(lane('request', 'request-call-1'));
      });

      it('should open the request section', () => {
        expect(result).toStrictEqual({
          section: 'request',
          stageId: null,
        });
      });
    });
  });

  describe('having a pipe lane', () => {
    describe('when called', () => {
      let result: TimelineTarget;

      beforeAll(() => {
        result = readTimelineTarget(lane('pipe', 'pipe-pipe-1'));
      });

      it('should open that pipe in the controller section', () => {
        expect(result).toStrictEqual({
          section: 'controller',
          stageId: 'pipe-pipe-1',
        });
      });
    });
  });

  describe('having an error lane', () => {
    describe('when called', () => {
      let result: TimelineTarget;

      beforeAll(() => {
        result = readTimelineTarget(lane('error', 'error-error-1'));
      });

      it('should open that error in the response section', () => {
        expect(result).toStrictEqual({
          section: 'response',
          stageId: 'error-error-1',
        });
      });
    });
  });

  describe('having a native middleware lane', () => {
    describe('when called', () => {
      let result: TimelineTarget;

      beforeAll(() => {
        result = readTimelineTarget(lane('native', 'native-native-1'));
      });

      it('should open that middleware', () => {
        expect(result).toStrictEqual({
          section: 'middlewares',
          stageId: 'native-native-1',
        });
      });
    });
  });
});

function lane(kind: TimelineLane['kind'], id: string): TimelineLane {
  return {
    durationMs: 1,
    id,
    kind,
    label: id,
    offsetMs: 0,
  };
}
