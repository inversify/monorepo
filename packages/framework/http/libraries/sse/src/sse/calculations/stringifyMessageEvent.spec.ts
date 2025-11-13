import { beforeAll, describe, expect, it } from 'vitest';

import { MessageEvent } from '../models/MessageEvent';
import { stringifyMessageEvent } from './stringifyMessageEvent';

describe(stringifyMessageEvent, () => {
  describe('.build', () => {
    describe.each<[string, MessageEvent, string]>([
      ['with data', { data: 'foo' }, 'data: foo\n\n'],
      [
        'with multiple data',
        { data: ['foo', 'bar'] },
        'data: foo\ndata: bar\n\n',
      ],
      ['with id and data', { data: 'foo', id: 'id' }, 'id: id\ndata: foo\n\n'],
      [
        'with type and data',
        { data: 'foo', type: 'type' },
        'event: type\ndata: foo\n\n',
      ],
      [
        'with retry and data',
        { data: 'foo', retry: 2 },
        'retry: 2\ndata: foo\n\n',
      ],
      [
        'with id, type, retry and data',
        { data: 'foo', id: 'id', retry: 2, type: 'type' },
        'event: type\nid: id\nretry: 2\ndata: foo\n\n',
      ],
      [
        'with id, type, retry and multiple data',
        { data: ['foo', 'bar'], id: 'id', retry: 2, type: 'type' },
        'event: type\nid: id\nretry: 2\ndata: foo\ndata: bar\n\n',
      ],
    ])(
      'having a message event %s',
      (
        _: string,
        messageEventFixture: MessageEvent,
        expectedResult: string,
      ) => {
        describe('when called', () => {
          let result: unknown;

          beforeAll(() => {
            result = stringifyMessageEvent(messageEventFixture);
          });

          it('should return the expected strigified message', () => {
            expect(result).toBe(expectedResult);
          });
        });
      },
    );
  });
});
