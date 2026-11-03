import { type Warrior } from '../../common/models/Warrior.js';
import { type WarriorCreationResponseType } from './WarriorCreationResponseType.js';

export interface WarriorCreationResponse extends Warrior {
  name: string;
  type: WarriorCreationResponseType;
}
