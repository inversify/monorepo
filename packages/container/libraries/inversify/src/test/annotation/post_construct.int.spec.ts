import { describe, expect, it } from 'vitest';

import { postConstruct } from '../../index.js';

describe('@postConstruct', () => {
  it('Should throw when applied multiple times', () => {
    function setup() {
      class Katana {
        @postConstruct()
        @postConstruct()
        public testMethod1() {
          /* ... */
        }
      }
      Katana.toString();
    }

    expect(setup).toThrowError(`Unexpected injection error.

Cause:

Unexpected duplicated postConstruct method testMethod1

Details

[class: "Katana", property: "testMethod1"]`);
  });
});
