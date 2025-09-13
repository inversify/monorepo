import { Before } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { initializeWorld } from '../actions/initializeWorld';

Before<Partial<InversifyHttpWorld>>(async function () {
  initializeWorld.bind(this)();
});
