import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/common');

import { stringifyServiceIdentifier } from '@inversifyjs/common';

vitest.mock('../../binding/calculations/stringifyBinding');
vitest.mock('./isPlanServiceRedirectionBindingNode');

import { stringifyBinding } from '../../binding/calculations/stringifyBinding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(throwErrorWhenUnexpectedBindingsAmountFound.name, () => {
  describe('having undefined bindings and isOptional false and node PlanServiceNode', () => {
    let bindingsFixture: undefined;
    let isOptionalFixture: false;
    let nodeFixture: PlanServiceNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingsFixture = undefined;
      isOptionalFixture = false;
      nodeFixture = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'service-identifier',
      };
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let stringifiedServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';

        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            nodeFixture,
            bindingConstraintsFixture,
          );
        } catch (error) {
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

  describe('having single binding and isOptional false and node PlanServiceNode', () => {
    let bindingsFixture: PlanBindingNode;
    let isOptionalFixture: false;
    let nodeFixture: PlanServiceNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      const parentNode: PlanServiceNode = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'target-service-id',
      };

      bindingsFixture = {
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
        parent: parentNode,
      };
      isOptionalFixture = false;
      nodeFixture = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'service-identifier',
      };

      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns false', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        result = throwErrorWhenUnexpectedBindingsAmountFound(
          bindingsFixture,
          isOptionalFixture,
          nodeFixture,
          bindingConstraintsFixture,
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

  describe('having bindings empty array and isOptional false and node PlanServiceRedirectionBindingNode', () => {
    let bindingsFixture: [];
    let isOptionalFixture: false;
    let nodeFixture: PlanServiceRedirectionBindingNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingsFixture = [];
      isOptionalFixture = false;
      nodeFixture = {
        binding: {
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          serviceIdentifier: 'service-id',
          targetServiceIdentifier: 'target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        },
        parent: {
          bindings: [],
          parent: undefined,
          serviceIdentifier: 'service-id',
        },
        redirections: [],
      };
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let stringifiedServiceIdentifier: string;
      let stringifiedTargetServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';
        stringifiedTargetServiceIdentifier = 'stringified-target-service-id';

        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(true);

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedTargetServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          result = throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            nodeFixture,
            bindingConstraintsFixture,
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

  describe('having bindings empty array and isOptional false and node PlanServiceNode', () => {
    let bindingsFixture: [];
    let isOptionalFixture: false;
    let nodeFixture: PlanServiceNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingsFixture = [];
      isOptionalFixture = false;
      nodeFixture = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'service-identifier',
      };
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let stringifiedServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';

        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          throwErrorWhenUnexpectedBindingsAmountFound(
            bindingsFixture,
            isOptionalFixture,
            nodeFixture,
            bindingConstraintsFixture,
          );
        } catch (error) {
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

  describe('having bindings empty array and isOptional true and node PlanServiceNode', () => {
    let bindingsFixture: [];
    let isOptionalFixture: true;
    let nodeFixture: PlanServiceNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingsFixture = [];
      isOptionalFixture = true;
      nodeFixture = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'service-identifier',
      };
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        result = throwErrorWhenUnexpectedBindingsAmountFound(
          bindingsFixture,
          isOptionalFixture,
          nodeFixture,
          bindingConstraintsFixture,
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

  describe('having multiple bindings and node PlanServiceRedirectionBindingNode', () => {
    let bindingsFixture: PlanBindingNode[];
    let isOptionalFixture: boolean;
    let nodeFixture: PlanServiceRedirectionBindingNode;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      const parentNode: PlanServiceNode = {
        bindings: [],
        parent: undefined,
        serviceIdentifier: 'target-service-id',
      };

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
          parent: parentNode,
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
          parent: parentNode,
        },
      ];
      isOptionalFixture = false;
      nodeFixture = {
        binding: {
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          serviceIdentifier: 'service-id',
          targetServiceIdentifier: 'target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        },
        parent: {
          bindings: [],
          parent: undefined,
          serviceIdentifier: 'service-id',
        },
        redirections: [],
      };

      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
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
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(true);

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
            nodeFixture,
            bindingConstraintsFixture,
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
