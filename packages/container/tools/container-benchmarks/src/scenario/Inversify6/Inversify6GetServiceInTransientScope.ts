import { injectable } from 'inversify6';

import { Inversify6BaseScenario } from './Inversify6BaseScenario.js';

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

export class Inversify6GetServiceInTransientScope extends Inversify6BaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(Katana).toSelf().inTransientScope();
    this._container.bind(Samurai).toSelf().inTransientScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Samurai);
  }

  public override async tearDown(): Promise<void> {
    this._container.unbindAll();
  }
}
