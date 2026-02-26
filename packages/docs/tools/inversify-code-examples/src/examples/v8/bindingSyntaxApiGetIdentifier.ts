// Is-inversify-import-example
import { BindingIdentifier, Container, injectable } from 'inversify8';

@injectable()
class MyServiceImpl {}

// Begin-example
const container: Container = new Container();

// The identifier can be used to unbind this specific binding later
export const bindingIdentifier: BindingIdentifier = container
  .bind('MyService')
  .to(MyServiceImpl)
  .getIdentifier();
// End-example
