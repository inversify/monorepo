``` ts
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
```
