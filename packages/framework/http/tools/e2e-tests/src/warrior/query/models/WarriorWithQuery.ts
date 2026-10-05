import { Warrior } from '../../common/models/Warrior.js';

export interface WarriorWithQuery extends Warrior {
  filter: string;
}
