import { beforeAll, describe, expect, it } from 'vitest';

import { type CallSectionId } from './callSections.js';
import { readCallSection } from './readCallSection.js';

describe(readCallSection, () => {
  describe('having no section parameter', () => {
    describe('when called', () => {
      let result: CallSectionId;

      beforeAll(() => {
        result = readCallSection(new URLSearchParams());
      });

      it('should use the timeline', () => {
        expect(result).toBe('timeline');
      });
    });
  });

  describe('having a guards parameter', () => {
    describe('when called', () => {
      let result: CallSectionId;

      beforeAll(() => {
        result = readCallSection(new URLSearchParams('section=guards'));
      });

      it('should use the guards section', () => {
        expect(result).toBe('guards');
      });
    });
  });

  describe('having an unknown section parameter', () => {
    describe('when called', () => {
      let result: CallSectionId;

      beforeAll(() => {
        result = readCallSection(new URLSearchParams('section=nope'));
      });

      it('should use the timeline', () => {
        expect(result).toBe('timeline');
      });
    });
  });
});
