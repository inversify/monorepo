import { Before } from '@cucumber/cucumber';

import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { initializeWorld } from '../actions/initializeWorld';

Before<Partial<InversifyWorld>>(async function () {
  initializeWorld.bind(this)();
});
