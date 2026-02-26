// Is-inversify-import-example
import { Container, inject, injectable, Newable } from 'inversify8';

class AwesomeDbDriverCollectionImplementation<
  T,
> implements AwesomeDbDriverCollection<T> {
  public find(): T[] {
    return [];
  }
}

class AwesomeDbDriverConnectionImplementation implements AwesomeDbDriverConnection {
  public close(): void {
    return;
  }

  public getCollection<T>(): AwesomeDbDriverCollection<T> {
    return new AwesomeDbDriverCollectionImplementation<T>();
  }
}

class AwesomeDbDriverImplementation {
  public static async connect(
    _url: string,
  ): Promise<AwesomeDbDriverConnection> {
    return new AwesomeDbDriverConnectionImplementation();
  }
}

interface MyAwesomeEnv {
  dbUrl: string;
}

@injectable()
class MyAwesomeEnvService {
  public getEnvironment(): MyAwesomeEnv {
    return { dbUrl: 'http://localhost:12345' };
  }
}

interface AwesomeDbDriverCollection<T> {
  find(query: unknown): T[];
}

interface AwesomeDbDriverConnection {
  close(): void;
  getCollection<T>(type: Newable<T>): AwesomeDbDriverCollection<T>;
}

// Begin-example
class Katana {
  public material!: string;
  public damage!: number;
}

const dbConnectionSymbol: symbol = Symbol.for('DbConnection');
const katanaDbCollectionSymbol: symbol = Symbol.for('KatanaRepository');

const container: Container = new Container();

@injectable()
class KatanaRepository {
  readonly #dbCollection: AwesomeDbDriverCollection<Katana>;

  constructor(
    @inject(katanaDbCollectionSymbol)
    dbCollection: AwesomeDbDriverCollection<Katana>,
  ) {
    this.#dbCollection = dbCollection;
  }

  public async find(query: unknown): Promise<Katana[]> {
    return this.#dbCollection.find(query);
  }
}

container.bind(MyAwesomeEnvService).toSelf();
container
  .bind(dbConnectionSymbol)
  .toResolvedValue(
    async (
      envService: MyAwesomeEnvService,
    ): Promise<AwesomeDbDriverConnection> => {
      const databaseUrl: string = envService.getEnvironment().dbUrl;

      return AwesomeDbDriverImplementation.connect(databaseUrl);
    },
    [MyAwesomeEnvService],
  )
  .inSingletonScope();

container
  .bind(katanaDbCollectionSymbol)
  .toResolvedValue(
    (
      connection: AwesomeDbDriverConnection,
    ): AwesomeDbDriverCollection<Katana> => {
      return connection.getCollection(Katana);
    },
    [dbConnectionSymbol],
  )
  .inSingletonScope();

container.bind(KatanaRepository).toSelf();

// End-example
