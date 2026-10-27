import { type CallDetail, type TimedStage } from './callApi.js';
import { readStageKey } from './readStageKey.js';

export type TimelineKind =
  | 'controller'
  | 'error'
  | 'guard'
  | 'interceptor'
  | 'middleware'
  | 'native'
  | 'pipe'
  | 'request';

export interface TimelineLane {
  readonly durationMs: number;
  readonly id: string;
  readonly kind: TimelineKind;
  readonly label: string;
  readonly offsetMs: number;
}

export interface Timeline {
  readonly lanes: readonly TimelineLane[];
  readonly totalMs: number;
}

const MILLISECONDS_PER_SECOND: number = 1000;
const MARK_GAP_RATIO: number = 2;
const TARGET_MARK_COUNT: number = 4;

export function readTimeline(call: CallDetail): Timeline {
  const stamps: number[] = readStamps(call);
  const origin: number = Math.min(...stamps);
  const span: number = Math.max(...stamps) - origin;
  const requestDuration: number = Math.max(
    Date.parse(call.response.sentAt) - Date.parse(call.request.startedAt),
    0,
  );
  const stages: TimelineLane[] = readStageLanes(call, origin).sort(
    compareLanes,
  );

  return {
    lanes: [
      {
        durationMs: requestDuration,
        id: readStageKey('request', call.id),
        kind: 'request',
        label: `${call.request.method.toUpperCase()} ${call.request.url}`,
        offsetMs: Math.max(Date.parse(call.request.startedAt) - origin, 0),
      },
      ...stages,
    ],
    totalMs: span === 0 ? 1 : span,
  };
}

export function readTimelineMarks(totalMs: number): readonly number[] {
  const step: number = readTimelineStep(totalMs);
  const marks: number[] = [];

  for (let mark: number = 0; mark <= totalMs; mark += step) {
    marks.push(mark);
  }

  const last: number | undefined = marks[marks.length - 1];

  if (
    last !== undefined &&
    last !== totalMs &&
    totalMs - last >= step / MARK_GAP_RATIO
  ) {
    marks.push(totalMs);
  }

  return marks;
}

export function formatTimelineMark(milliseconds: number): string {
  if (milliseconds < MILLISECONDS_PER_SECOND) {
    return `${String(milliseconds)} ms`;
  }

  const seconds: number = milliseconds / MILLISECONDS_PER_SECOND;
  const text: string = Number.isInteger(seconds)
    ? String(seconds)
    : seconds.toFixed(1);

  return `${text} s`;
}

function readStageLanes(call: CallDetail, origin: number): TimelineLane[] {
  const lanes: TimelineLane[] = [];

  for (const middleware of call.nativeMiddlewares) {
    lanes.push(readStageLane(middleware, 'native', middleware.name, origin));
  }

  for (const middleware of call.middlewares) {
    lanes.push(
      readStageLane(middleware, 'middleware', middleware.name, origin),
    );
  }

  for (const guard of call.guards) {
    lanes.push(readStageLane(guard, 'guard', guard.name, origin));
  }

  for (const pipe of call.pipes) {
    lanes.push(readStageLane(pipe, 'pipe', pipe.name, origin));
  }

  if (call.controller !== undefined) {
    lanes.push(
      readStageLane(
        call.controller,
        'controller',
        `${call.controller.name}.${call.controller.method}`,
        origin,
      ),
    );
  }

  for (const interceptor of call.interceptors) {
    lanes.push(
      readStageLane(interceptor, 'interceptor', interceptor.name, origin),
    );
  }

  for (const httpError of call.httpErrors) {
    lanes.push(
      readStageLane(
        httpError,
        'error',
        httpError.filter ?? 'Unhandled error',
        origin,
      ),
    );
  }

  return lanes;
}

function readStageLane(
  stage: TimedStage,
  kind: TimelineKind,
  label: string,
  origin: number,
): TimelineLane {
  return {
    durationMs: Math.max(stage.durationMs, 0),
    id: readStageKey(kind, stage.id),
    kind,
    label,
    offsetMs: Math.max(Date.parse(stage.startedAt) - origin, 0),
  };
}

function readStamps(call: CallDetail): number[] {
  const stamps: number[] = [
    Date.parse(call.request.startedAt),
    Date.parse(call.response.sentAt),
  ];

  for (const stage of listStages(call)) {
    stamps.push(Date.parse(stage.startedAt), Date.parse(stage.endedAt));
  }

  return stamps;
}

function listStages(call: CallDetail): readonly TimedStage[] {
  const stages: TimedStage[] = [
    ...call.nativeMiddlewares,
    ...call.middlewares,
    ...call.guards,
    ...call.pipes,
    ...call.interceptors,
    ...call.httpErrors,
  ];

  if (call.controller !== undefined) {
    stages.push(call.controller);
  }

  return stages;
}

function compareLanes(left: TimelineLane, right: TimelineLane): number {
  if (left.offsetMs !== right.offsetMs) {
    return left.offsetMs - right.offsetMs;
  }

  if (left.durationMs !== right.durationMs) {
    return left.durationMs - right.durationMs;
  }

  if (left.label < right.label) {
    return -1;
  }

  if (left.label > right.label) {
    return 1;
  }

  return 0;
}

/* eslint-disable @typescript-eslint/no-magic-numbers */
function readTimelineStep(totalMs: number): number {
  const rough: number = Math.max(totalMs / TARGET_MARK_COUNT, 1);
  const magnitude: number = 10 ** Math.floor(Math.log10(rough));
  const residual: number = rough / magnitude;
  const base: number = readStepBase(residual);

  return base * magnitude;
}

function readStepBase(residual: number): number {
  const bases: readonly number[] = [1, 2, 5, 10];

  for (const base of bases) {
    if (residual <= base) {
      return base;
    }
  }

  return 10;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const TIMELINE_KIND_COLOR: Readonly<Record<TimelineKind, string>> = {
  controller: '#1f9a62',
  error: '#e24b4b',
  guard: '#2fbfa8',
  interceptor: '#8b5cf6',
  middleware: '#3d6ea8',
  native: '#607080',
  pipe: '#f5a524',
  request: '#2b93e0',
};

export const TIMELINE_KIND_TEXT: Readonly<Record<TimelineKind, string>> = {
  controller: '#ffffff',
  error: '#ffffff',
  guard: '#04241e',
  interceptor: '#ffffff',
  middleware: '#ffffff',
  native: '#ffffff',
  pipe: '#2a1c04',
  request: '#ffffff',
};

export const TIMELINE_KIND_LABEL: Readonly<Record<TimelineKind, string>> = {
  controller: 'Controller',
  error: 'Error',
  guard: 'Guard',
  interceptor: 'Interceptor',
  middleware: 'Middleware',
  native: 'Native middleware',
  pipe: 'Pipe',
  request: 'Request',
};
