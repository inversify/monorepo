import { type HttpStageClock } from '../models/HttpStageClock.js';

export function startHttpStage(): HttpStageClock {
  return {
    startedAt: Date.now(),
    startTick: performance.now(),
  };
}

export function readHttpStageDuration(stage: HttpStageClock): number {
  return performance.now() - stage.startTick;
}
