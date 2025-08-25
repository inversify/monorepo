import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/common');

import { stringifyServiceIdentifier } from '@inversifyjs/common';

vitest.mock('../../binding/calculations/stringifyBinding');

import { stringifyBinding } from '../../binding/calculations/stringifyBinding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(throwErrorWhenUnexpectedBindingsAmountFound, () => {
  describe('having undefined bindings and isOptional false', () => {
    let bindingsFixture: undefined;
    let isOptionalFixture: false;
    let bindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      bindingsFixture = undefined;
      isOptionalFixture = false;
      bindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: undefined,
      };
    });

    describe('when called', () => {
      let stringifiedServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            bindingConstraintsNodeFixture,
            [],
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message: `No bindings found for service: "${stringifiedServiceIdentifier}".

Trying to resolve bindings for "${stringifiedServiceIdentifier} (Root service)".

Binding constraints:
- service identifier: ${stringifiedServiceIdentifier}
- name: binding-name
- tags:
  - tag1
  - tag2`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having bindings empty array and isOptional false', () => {
    let bindingsFixture: [];
    let isOptionalFixture: false;
    let bindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      bindingsFixture = [];
      isOptionalFixture = false;
      bindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: {
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: 'service-id',
            tags: new Map<MetadataTag, unknown>(),
          },
          previous: undefined,
        },
      };
    });

    describe('when called', () => {
      let stringifiedServiceIdentifier: string;
      let stringifiedTargetServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';
        stringifiedTargetServiceIdentifier = 'stringified-target-service-id';

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedTargetServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          result = throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            bindingConstraintsNodeFixture,
            [],
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message: `No bindings found for service: "${stringifiedTargetServiceIdentifier}".

Trying to resolve bindings for "${stringifiedServiceIdentifier}".

Binding constraints:
- service identifier: stringified-service-id
- name: binding-name
- tags:
  - tag1
  - tag2`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having bindings empty array and isOptional true', () => {
    let bindingsFixture: [];
    let isOptionalFixture: true;
    let bindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      bindingsFixture = [];
      isOptionalFixture = true;
      bindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = throwErrorWhenUnexpectedBindingsAmountFound(
          bindingsFixture,
          isOptionalFixture,
          bindingConstraintsNodeFixture,
          [],
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having multiple bindings', () => {
    let bindingsFixture: PlanBindingNode[];
    let isOptionalFixture: boolean;
    let bindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      bindingsFixture = [
        {
          binding: {
            cache: {
              isRight: true,
              value: Symbol(),
            },
            id: 0,
            isSatisfiedBy: () => true,
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'target-service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol(),
          },
        },
        {
          binding: {
            cache: {
              isRight: true,
              value: Symbol(),
            },
            id: 0,
            isSatisfiedBy: () => true,
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'target-service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol(),
          },
        },
      ];
      isOptionalFixture = false;

      bindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: {
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: 'service-id',
            tags: new Map<MetadataTag, unknown>(),
          },
          previous: undefined,
        },
      };
    });

    describe('when called', () => {
      let stringifiedTargetServiceIdentifierFixture: string;
      let stringifiedServiceIdentifierFixture: string;

      let stringifiedBindingFixture: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedTargetServiceIdentifierFixture =
          'stringified-target-service-id';
        stringifiedServiceIdentifierFixture = 'stringified-service-id';

        stringifiedBindingFixture = 'stringified-binding';

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedTargetServiceIdentifierFixture)
          .mockReturnValueOnce(stringifiedServiceIdentifierFixture)
          .mockReturnValueOnce(stringifiedServiceIdentifierFixture);

        vitest
          .mocked(stringifyBinding)
          .mockReturnValueOnce(stringifiedBindingFixture)
          .mockReturnValueOnce(stringifiedBindingFixture);

        try {
          result = throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            bindingConstraintsNodeFixture,
            [],
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message: `Ambiguous bindings found for service: "${stringifiedTargetServiceIdentifierFixture}".

Registered bindings:

${stringifiedBindingFixture}
${stringifiedBindingFixture}

Trying to resolve bindings for "${stringifiedServiceIdentifierFixture}".

Binding constraints:
- service identifier: stringified-service-id
- name: binding-name
- tags:
  - tag1
  - tag2`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
