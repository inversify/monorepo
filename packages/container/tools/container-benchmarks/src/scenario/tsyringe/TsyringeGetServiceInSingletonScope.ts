import { container, inject, injectable, singleton } from 'tsyringe';

import { TsyringeBaseScenario } from './TsyringeBaseScenario.js';

@injectable()
@singleton()
class Katana {
  public hit() {
    return 'cut!';
  }
}

@injectable()
@singleton()
class Samurai {
  readonly #katana: Katana;

  constructor(@inject(Katana) katana: Katana) {
    this.#katana = katana;
  }

  public attack() {
    return this.#katana.hit();
  }
}

export class TsyringeGetServiceInSingletonScope extends TsyringeBaseScenario {
  public async execute(): Promise<void> {
    container.resolve(Samurai);
  }
}
