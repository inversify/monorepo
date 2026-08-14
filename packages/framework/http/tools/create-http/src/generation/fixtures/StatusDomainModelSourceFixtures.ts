import { generateStatusDomainModelSource } from '../calculations/generateStatusDomainModelSource.js';

export class StatusDomainModelSourceFixtures {
  public static get any(): string {
    return generateStatusDomainModelSource();
  }
}
