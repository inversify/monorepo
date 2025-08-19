import { Container } from 'inversify';

import { MessagesController } from './controllerApiBasics';

// Begin-example
const container: Container = new Container();
// Register the controller so the adapter can discover it
container.bind(MessagesController).toSelf().inSingletonScope();
// End-example
