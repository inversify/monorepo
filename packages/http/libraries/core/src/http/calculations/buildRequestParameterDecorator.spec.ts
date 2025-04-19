import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./requestParam');

import { Newable } from 'inversify';

import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Pipe } from '../pipe/model/Pipe';
import { buildRequestParameterDecorator } from './buildRequestParameterDecorator';
import { requestParam } from './requestParam';

describe(buildRequestParameterDecorator.name, () => {
  describe('having a parameterNameOrPipe with type string', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: string;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.QUERY;
        parameterNameOrPipeFixture = 'parameterName';
        parameterPipeListFixture = [];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRequestParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam', () => {
        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith({
          parameterName: parameterNameOrPipeFixture,
          parameterType: parameterTypeFixture,
          pipeList: parameterPipeListFixture,
        });
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a parameterNameOrPipe with type Pipe', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: Pipe;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.QUERY;
        parameterNameOrPipeFixture = { execute: () => {} };
        parameterPipeListFixture = [];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRequestParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam', () => {
        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith({
          parameterType: parameterTypeFixture,
          pipeList: [parameterNameOrPipeFixture],
        });
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a parameterNameOrPipe with type string and parameterPipeList length greater than 0', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: string;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.QUERY;
        parameterNameOrPipeFixture = 'parameterName';
        parameterPipeListFixture = [{ execute: () => {} }];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRequestParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam', () => {
        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith({
          parameterName: parameterNameOrPipeFixture,
          parameterType: parameterTypeFixture,
          pipeList: parameterPipeListFixture,
        });
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
