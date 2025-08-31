import { Warrior } from '../../common/models/Warrior';

export interface WarriorWithQuery extends Warrior {
  filter: string;
}
