import { beforeAll, describe, expect, it } from 'vitest';

import { Container, type Newable, type ServiceIdentifier } from 'inversify';

import { type ErrorFilter } from '../../error-filter/models/ErrorFilter.js';
import { type Guard } from '../../guard/models/Guard.js';
import { type Interceptor } from '../../interceptor/models/Interceptor.js';
import { type ApplyMiddlewareOptions } from '../../middleware/models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../../middleware/models/Middleware.js';
import { MiddlewarePhase } from '../../middleware/models/MiddlewarePhase.js';
import { type Pipe } from '../../pipe/models/Pipe.js';
import { InversifyServerAdapter } from './InversifyServerAdapter.js';

class TestServerAdapter extends InversifyServerAdapter<string> {
  public readonly operations: string[] = [];
  public readonly registeredErrorFilters: Newable<ErrorFilter>[] = [];
  public serverWasBuiltWhenRead: boolean = false;

  public get recordedGlobalGuardList(): ServiceIdentifier<Guard>[] {
    return this._globalGuardList;
  }

  public get recordedGlobalInterceptorList(): ServiceIdentifier<Interceptor>[] {
    return this._globalInterceptorList;
  }

  public get recordedGlobalPipeList(): (ServiceIdentifier<Pipe> | Pipe)[] {
    return this._globalPipeList;
  }

  public get recordedPostHandlerMiddlewareList(): ServiceIdentifier<Middleware>[] {
    return this._postHandlerMiddlewareList;
  }

  public get recordedPreHandlerMiddlewareList(): ServiceIdentifier<Middleware>[] {
    return this._preHandlerMiddlewareList;
  }

  public get serverIsBuilt(): boolean {
    return this._isBuilt;
  }

  protected override _applyGlobalPreHandlerMiddleware(): void {
    this.operations.push('pre-middleware');
  }

  protected override _bindServices(): void | Promise<void> {
    this.operations.push('bind');
  }

  protected override _getServer(): string {
    this.serverWasBuiltWhenRead = this._isBuilt;
    this.operations.push('get-server');

    return 'server';
  }

  protected override _registerGlobalErrorFilter(
    errorFilter: Newable<ErrorFilter>,
  ): void {
    this.registeredErrorFilters.push(errorFilter);
  }

  protected override _registerHandlers(): void {
    this.operations.push('register');
  }

  protected override _throwInvalidOperationAfterBuild(message: string): never {
    throw new Error(message);
  }
}

class AsyncBindServerAdapter extends TestServerAdapter {
  public releaseBind: () => void = (): void => undefined;

  protected override async _bindServices(): Promise<void> {
    this.operations.push('bind-start');

    await new Promise<void>((resolve: () => void): void => {
      this.releaseBind = (): void => {
        this.operations.push('bind-end');
        resolve();
      };
    });
  }
}

class FirstErrorFilter implements ErrorFilter {
  public catch(): undefined {
    return undefined;
  }
}

class SecondErrorFilter implements ErrorFilter {
  public catch(): undefined {
    return undefined;
  }
}

class TestPipe implements Pipe {
  public execute(input: unknown): unknown {
    return input;
  }
}

class PreHandlerMiddleware implements Middleware {
  public execute(): undefined {
    return undefined;
  }
}

class PostHandlerMiddleware implements Middleware {
  public execute(): undefined {
    return undefined;
  }
}

