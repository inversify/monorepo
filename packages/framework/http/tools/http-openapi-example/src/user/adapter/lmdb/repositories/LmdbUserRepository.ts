import { randomUUID } from 'node:crypto';

import { inject, injectable } from 'inversify';
import { type RootDatabase } from 'lmdb';

import { lmdbDbServiceIdentifier } from '../../../../foundation/db/domain/models/lmdbDbServiceIdentifier';
import { UserPersistenceService } from '../../../domain/services/UserPersistenceService';
import { UserCreateQueryDb } from '../models/UserCreateQueryDb';
import { UserDb } from '../models/UserDb';

@injectable()
export class LmdbUserRepository implements UserPersistenceService {
  readonly #db: RootDatabase;

  constructor(@inject(lmdbDbServiceIdentifier) db: RootDatabase) {
    this.#db = db;
  }

  public async insert(
    ...userCreateQueries: UserCreateQueryDb[]
  ): Promise<UserDb[]> {
    const users: UserDb[] = [];

    await this.#db.transaction(async () => {
      for (const userCreateQuery of userCreateQueries) {
        const user: UserDb = {
          ...userCreateQuery,
          id: randomUUID(),
        };

        await this.#db.put(user.id, user);
        users.push(user);
      }
    });

    return users;
  }
}
