import { injectable } from 'inversify7';

import { Inversify7BaseScenario } from './Inversify7BaseScenario';

@injectable()
class Katana {
  public hit() {
    return 'cut!';
  }
}

@injectable()
class Samurai {
  readonly #katana: Katana;

  constructor(katana: Katana) {
    this.#katana = katana;
  }

  public attack() {
    return this.#katana.hit();
  }
}

export class Inversify7GetServiceInTransientScope extends Inversify7BaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(Katana).toSelf().inTransientScope();
    this._container.bind(Samurai).toSelf().inTransientScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Samurai);
  }

  public override async tearDown(): Promise<void> {
    await this._container.unbindAll();
  }
}
