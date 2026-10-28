import { type CallSectionId } from './callSections.js';
import { type TimelineLane } from './timeline.js';

export interface TimelineTarget {
  readonly section: CallSectionId;
  readonly stageId: string | null;
}

export function readTimelineTarget(lane: TimelineLane): TimelineTarget {
  switch (lane.kind) {
    case 'controller':
      return {
        section: 'controller',
        stageId: lane.id,
      };
    case 'error':
      return {
        section: 'response',
        stageId: lane.id,
      };
    case 'guard':
      return {
        section: 'guards',
        stageId: lane.id,
      };
    case 'interceptor':
      return {
        section: 'interceptors',
        stageId: lane.id,
      };
    case 'middleware':
    case 'native':
      return {
        section: 'middlewares',
        stageId: lane.id,
      };
    case 'pipe':
      return {
        section: 'controller',
        stageId: lane.id,
      };
    case 'request':
      return {
        section: 'request',
        stageId: null,
      };
  }
}
