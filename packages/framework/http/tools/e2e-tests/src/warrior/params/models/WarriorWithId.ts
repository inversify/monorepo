import { Warrior } from '../../common/models/Warrior.js';

export interface WarriorWithId extends Warrior {
  id: string;
}
