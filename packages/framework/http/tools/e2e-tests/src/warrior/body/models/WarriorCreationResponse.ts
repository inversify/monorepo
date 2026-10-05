import { Warrior } from '../../common/models/Warrior.js';
import { WarriorCreationResponseType } from './WarriorCreationResponseType.js';

export interface WarriorCreationResponse extends Warrior {
  name: string;
  type: WarriorCreationResponseType;
}
