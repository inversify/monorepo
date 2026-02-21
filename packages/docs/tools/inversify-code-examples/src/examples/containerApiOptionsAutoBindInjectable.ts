// Is-inversify-import-example
import { Container } from 'inversify6';

class Ninja {}

// Begin-example
const container: Container = new Container({ autoBindInjectable: true });

// Exclude-from-example
export const isBoundBeforeGet: boolean = container.isBound(Ninja);

// returns false
container.isBound(Ninja);
// returns a Ninja
container.get(Ninja);
// returns true
container.isBound(Ninja);
// End-example

export const isBoundAfterGet: boolean = container.isBound(Ninja);
