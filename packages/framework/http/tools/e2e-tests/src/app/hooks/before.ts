import { Before } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { initializeWorld } from '../actions/initializeWorld.js';

Before<Partial<InversifyHttpWorld>>(async function () {
  initializeWorld.bind(this)();
});
