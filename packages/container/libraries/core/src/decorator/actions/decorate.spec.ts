import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import 'reflect-metadata';

import { decorate } from './decorate';

describe(decorate.name, () => {
  describe('having ClassDecorator decorator', () => {
    let classDecoratorMock: Mock<ClassDecorator> & ClassDecorator;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;

    beforeAll(() => {
      classDecoratorMock = vitest.fn<ClassDecorator>() as Mock<ClassDecorator> &
        ClassDecorator;
      targetFixture = class {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = decorate(classDecoratorMock, targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call decorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledTimes(1);
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having ClassDecorator[] decorators', () => {
    let classDecoratorMock: Mock<ClassDecorator> & ClassDecorator;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;

    beforeAll(() => {
      classDecoratorMock = vitest.fn<ClassDecorator>() as Mock<ClassDecorator> &
        ClassDecorator;
      targetFixture = class {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = decorate([classDecoratorMock], targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call decorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledTimes(1);
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having ParameterDecorator[] decorators', () => {
    let parameterDecoratorMock: Mock<ParameterDecorator> & ParameterDecorator;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let parameterIndexFixture: number;

    beforeAll(() => {
      parameterDecoratorMock =
        vitest.fn<ParameterDecorator>() as Mock<ParameterDecorator> &
          ParameterDecorator;
      targetFixture = class {};
      parameterIndexFixture = 1;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = decorate(
          [parameterDecoratorMock],
          targetFixture,
          parameterIndexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call decorator', () => {
        expect(parameterDecoratorMock).toHaveBeenCalledTimes(1);
        expect(parameterDecoratorMock).toHaveBeenCalledWith(
          targetFixture,
          undefined,
          parameterIndexFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having MethodDecorator[] decorators', () => {
    let methodDecoratorMock: Mock<MethodDecorator> & MethodDecorator;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyFixture: string | symbol;

    beforeAll(() => {
      methodDecoratorMock =
        vitest.fn<MethodDecorator>() as Mock<MethodDecorator> & MethodDecorator;
      targetFixture = class {};
      propertyFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = decorate(
          [methodDecoratorMock],
          targetFixture,
          propertyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call decorator', () => {
        expect(methodDecoratorMock).toHaveBeenCalledTimes(1);
        expect(methodDecoratorMock).toHaveBeenCalledWith(
          targetFixture.prototype,
          propertyFixture,
          undefined,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
