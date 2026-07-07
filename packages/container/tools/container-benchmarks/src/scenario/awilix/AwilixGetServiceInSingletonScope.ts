import { asClass } from 'awilix';

import { AwilixBaseScenario } from './AwilixBaseScenario.js';

class Katana {
  public hit() {
    return 'cut!';
  }
}

class Samurai {
  readonly #katana: Katana;

  constructor({ katana }: { katana: Katana }) {
    this.#katana = katana;
  }

  public attack() {
    return this.#katana.hit();
  }
}

export class AwilixGetServiceInSingletonScope extends AwilixBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.register({
      katana: asClass(Katana).singleton(),
      samurai: asClass(Samurai).singleton(),
    });
  }

  public async execute(): Promise<void> {
    this._container.resolve<Samurai>('samurai');
  }

  public override async tearDown(): Promise<void> {
    await this._container.dispose();
  }
}
