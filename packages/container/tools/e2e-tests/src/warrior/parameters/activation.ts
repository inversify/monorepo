import { defineParameterType } from '@cucumber/cucumber';
import { BindingActivation } from '@inversifyjs/core';

import { upgradeWeapon } from '../actions/upgradeWeapon';

enum ActivationKind {
  weaponUpgrade = 'weapon upgrade',
}

defineParameterType({
  name: 'activation',
  regexp: new RegExp(`(${Object.values(ActivationKind).join('|')})`),
  transformer: function (activationKind: string): BindingActivation {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
    switch (activationKind as ActivationKind) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case ActivationKind.weaponUpgrade:
        return upgradeWeapon as BindingActivation;
      default:
        throw new Error(`Invalid "${activationKind}" activation`);
    }
  },
});
