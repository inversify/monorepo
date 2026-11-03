import { Before } from '@cucumber/cucumber';

import { type InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { initializeWorld } from '../actions/initializeWorld.js';

Before<Partial<InversifyGrpcWorld>>(async function (): Promise<void> {
  initializeWorld.bind(this)();
});
