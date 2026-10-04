import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type Container, type ServiceIdentifier } from 'inversify';

import { type Pipe } from '../models/Pipe.js';
import { type PipeMetadata } from '../models/PipeMetadata.js';
import { applyPipeList } from './applyPipeList.js';

describe(applyPipeList, () => {
  let containerMock: Mocked<Container>;
  let pipeMetadataFixture: PipeMetadata;

  beforeAll(() => {
    containerMock = {
      getAsync: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;
    pipeMetadataFixture = {
      methodName: 'getHero',
      parameterIndex: 1,
      targetClass: class HeroService {},
    };
  });

  describe('having a pipe instance and a pipe service identifier', () => {
    let firstPipeMock: Mocked<Pipe>;
    let secondPipeMock: Mocked<Pipe>;
    let secondPipeServiceIdentifierFixture: ServiceIdentifier<Pipe>;

    beforeAll(() => {
      firstPipeMock = {
        execute: vitest.fn(),
      };
      secondPipeMock = {
        execute: vitest.fn(),
      };
      secondPipeServiceIdentifierFixture = Symbol('second-pipe');
    });

    describe('when called', () => {
      let paramsFixture: unknown[];

      beforeAll(async () => {
        paramsFixture = ['untouched', 'input'];

        firstPipeMock.execute.mockResolvedValueOnce('first-output');
        containerMock.getAsync.mockResolvedValueOnce(secondPipeMock);
        secondPipeMock.execute.mockReturnValueOnce('second-output');

        await applyPipeList(
          containerMock,
          paramsFixture,
          [firstPipeMock, secondPipeServiceIdentifierFixture],
          pipeMetadataFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call the pipe instance with the parameter', () => {
        expect(firstPipeMock.execute).toHaveBeenCalledExactlyOnceWith(
          'input',
          pipeMetadataFixture,
        );
      });

      it('should resolve the pipe service identifier', () => {
        expect(containerMock.getAsync).toHaveBeenCalledExactlyOnceWith(
          secondPipeServiceIdentifierFixture,
        );
      });

      it('should call the resolved pipe with the previous pipe output', () => {
        expect(secondPipeMock.execute).toHaveBeenCalledExactlyOnceWith(
          'first-output',
          pipeMetadataFixture,
        );
      });

      it('should replace only the piped parameter', () => {
        expect(paramsFixture).toStrictEqual(['untouched', 'second-output']);
      });
    });
  });
});
