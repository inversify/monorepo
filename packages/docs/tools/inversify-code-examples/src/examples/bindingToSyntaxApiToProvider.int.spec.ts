import { describe, expect, it } from '@jest/globals';

import {
  Katana,
  notSoPowerfulGoldKatana,
  powerfulGoldKatana,
} from './bindingToSyntaxApiToProvider';

describe('BindingToSyntax API (toFactory)', () => {
  it('should provide a provider able to provide a katanas', async () => {
    const expectedNotSoPowerfulKatana: Katana = new Katana();
    expectedNotSoPowerfulKatana.damage = 10;
    expectedNotSoPowerfulKatana.material = 'gold';

    const expectedPowerfulKatana: Katana = new Katana();
    expectedPowerfulKatana.damage = 100;
    expectedPowerfulKatana.material = 'gold';

    expect(await notSoPowerfulGoldKatana).toStrictEqual(
      expectedNotSoPowerfulKatana,
    );
    expect(await powerfulGoldKatana).toStrictEqual(expectedPowerfulKatana);
  });
});