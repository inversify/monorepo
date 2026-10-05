import { WarriorCreationResponseType } from './WarriorCreationResponseType.js';

export interface WarriorRequest {
  name: string;
  type: WarriorCreationResponseType;
}
