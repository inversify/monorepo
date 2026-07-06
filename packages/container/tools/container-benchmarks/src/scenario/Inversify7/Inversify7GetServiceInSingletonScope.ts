import { injectable } from 'inversify7';

import { Inversify7BaseScenario } from './Inversify7BaseScenario.js';

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

export class Inversify7GetServiceInSingletonScope extends Inversify7BaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(Katana).toSelf().inSingletonScope();
    this._container.bind(Samurai).toSelf().inSingletonScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Samurai);
  }

  public override async tearDown(): Promise<void> {
    await this._container.unbindAll();
  }
}
