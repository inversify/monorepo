// Is-inversify-import-example
import { BindingIdentifier, Container } from 'inversify8';
import { injectable } from 'inversify8';

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
  container.unbind(bindingIdentifier);
  // End-example
})();

export { scriptExecution };
