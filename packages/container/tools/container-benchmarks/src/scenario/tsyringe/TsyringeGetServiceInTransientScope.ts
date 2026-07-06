import { container, inject, injectable } from 'tsyringe';

import { TsyringeBaseScenario } from './TsyringeBaseScenario.js';

@injectable()
class Katana {
  public hit() {
    return 'cut!';
  }
}

@injectable()
class Samurai {
  readonly #katana: Katana;

  constructor(@inject(Katana) katana: Katana) {
    this.#katana = katana;
  }

  public attack() {
    return this.#katana.hit();
  }
}

export class TsyringeGetServiceInTransientScope extends TsyringeBaseScenario {
  public async execute(): Promise<void> {
    container.resolve(Samurai);
  }
}
