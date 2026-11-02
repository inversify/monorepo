// Is-inversify-import-example
import { type BindingIdentifier, Container } from 'inversify7';
import { injectable } from 'inversify7';

@injectable()
class MyServiceImpl {}

export const container: Container = new Container();

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  // Create a binding and get its identifier
  const bindingIdentifier: BindingIdentifier = container
    .bind('MyService')
    .to(MyServiceImpl)
    .getIdentifier();

  // Later, unbind just this specific binding
  await container.unbind(bindingIdentifier);
  // End-example
})();

export { scriptExecution };
