// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

@injectable()
export class Level1 {}

// Begin-example
async function buildLevel1(): Promise<Level1> {
  return new Level1();
}

const container: Container = new Container();
container
  .bind('Level1')
  .toDynamicValue(async (): Promise<Level1> => buildLevel1());

const level1: Promise<Level1> = container.getAsync<Level1>('Level1'); // Returns Promise<Level1>
// End-example

export { level1 };
