import { controller, GET, query } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsGetQueryController {
  @GET()
  public async getWarriors(@query('damage') damage: string): Promise<string> {
    return damage;
  }
}
