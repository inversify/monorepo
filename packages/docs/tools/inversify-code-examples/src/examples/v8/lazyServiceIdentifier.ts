// Is-inversify-import-example
import { inject, injectable, LazyServiceIdentifier } from 'inversify8';

@injectable()
export class Service {
  // Using LazyServiceIdentifier to safely reference the class itself
  constructor(
    @inject(new LazyServiceIdentifier(() => AnotherService))
    public readonly dependency: unknown,
  ) {}
}

@injectable()
export class AnotherService {
  // Implementation
}
