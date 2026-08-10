import { generateTodoPersistencePortSource } from '../calculations/generateTodoPersistencePortSource.js';

export class TodoPersistencePortSourceFixtures {
  public static get any(): string {
    return generateTodoPersistencePortSource();
  }
}
