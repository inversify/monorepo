import { type UserType } from '../../api/models/User.js';
import { type UserCreateQueryType } from '../../api/models/UserCreateQuery.js';

export interface UserPersistenceService {
  insert(...userCreateQueries: UserCreateQueryType[]): Promise<UserType[]>;
}
