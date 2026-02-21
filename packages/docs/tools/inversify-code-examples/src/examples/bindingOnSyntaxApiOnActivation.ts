// Is-inversify-import-example
import { Container, injectable, interfaces } from 'inversify6';

const container: Container = new Container();

// Begin-example
@injectable()
class Katana {
  public use(): string {
    return 'hit!';
  }
}

container
  .bind<Katana>('Katana')
  .to(Katana)
  .onActivation((_context: interfaces.Context, katana: Katana) => {
    const handler: ProxyHandler<() => string> = {
      apply: function (
        target: () => string,
        thisArgument: unknown,
        argumentsList: [],
      ) {
        console.log(`Starting: ${new Date().getTime().toString()}`);
        const result: string = target.apply(thisArgument, argumentsList);
        console.log(`Finished: ${new Date().getTime().toString()}`);
        return result;
      },
    };

    katana.use = new Proxy(katana.use.bind(katana), handler);

    return katana;
  });
// End-example

export { container, Katana };
