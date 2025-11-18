import { beforeAll, describe, expect, it } from 'vitest';

import { Pipe } from '@inversifyjs/framework-core';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { areAllParamsSync } from './areAllParamsSync';

const pipeStub: Pipe = {
  execute: () => undefined,
};

const createControllerMethodParameterMetadata: (
  overrides?: Partial<ControllerMethodParameterMetadata>,
) => ControllerMethodParameterMetadata = (
  overrides: Partial<ControllerMethodParameterMetadata> = {},
) => ({
  parameterType: RequestMethodParameterType.Query,
  pipeList: [],
  ...overrides,
});

describe(areAllParamsSync, () => {
  describe.each<
    [
      string,
      ReturnType<typeof areAllParamsSync>,
      ...Parameters<typeof areAllParamsSync>,
    ]
  >([
    [
      'no global pipes and metadata without awaitable params',
      true,
      new Set<RequestMethodParameterType>(),
      [
        undefined,
        createControllerMethodParameterMetadata({
          parameterType: RequestMethodParameterType.Cookies,
        }),
      ],
      [],
    ],
    [
      'non empty global pipe list',
      false,
      new Set<RequestMethodParameterType>(),
      [createControllerMethodParameterMetadata()],
      [pipeStub],
    ],
    [
      'controller metadata containing pipes',
      false,
      new Set<RequestMethodParameterType>(),
      [
        createControllerMethodParameterMetadata({
          pipeList: [pipeStub],
        }),
      ],
      [],
    ],
    [
      'controller metadata flagged as awaitable',
      false,
      new Set<RequestMethodParameterType>([RequestMethodParameterType.Body]),
      [
        createControllerMethodParameterMetadata({
          parameterType: RequestMethodParameterType.Body,
        }),
      ],
      [],
    ],
  ])(
    'having %s',
    (
      _: string,
      expectedResult: boolean,
      ...params: Parameters<typeof areAllParamsSync>
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = areAllParamsSync(...params);
        });

        it('should return expected result', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