describe(InversifyServerAdapter, () => {
  describe('.applyGlobalGuards', () => {
    describe('having guard service identifiers', () => {
      let firstGuard: ServiceIdentifier<Guard>;
      let secondGuard: ServiceIdentifier<Guard>;

      beforeAll(() => {
        firstGuard = Symbol('first-guard');
        secondGuard = Symbol('second-guard');
      });

      describe('when called, and the server has not been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(() => {
          adapter = new TestServerAdapter(new Container());

          adapter.applyGlobalGuards(firstGuard);
          adapter.applyGlobalGuards(secondGuard);
        });

        it('should append the guards in call order', () => {
          expect(adapter.recordedGlobalGuardList).toStrictEqual([
            firstGuard,
            secondGuard,
          ]);
        });
      });

      describe('when called, and the server has been built', () => {
        let adapter: TestServerAdapter;
        let result: unknown;

        beforeAll(async () => {
          adapter = new TestServerAdapter(new Container());
          adapter.applyGlobalGuards(firstGuard);

          await adapter.build();

          try {
            adapter.applyGlobalGuards(secondGuard);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Cannot apply global guards after the server has been built',
          );
        });

        it('should not append the guard', () => {
          expect(adapter.recordedGlobalGuardList).toStrictEqual([firstGuard]);
        });
      });
    });
  });

  describe('.applyGlobalMiddleware', () => {
    describe('having a service identifier and phased middleware', () => {
      let preHandlerMiddleware: ServiceIdentifier<Middleware>;
      let phasedPreHandlerMiddleware: ServiceIdentifier<Middleware>;
      let postHandlerMiddleware: ServiceIdentifier<Middleware>;
      let middlewareList: (
        ServiceIdentifier<Middleware> | ApplyMiddlewareOptions
      )[];

      beforeAll(() => {
        preHandlerMiddleware = Symbol('pre-handler-middleware');
        phasedPreHandlerMiddleware = PreHandlerMiddleware;
        postHandlerMiddleware = PostHandlerMiddleware;
        middlewareList = [
          preHandlerMiddleware,
          {
            middleware: postHandlerMiddleware,
            phase: MiddlewarePhase.PostHandler,
          },
          {
            middleware: phasedPreHandlerMiddleware,
            phase: MiddlewarePhase.PreHandler,
          },
        ];
      });

      describe('when called, and the server has not been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(() => {
          adapter = new TestServerAdapter(new Container());

          adapter.applyGlobalMiddleware(...middlewareList);
        });

        it('should append pre-handler middleware in order', () => {
          expect(adapter.recordedPreHandlerMiddlewareList).toStrictEqual([
            preHandlerMiddleware,
            phasedPreHandlerMiddleware,
          ]);
        });

        it('should append post-handler middleware in order', () => {
          expect(adapter.recordedPostHandlerMiddlewareList).toStrictEqual([
            postHandlerMiddleware,
          ]);
        });
      });

      describe('when called, and the server has been built', () => {
        let adapter: TestServerAdapter;
        let result: unknown;

        beforeAll(async () => {
          adapter = new TestServerAdapter(new Container());

          await adapter.build();

          try {
            adapter.applyGlobalMiddleware(...middlewareList);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Cannot apply global middleware after the server has been built',
          );
        });

        it('should not append middleware', () => {
          expect(adapter.recordedPreHandlerMiddlewareList).toStrictEqual([]);
          expect(adapter.recordedPostHandlerMiddlewareList).toStrictEqual([]);
        });
      });
    });
  });

  describe('.build', () => {
    describe('when called', () => {
      let adapter: TestServerAdapter;
      let result: string;

      beforeAll(async () => {
        adapter = new TestServerAdapter(new Container());
        result = await adapter.build();
      });

      it('should bind services, install pre-handler middleware, and register handlers before returning the server', () => {
        expect(adapter.operations).toStrictEqual([
          'bind',
          'pre-middleware',
          'register',
          'get-server',
        ]);
        expect(result).toBe('server');
      });

      it('should mark the server as built before reading it', () => {
        expect(adapter.serverWasBuiltWhenRead).toBe(true);
        expect(adapter.serverIsBuilt).toBe(true);
      });
    });

    describe('when called, and binding services returns a promise', () => {
      let adapter: AsyncBindServerAdapter;
      let operationsBeforeBindResolves: readonly string[];
      let result: string;

      beforeAll(async () => {
        adapter = new AsyncBindServerAdapter(new Container());

        const buildPromise: Promise<string> = adapter.build();
        operationsBeforeBindResolves = [...adapter.operations];
        adapter.releaseBind();
        result = await buildPromise;
      });

      it('should not install pre-handler middleware before bind resolves', () => {
        expect(operationsBeforeBindResolves).toStrictEqual(['bind-start']);
      });

      it('should continue the build after bind resolves', () => {
        expect(adapter.operations).toStrictEqual([
          'bind-start',
          'bind-end',
          'pre-middleware',
          'register',
          'get-server',
        ]);
        expect(result).toBe('server');
      });
    });

    describe('when called, and the server has already been built', () => {
      let adapter: TestServerAdapter;
      let result: unknown;

      beforeAll(async () => {
        adapter = new TestServerAdapter(new Container());

        await adapter.build();

        try {
          await adapter.build();
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'The server has already been built',
        );
      });

      it('should not build again', () => {
        expect(adapter.operations).toStrictEqual([
          'bind',
          'pre-middleware',
          'register',
          'get-server',
        ]);
      });
    });
  });

  describe('.useGlobalFilters', () => {
    describe('having error filters', () => {
      describe('when called, and the server has not been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(() => {
          adapter = new TestServerAdapter(new Container());

          adapter.useGlobalFilters(FirstErrorFilter, SecondErrorFilter);
        });

        it('should register each error filter in order', () => {
          expect(adapter.registeredErrorFilters).toStrictEqual([
            FirstErrorFilter,
            SecondErrorFilter,
          ]);
        });
      });

      describe('when called, and the server has been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(async () => {
          adapter = new TestServerAdapter(new Container());

          await adapter.build();
          adapter.useGlobalFilters(FirstErrorFilter);
        });

        it('should register the error filter', () => {
          expect(adapter.registeredErrorFilters).toStrictEqual([
            FirstErrorFilter,
          ]);
        });
      });
    });
  });

  describe('.useGlobalInterceptors', () => {
    describe('having interceptor service identifiers', () => {
      let firstInterceptor: ServiceIdentifier<Interceptor>;
      let secondInterceptor: ServiceIdentifier<Interceptor>;

      beforeAll(() => {
        firstInterceptor = Symbol('first-interceptor');
        secondInterceptor = Symbol('second-interceptor');
      });

      describe('when called, and the server has not been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(() => {
          adapter = new TestServerAdapter(new Container());

          adapter.useGlobalInterceptors(firstInterceptor, secondInterceptor);
        });

        it('should append the interceptors in order', () => {
          expect(adapter.recordedGlobalInterceptorList).toStrictEqual([
            firstInterceptor,
            secondInterceptor,
          ]);
        });
      });

      describe('when called, and the server has been built', () => {
        let adapter: TestServerAdapter;
        let result: unknown;

        beforeAll(async () => {
          adapter = new TestServerAdapter(new Container());
          adapter.useGlobalInterceptors(firstInterceptor);

          await adapter.build();

          try {
            adapter.useGlobalInterceptors(secondInterceptor);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Cannot apply global interceptors after the server has been built',
          );
        });

        it('should not append the interceptor', () => {
          expect(adapter.recordedGlobalInterceptorList).toStrictEqual([
            firstInterceptor,
          ]);
        });
      });
    });
  });

  describe('.useGlobalPipe', () => {
    describe('having a pipe and a pipe service identifier', () => {
      let pipe: TestPipe;
      let pipeIdentifier: ServiceIdentifier<Pipe>;

      beforeAll(() => {
        pipe = new TestPipe();
        pipeIdentifier = Symbol('pipe');
      });

      describe('when called, and the server has not been built', () => {
        let adapter: TestServerAdapter;

        beforeAll(() => {
          adapter = new TestServerAdapter(new Container());

          adapter.useGlobalPipe(pipe, pipeIdentifier);
        });

        it('should append the pipes in order', () => {
          expect(adapter.recordedGlobalPipeList).toStrictEqual([
            pipe,
            pipeIdentifier,
          ]);
        });
      });

      describe('when called, and the server has been built', () => {
        let adapter: TestServerAdapter;
        let result: unknown;

        beforeAll(async () => {
          adapter = new TestServerAdapter(new Container());

          await adapter.build();

          try {
            adapter.useGlobalPipe(pipeIdentifier);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Cannot apply global pipes after the server has been built',
          );
        });

        it('should not append the pipe', () => {
          expect(adapter.recordedGlobalPipeList).toStrictEqual([]);
        });
      });
    });
  });
});
