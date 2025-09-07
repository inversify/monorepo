import { inject, injectable } from 'inversify';

import { UserType } from '../../api/models/User';
import { UserCreateQueryType } from '../../api/models/UserCreateQuery';
import { userPersistenceServiceServiceIdentifier } from '../models/userPersistenceServiceServiceIdentifier';
import { UserPersistenceService } from './UserPersistenceService';

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
