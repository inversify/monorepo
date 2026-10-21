import { beforeAll, describe, expect, it } from 'vitest';

import {
  readTimelineTooltipPlacement,
  type TimelineTooltipPlacement,
} from './timelineTooltip.js';

const CANVAS_HEIGHT: number = 200;
const CANVAS_WIDTH: number = 400;

describe(readTimelineTooltipPlacement, () => {
  describe('having a cursor in the top-left half', () => {
    describe('when called', () => {
      let result: TimelineTooltipPlacement;

      beforeAll(() => {
        result = readTimelineTooltipPlacement(
          40,
          30,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        );
      });

      it('should place the box below and to the right of the cursor', () => {
        expect(result).toStrictEqual({
          left: 48,
          top: 38,
          transform: undefined,
        });
      });
    });
  });

  describe('having a cursor in the top-right half', () => {
    describe('when called', () => {
      let result: TimelineTooltipPlacement;

      beforeAll(() => {
        result = readTimelineTooltipPlacement(
          300,
          30,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        );
      });

      it('should place the box below and to the left of the cursor', () => {
        expect(result).toStrictEqual({
          left: 292,
          top: 38,
          transform: 'translate(-100%, 0)',
        });
      });
    });
  });

  describe('having a cursor in the bottom-left half', () => {
    describe('when called', () => {
      let result: TimelineTooltipPlacement;

      beforeAll(() => {
        result = readTimelineTooltipPlacement(
          40,
          150,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        );
      });

      it('should place the box above and to the right of the cursor', () => {
        expect(result).toStrictEqual({
          left: 48,
          top: 142,
          transform: 'translate(0, -100%)',
        });
      });
    });
  });

  describe('having a cursor in the bottom-right half', () => {
    describe('when called', () => {
      let result: TimelineTooltipPlacement;

      beforeAll(() => {
        result = readTimelineTooltipPlacement(
          300,
          150,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        );
      });

      it('should place the box above and to the left of the cursor', () => {
        expect(result).toStrictEqual({
          left: 292,
          top: 142,
          transform: 'translate(-100%, -100%)',
        });
      });
    });
  });
});
