import { describe, expect, it, Mock, vitest } from 'vitest';

import {
  bindingScopeValues,
  Container,
  injectable,
  preDestroy,
} from '../../index.js';

describe('Issue 1416', () => {
  it('should allow providing default values on optional bindings', async () => {
    @injectable()
    class Test1 {
      public onDestroyMock: Mock<() => void> = vitest.fn();

      @preDestroy()
      public destroy() {
        this.onDestroyMock();
      }
    }

    @injectable()
    class Test2 {
      public destroy(): void {}
    }

    @injectable()
    class Test3 {
      public destroy(): void {}
    }

    const container: Container = new Container({
      defaultScope: bindingScopeValues.Singleton,
    });

    container.bind(Test1).toSelf();
    container.bind(Test2).toService(Test1);
    container.bind(Test3).toService(Test1);

    const test1: Test1 = container.get(Test1);
    container.get(Test2);
    container.get(Test3);

    await Promise.all([
      container.unbindAsync(Test1),
      container.unbindAsync(Test2),
      container.unbindAsync(Test3),
    ]);

    expect(test1.onDestroyMock).toHaveBeenCalledTimes(1);
  });
});
