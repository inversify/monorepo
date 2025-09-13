import { UserType } from '../../api/models/User';
import { UserCreateQueryType } from '../../api/models/UserCreateQuery';

export interface UserPersistenceService {
  insert(...userCreateQueries: UserCreateQueryType[]): Promise<UserType[]>;
}
