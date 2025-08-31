import { WarriorCreationResponseType } from './WarriorCreationResponseType';

export interface WarriorRequest {
  name: string;
  type: WarriorCreationResponseType;
}
