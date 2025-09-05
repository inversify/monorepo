import { Warrior } from '../../common/models/Warrior';

export interface WarriorWithId extends Warrior {
  id: string;
}
