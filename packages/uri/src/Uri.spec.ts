import { beforeAll, describe, expect, it } from 'vitest';

import { Uri, type UriAttributes } from './Uri.js';

describe(Uri, () => {
  describe('constructor', () => {
    describe.each<[string, UriAttributes]>([
      [
        '',
        {
          authority: undefined,
          fragment: undefined,
          path: '',
          query: undefined,
          scheme: undefined,
        },
      ],
      [
        ':::',
        {
          authority: undefined,
          fragment: undefined,
          path: ':::',
          query: undefined,
          scheme: undefined,
        },
      ],
      [
        '../g',
        {
          authority: undefined,
          fragment: undefined,
          path: '../g',
          query: undefined,
          scheme: undefined,
        },
      ],
      [
        '?',
        {
          authority: undefined,
          fragment: undefined,
          path: '',
          query: undefined,
          scheme: undefined,
        },
      ],
      [
        '#',
        {
          authority: undefined,
          fragment: undefined,
          path: '',
          query: undefined,
          scheme: undefined,
        },
      ],
    ])(
      'having a "%s" uri that is not a valid URI',
      (stringifiedUri: string, expectedAttributes: UriAttributes) => {
        describe('when called', () => {
          let result: unknown;

          beforeAll(() => {
            result = new Uri(stringifiedUri);
          });

          it('should not throw', () => {
            expect(result).toBeInstanceOf(Uri);
          });

          it('should set expected attributes', () => {
            expect((result as Uri).attributes).toStrictEqual(
              expectedAttributes,
            );
          });
        });
      },
    );
  });

  describe('.toString()', () => {
    describe.each<[string, string | undefined, string]>([
      [
        'ftp://ftp.is.co.za/rfc/rfc1808.txt',
        undefined,
        'ftp://ftp.is.co.za/rfc/rfc1808.txt',
      ],
      [
        'http://www.ietf.org/rfc/rfc2396.txt',
        undefined,
        'http://www.ietf.org/rfc/rfc2396.txt',
      ],
      [
        'ldap://[2001:db8::7]/c=GB?objectClass?one',
        undefined,
        'ldap://[2001:db8::7]/c=GB?objectClass?one',
      ],
      ['mailto:John.Doe@example.com', undefined, 'mailto:John.Doe@example.com'],
      [
        'news:comp.infosystems.www.servers.unix',
        undefined,
        'news:comp.infosystems.www.servers.unix',
      ],
      ['tel:+1-816-555-1212', undefined, 'tel:+1-816-555-1212'],
      ['telnet://192.0.2.16:80/', undefined, 'telnet://192.0.2.16:80/'],
      [
        'urn:oasis:names:specification:docbook:dtd:xml:4.1.2',
        undefined,
        'urn:oasis:names:specification:docbook:dtd:xml:4.1.2',
      ],
      [
        'ftp://ftp.is.co.za/rfc/rfc1808.txt',
        'http://www.ietf.org/rfc/rfc2396.txt',
        'ftp://ftp.is.co.za/rfc/rfc1808.txt',
      ],
      ['g', 'http://sample.com', 'http://sample.com/g'],
      ['g:h', 'http://a/b/c/d;p?q', 'g:h'],
      ['g', 'http://a/b/c/d;p?q', 'http://a/b/c/g'],
      ['./g', 'http://a/b/c/d;p?q', 'http://a/b/c/g'],
      ['g/', 'http://a/b/c/d;p?q', 'http://a/b/c/g/'],
      ['/g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['//g', 'http://a/b/c/d;p?q', 'http://g'],
      ['?y', 'http://a/b/c/d;p?q', 'http://a/b/c/d;p?y'],
      ['g?y', 'http://a/b/c/d;p?q', 'http://a/b/c/g?y'],
      ['#s', 'http://a/b/c/d;p?q', 'http://a/b/c/d;p?q#s'],
      ['g#s', 'http://a/b/c/d;p?q', 'http://a/b/c/g#s'],
      ['g?y#s', 'http://a/b/c/d;p?q', 'http://a/b/c/g?y#s'],
      [';x', 'http://a/b/c/d;p?q', 'http://a/b/c/;x'],
      ['g;x', 'http://a/b/c/d;p?q', 'http://a/b/c/g;x'],
      ['g;x?y#s', 'http://a/b/c/d;p?q', 'http://a/b/c/g;x?y#s'],
      ['', 'http://a/b/c/d;p?q', 'http://a/b/c/d;p?q'],
      ['.', 'http://a/b/c/d;p?q', 'http://a/b/c/'],
      ['./', 'http://a/b/c/d;p?q', 'http://a/b/c/'],
      ['..', 'http://a/b/c/d;p?q', 'http://a/b/'],
      ['../', 'http://a/b/c/d;p?q', 'http://a/b/'],
      ['../g', 'http://a/b/c/d;p?q', 'http://a/b/g'],
      ['../..', 'http://a/b/c/d;p?q', 'http://a/'],
      ['../../', 'http://a/b/c/d;p?q', 'http://a/'],
      ['../../g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['../../../g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['../../../../g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['/./g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['/../g', 'http://a/b/c/d;p?q', 'http://a/g'],
      ['g.', 'http://a/b/c/d;p?q', 'http://a/b/c/g.'],
      ['.g', 'http://a/b/c/d;p?q', 'http://a/b/c/.g'],
      ['g..', 'http://a/b/c/d;p?q', 'http://a/b/c/g..'],
      ['..g', 'http://a/b/c/d;p?q', 'http://a/b/c/..g'],
      ['./../g', 'http://a/b/c/d;p?q', 'http://a/b/g'],
      ['./g/.', 'http://a/b/c/d;p?q', 'http://a/b/c/g/'],
      ['g/./h', 'http://a/b/c/d;p?q', 'http://a/b/c/g/h'],
      ['g/../h', 'http://a/b/c/d;p?q', 'http://a/b/c/h'],
      ['g;x=1/./y', 'http://a/b/c/d;p?q', 'http://a/b/c/g;x=1/y'],
      ['g;x=1/../y', 'http://a/b/c/d;p?q', 'http://a/b/c/y'],
      ['#', 'http://a/b/c/d;p?q#l', 'http://a/b/c/d;p?q'],
      ['?', 'http://a/b/c/d;p?q#l', 'http://a/b/c/d;p'],
    ])(
      'having a "%s" uri and a "%s" base uri',
      (
        stringifiedUri: string,
        stringifiedBaseUri: string | undefined,
        expectedStringifiedUri: string,
      ) => {
        let uri: Uri;

        beforeAll(() => {
          if (stringifiedBaseUri === undefined) {
            uri = new Uri(stringifiedUri);
          } else {
            uri = new Uri(stringifiedUri, stringifiedBaseUri);
          }
        });

        describe('when called', () => {
          let result: unknown;

          beforeAll(() => {
            result = uri.toString();
          });

          it('should match expected result', () => {
            expect(result).toBe(expectedStringifiedUri);
          });
        });
      },
    );
  });
});
