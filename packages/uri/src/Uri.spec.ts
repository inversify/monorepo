import { beforeAll, describe, expect, it } from 'vitest';

import { Uri, type UriAttributes } from './Uri.js';

describe(Uri, () => {
  describe('constructor', () => {
    describe.each(['', ':::', '../g', '1http:foo'])(
      'having an invalid "%s" uri',
      (stringifiedUri: string) => {
        describe('when called', () => {
          let result: unknown;

          beforeAll(() => {
            try {
              new Uri(stringifiedUri);
            } catch (error: unknown) {
              result = error;
            }
          });

          it('should throw an Error', () => {
            expect(result).toBeInstanceOf(Error);
            expect((result as Error).message).toBe(
              `Invalid URI ${stringifiedUri}`,
            );
          });
        });
      },
    );
  });

  describe('.fromAttributes()', () => {
    describe.each<[string, UriAttributes]>([
      [
        'http://example.com/schemas/other',
        {
          authority: 'example.com',
          fragment: undefined,
          path: '/schemas/other',
          query: undefined,
          scheme: 'http',
        },
      ],
      [
        'http://example.com/schemas/other?x=1',
        {
          authority: 'example.com',
          fragment: undefined,
          path: '/schemas/other',
          query: 'x=1',
          scheme: 'http',
        },
      ],
      [
        'http://example.com/schemas/other#/definitions/foo',
        {
          authority: 'example.com',
          fragment: '/definitions/foo',
          path: '/schemas/other',
          query: undefined,
          scheme: 'http',
        },
      ],
      [
        'http://user:pass@example.com:8080/schemas/other',
        {
          authority: 'user:pass@example.com:8080',
          fragment: undefined,
          path: '/schemas/other',
          query: undefined,
          scheme: 'http',
        },
      ],
      [
        'urn:example:schema:other',
        {
          authority: undefined,
          fragment: undefined,
          path: 'example:schema:other',
          query: undefined,
          scheme: 'urn',
        },
      ],
      [
        'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6#/definitions/foo',
        {
          authority: undefined,
          fragment: '/definitions/foo',
          path: 'uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
          query: undefined,
          scheme: 'urn',
        },
      ],
      [
        'mailto:John.Doe@example.com',
        {
          authority: undefined,
          fragment: undefined,
          path: 'John.Doe@example.com',
          query: undefined,
          scheme: 'mailto',
        },
      ],
    ])(
      'having attributes for "%s"',
      (expectedStringifiedUri: string, attributes: UriAttributes) => {
        describe('when called', () => {
          let result: unknown;

          beforeAll(() => {
            result = Uri.fromAttributes(attributes);
          });

          it('should return a Uri with the expected string representation', () => {
            expect(result).toBeInstanceOf(Uri);
            expect((result as Uri).toString()).toBe(expectedStringifiedUri);
          });

          it('should return a Uri with the expected attributes', () => {
            expect((result as Uri).attributes).toStrictEqual(attributes);
          });
        });
      },
    );

    describe('having attributes with an undefined scheme', () => {
      let attributesFixture: UriAttributes;

      beforeAll(() => {
        attributesFixture = {
          authority: 'example.com',
          fragment: undefined,
          path: '/schemas/other',
          query: undefined,
          scheme: undefined,
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            Uri.fromAttributes(attributesFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Invalid URI //example.com/schemas/other',
          );
        });
      });
    });
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
