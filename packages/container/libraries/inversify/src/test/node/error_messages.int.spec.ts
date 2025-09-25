import { describe, expect, it } from 'vitest';

import { Container, injectable } from '../..';

describe('Error message when resolving fails', () => {
  @injectable()
  class Katana {}

  @injectable()
  class Shuriken {}

  @injectable()
  class Bokken {}

  it('Should contain correct message and the serviceIdentifier in error message', () => {
    const container: Container = new Container();

    container.bind('Weapon').to(Katana);

    const tryWeapon: () => void = () => {
      container.get('Ninja');
    };

    expect(tryWeapon).toThrow(`No bindings found for service: "Ninja".

Trying to resolve bindings for "Ninja (Root service)".

Binding constraints:
- service identifier: Ninja
- name: -`);
  });

  it('Should contain the provided name in error message when target is named', () => {
    const container: Container = new Container();
    const tryGetNamedWeapon: (name: string | number | symbol) => void = (
      name: string | number | symbol,
    ) => {
      container.get('Weapon', { name });
    };

    expect(() => {
      tryGetNamedWeapon('superior');
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: superior`);
    expect(() => {
      tryGetNamedWeapon(Symbol.for('Superior'));
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: Symbol(Superior)`);
    expect(() => {
      tryGetNamedWeapon(0);
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: 0`);
  });

  it('Should contain the provided tag in error message when target is tagged', () => {
    const container: Container = new Container();
    const tryGetTaggedWeapon: (tag: string | number | symbol) => void = (
      tag: string | number | symbol,
    ) => {
      container.get('Weapon', {
        tag: {
          key: tag,
          value: true,
        },
      });
    };

    expect(() => {
      tryGetTaggedWeapon('canShoot');
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: -
- tags:
  - canShoot`);
    expect(() => {
      tryGetTaggedWeapon(Symbol.for('Can shoot'));
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: -
- tags:
  - Symbol(Can shoot)`);
    expect(() => {
      tryGetTaggedWeapon(0);
    }).toThrow(`No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: -
- tags:
  - 0`);
  });

  it('Should list all possible bindings in error message if ambiguous matching binding found', () => {
    const container: Container = new Container();
    container.bind('Weapon').to(Katana);
    container.bind('Weapon').to(Shuriken);
    container.bind('Weapon').to(Bokken);

    expect(() => container.get('Weapon'))
      .toThrow(`Ambiguous bindings found for service: "Weapon".

Registered bindings:

[ type: "Instance", serviceIdentifier: "Weapon", scope: "Transient", implementationType: "Katana" ]
[ type: "Instance", serviceIdentifier: "Weapon", scope: "Transient", implementationType: "Shuriken" ]
[ type: "Instance", serviceIdentifier: "Weapon", scope: "Transient", implementationType: "Bokken" ]

Trying to resolve bindings for "Weapon (Root service)".

Binding constraints:
- service identifier: Weapon
- name: -`);
  });
});
