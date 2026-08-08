import { beforeAll, describe, expect, it } from 'vitest';

import { isMissingGitIdentityError } from './isMissingGitIdentityError.js';

describe(isMissingGitIdentityError, () => {
  describe('having an Author identity unknown error', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isMissingGitIdentityError(
          new Error(
            'Command "git commit -m Initial commit" failed with exit code 128:\nAuthor identity unknown\n\n*** Please tell me who you are.',
          ),
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having an empty ident name error', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isMissingGitIdentityError(
          new Error(
            'Command "git commit -m Initial commit" failed with exit code 128:\nfatal: empty ident name (for <user@example.com>) not allowed',
          ),
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having an unrelated git error', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isMissingGitIdentityError(
          new Error(
            'Command "git commit -m Initial commit" failed with exit code 1:\nfatal: Unable to create /.git/index.lock: Permission denied',
          ),
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a non-Error rejection', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isMissingGitIdentityError('Author identity unknown');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
