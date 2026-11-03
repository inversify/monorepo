import { Before } from '@cucumber/cucumber';

import { type InversifyHttpWorld } from '../../common/models/InversifyHttpWorld.js';
import { initializeWorld } from '../actions/initializeWorld.js';

Before<Partial<InversifyHttpWorld>>(async function () {
  initializeWorld.bind(this)();
});
