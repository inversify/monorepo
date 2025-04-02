/* eslint-disable @typescript-eslint/no-magic-numbers */
import assert from 'node:assert/strict';

import { Then } from '@cucumber/cucumber';
import { Container } from '@inversifyjs/container';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyWorld } from '../../common/models/InversifyWorld';
import { Archer } from '../../warrior/models/Archer';
import { Bow } from '../../warrior/models/Bow';
import { DualWieldSwordsman } from '../../warrior/models/DualWieldSwordsman';
import { Sword } from '../../warrior/models/Sword';
import { getContainerGetRequestOrFail } from '../calculations/getContainerGetRequestOrFail';
import { getContainerOrFail } from '../calculations/getContainerOrFail';

function getValues(this: InversifyWorld, valueAliases: string[]): unknown[] {
  return valueAliases.map((valueAlias: string): unknown =>
    getContainerGetRequestOrFail.bind(this)(valueAlias),
  );
}

function thenDualWieldSworsdmanSwordsAreDistinct(
  this: InversifyWorld,
  valueAlias?: string,
): void {
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  const dualWieldSwordsman: DualWieldSwordsman =
    getContainerGetRequestOrFail.bind(this)(
      parsedValueAlias,
    ) as DualWieldSwordsman;

  assert.ok(dualWieldSwordsman.leftSword instanceof Sword);
  assert.ok(dualWieldSwordsman.rightSword instanceof Sword);
  assert.ok(dualWieldSwordsman.leftSword !== dualWieldSwordsman.rightSword);
}

function thenDualWieldSworsdmanSwordsAreEqual(
  this: InversifyWorld,
  valueAlias?: string,
): void {
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  const dualWieldSwordsman: DualWieldSwordsman =
    getContainerGetRequestOrFail.bind(this)(
      parsedValueAlias,
    ) as DualWieldSwordsman;

  assert.ok(dualWieldSwordsman.leftSword instanceof Sword);
  assert.ok(dualWieldSwordsman.rightSword instanceof Sword);
  assert.ok(dualWieldSwordsman.leftSword === dualWieldSwordsman.rightSword);
}

function thenValueIsDualWieldSworsdmanWithTwoSwords(
  this: InversifyWorld,
  valueAlias?: string,
): void {
  const parsedValueAlias: string = valueAlias ?? defaultAlias;

  const dualWieldSwordsman: DualWieldSwordsman =
    getContainerGetRequestOrFail.bind(this)(
      parsedValueAlias,
    ) as DualWieldSwordsman;

  assert.ok(dualWieldSwordsman.leftSword instanceof Sword);
  assert.ok(dualWieldSwordsman.rightSword instanceof Sword);
}

function thenValuesAreDistinct(
  this: InversifyWorld,
  valueAliases: string[],
): void {
  assert.ok(
    getValues
      .bind(this)(valueAliases)
      .every(
        (value: unknown, index: number, array: unknown[]): boolean =>
          array.at(index - 1) !== value,
      ),
  );
}

function thenValuesAreEqual(
  this: InversifyWorld,
  valueAliases: string[],
): void {
  assert.ok(
    getValues
      .bind(this)(valueAliases)
      .every(
        (value: unknown, index: number, array: unknown[]): boolean =>
          array.at(index - 1) === value,
      ),
  );
}

Then<InversifyWorld>(
  '{stringList} values are distinct',
  function (valueAliases: string[]): void {
    thenValuesAreDistinct.bind(this)(valueAliases);
  },
);

Then<InversifyWorld>(
  '{stringList} values are equal',
  function (valueAliases: string[]): void {
    thenValuesAreEqual.bind(this)(valueAliases);
  },
);

Then<InversifyWorld>(
  'dual wield swordsman swords are distinct',
  function (): void {
    thenDualWieldSworsdmanSwordsAreDistinct.bind(this)();
  },
);

Then<InversifyWorld>(
  'dual wield swordsman swords are equal',
  function (): void {
    thenDualWieldSworsdmanSwordsAreEqual.bind(this)();
  },
);

Then<InversifyWorld>(
  'the container has service {string} bound',
  function (serviceId: string): void {
    const container: Container = getContainerOrFail.bind(this)(defaultAlias);
    const isBound: boolean = container.isBound(serviceId);

    if (!isBound) {
      throw new Error(
        `Expected service ${serviceId} to be bound, but it was not.`,
      );
    }
  },
);

Then<InversifyWorld>(
  'the container does not have service {string} bound',
  function (serviceId: string): void {
    const container: Container = getContainerOrFail.bind(this)(defaultAlias);
    const isBound: boolean = container.isBound(serviceId);

    if (isBound) {
      throw new Error(
        `Expected service ${serviceId} not to be bound, but it was.`,
      );
    }
  },
);

Then<InversifyWorld>(
  'value is a dual wield swordsman with two swords',
  function (): void {
    thenValueIsDualWieldSworsdmanWithTwoSwords.bind(this)();
  },
);

Then<InversifyWorld>('value is an archer with a bow', function (): void {
  const value: unknown = getContainerGetRequestOrFail.bind(this)(defaultAlias);

  assert.ok(value instanceof Archer);
  assert.ok(value.bow instanceof Bow);
});

Then<InversifyWorld>(
  'value is an array with an archer with a bow',
  function (): void {
    const value: unknown =
      getContainerGetRequestOrFail.bind(this)(defaultAlias);

    assert.ok(Array.isArray(value));
    assert.ok(value[0] instanceof Archer);
    assert.ok(value[0].bow instanceof Bow);
  },
);

Then<InversifyWorld>(
  'value is a sword with improved damage',
  function (): void {
    const value: unknown =
      getContainerGetRequestOrFail.bind(this)(defaultAlias);

    assert.ok(value instanceof Sword);
    assert.equal(value.damage, 12);
  },
);

Then<InversifyWorld>(
  'value is a sword with improved damage \\(x{int}\\)',
  function (times: number): void {
    const value: unknown =
      getContainerGetRequestOrFail.bind(this)(defaultAlias);

    assert.ok(value instanceof Sword);
    assert.equal(value.damage, 10 + 2 * times);
  },
);
