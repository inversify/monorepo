import { inject, injectable } from 'inversify';

import { UserType } from '../../api/models/User.js';
import { UserCreateQueryType } from '../../api/models/UserCreateQuery.js';
import { userPersistenceServiceServiceIdentifier } from '../models/userPersistenceServiceServiceIdentifier.js';
import { UserPersistenceService } from './UserPersistenceService.js';

@injectable()
export class UserService {
  readonly #userPersistenceService: UserPersistenceService;

  constructor(
    @inject(userPersistenceServiceServiceIdentifier)
    userPersistenceService: UserPersistenceService,
  ) {
    this.#userPersistenceService = userPersistenceService;
  }

  public async create(...users: [UserCreateQueryType]): Promise<[UserType]>;
  public async create(...users: UserCreateQueryType[]): Promise<UserType[]>;
  public async create(...users: UserCreateQueryType[]): Promise<UserType[]> {
    return this.#userPersistenceService.insert(...users);
  }
}
