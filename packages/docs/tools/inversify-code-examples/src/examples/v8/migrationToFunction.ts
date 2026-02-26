// Is-inversify-import-example
import { Container } from 'inversify8';

// Begin-example
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const container: Container = new Container();

// v6: container.bind('greet').toFunction(greet);
container.bind<typeof greet>('greet').toConstantValue(greet);

export const greetFn: (name: string) => string = container.get('greet');

export const greeting: string = greetFn('World');
// End-example
