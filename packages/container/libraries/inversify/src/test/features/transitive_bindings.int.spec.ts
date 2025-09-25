import { describe, expect, it } from 'vitest';

import { Container, injectable } from '../..';

describe('Transitive bindings', () => {
  it('Should be able to bind to a service', () => {
    @injectable()
    class MySqlDatabaseTransactionLog {
      public time: number;
      public name: string;
      constructor() {
        this.time = new Date().getTime();
        this.name = 'MySqlDatabaseTransactionLog';
      }
    }

    @injectable()
    class DatabaseTransactionLog {
      public time!: number;
      public name!: string;
    }

    @injectable()
    class TransactionLog {
      public time!: number;
      public name!: string;
    }

    const container: Container = new Container();
    container.bind(MySqlDatabaseTransactionLog).toSelf().inSingletonScope();
    container
      .bind(DatabaseTransactionLog)
      .toService(MySqlDatabaseTransactionLog);
    container.bind(TransactionLog).toService(DatabaseTransactionLog);

    const mySqlDatabaseTransactionLog: MySqlDatabaseTransactionLog =
      container.get(MySqlDatabaseTransactionLog);
    const databaseTransactionLog: DatabaseTransactionLog = container.get(
      DatabaseTransactionLog,
    );
    const transactionLog: TransactionLog = container.get(TransactionLog);

    expect(mySqlDatabaseTransactionLog.name).toBe(
      'MySqlDatabaseTransactionLog',
    );
    expect(databaseTransactionLog.name).toBe('MySqlDatabaseTransactionLog');
    expect(transactionLog.name).toBe('MySqlDatabaseTransactionLog');
    expect(mySqlDatabaseTransactionLog.time).toBe(databaseTransactionLog.time);
    expect(databaseTransactionLog.time).toBe(transactionLog.time);
  });
});
