import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { visitTypeMetadataChildren } from './visitTypeMetadataChildren.js';

describe(visitTypeMetadataChildren, () => {
  let visitMock: Mock<(child: TypeMetadata) => void>;

  beforeAll(() => {
    visitMock = vitest.fn();
  });

  describe.each<[string, TypeMetadata]>([
    ['an anyType TypeMetadata', { kind: TypeMetadataKind.anyType }],
    ['a booleanType TypeMetadata', { kind: TypeMetadataKind.booleanType }],
    ['a floatType TypeMetadata', { kind: TypeMetadataKind.floatType }],
    ['an integerType TypeMetadata', { kind: TypeMetadataKind.integerType }],
    [
      'a literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: null },
    ],
    ['a noneType TypeMetadata', { kind: TypeMetadataKind.noneType }],
    ['an objectType TypeMetadata', { kind: TypeMetadataKind.objectType }],
    ['a stringType TypeMetadata', { kind: TypeMetadataKind.stringType }],
  ])('having %s', (_: string, typeMetadataFixture: TypeMetadata) => {
    describe('when called', () => {
      beforeAll(() => {
        visitTypeMetadataChildren(typeMetadataFixture, visitMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call visit()', () => {
        expect(visitMock).not.toHaveBeenCalled();
      });
    });
  });

  describe.each<[string, TypeMetadata, TypeMetadata]>([
    [
      'an arrayType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      { kind: TypeMetadataKind.stringType },
    ],
    [
      'a propertyType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.booleanType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
      { kind: TypeMetadataKind.booleanType },
    ],
    [
      'a stringIndexSignatureType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.floatType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      { kind: TypeMetadataKind.floatType },
    ],
  ])(
    'having %s',
    (
      _: string,
      typeMetadataFixture: TypeMetadata,
      expectedChild: TypeMetadata,
    ) => {
      describe('when called', () => {
        beforeAll(() => {
          visitTypeMetadataChildren(typeMetadataFixture, visitMock);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call visit() with the child', () => {
          expect(visitMock).toHaveBeenCalledTimes(1);
          expect(visitMock).toHaveBeenCalledWith(expectedChild);
        });
      });
    },
  );

  describe('having an and TypeMetadata with no children', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      beforeAll(() => {
        visitTypeMetadataChildren(typeMetadataFixture, visitMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call visit()', () => {
        expect(visitMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('having an and TypeMetadata with children', () => {
    let firstChildFixture: TypeMetadata;
    let secondChildFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      firstChildFixture = {
        kind: TypeMetadataKind.stringType,
      };
      secondChildFixture = {
        kind: TypeMetadataKind.floatType,
      };
      typeMetadataFixture = {
        children: [firstChildFixture, secondChildFixture],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      beforeAll(() => {
        visitTypeMetadataChildren(typeMetadataFixture, visitMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call visit() with each child in order', () => {
        expect(visitMock).toHaveBeenCalledTimes(2);
        expect(visitMock).toHaveBeenNthCalledWith(1, firstChildFixture);
        expect(visitMock).toHaveBeenNthCalledWith(2, secondChildFixture);
      });
    });
  });

  describe('having an or TypeMetadata with children', () => {
    let firstChildFixture: TypeMetadata;
    let secondChildFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      firstChildFixture = {
        kind: TypeMetadataKind.stringType,
      };
      secondChildFixture = {
        kind: TypeMetadataKind.booleanType,
      };
      typeMetadataFixture = {
        children: [firstChildFixture, secondChildFixture],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      beforeAll(() => {
        visitTypeMetadataChildren(typeMetadataFixture, visitMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call visit() with each child in order', () => {
        expect(visitMock).toHaveBeenCalledTimes(2);
        expect(visitMock).toHaveBeenNthCalledWith(1, firstChildFixture);
        expect(visitMock).toHaveBeenNthCalledWith(2, secondChildFixture);
      });
    });
  });
});
