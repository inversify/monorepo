import {
  type ReactElement,
  type RefObject,
  useLayoutEffect,
  useRef,
} from 'react';

import { durationMs } from '../calls/durationMs.js';
import { DurationText } from '../components/DurationText.js';
import {
  type CallDetail,
  type ControllerDetail,
  type ErrorTrace,
  type GuardDetail,
  type HeaderEntry,
  type HttpErrorDetail,
  type InterceptorDetail,
  type MiddlewareDetail,
  type NativeMiddlewareDetail,
  type PipeDetail,
} from './callApi.js';
import { sectionTabId } from './CallMenu.js';
import { type CallSectionId } from './callSections.js';
import { ErrorTraces } from './ErrorTraces.js';
import { readStageKey } from './readStageKey.js';
import { readTimeline, type TimelineLane } from './timeline.js';
import { TimelineChart } from './TimelineChart.js';

export interface CallSectionProps {
  readonly call: CallDetail;
  readonly onSelectTimeline: (lane: TimelineLane) => void;
  readonly section: CallSectionId;
  readonly stageId: string | null;
}

export function CallSection(props: CallSectionProps): ReactElement {
  return (
    <div
      aria-labelledby={sectionTabId(props.section)}
      className="panel detail-panel"
      role="tabpanel"
    >
      {renderSection(props)}
    </div>
  );
}

function renderSection(props: CallSectionProps): ReactElement {
  switch (props.section) {
    case 'controller':
      return <ControllerSection call={props.call} stageId={props.stageId} />;
    case 'guards':
      return (
        <GuardSection guards={props.call.guards} stageId={props.stageId} />
      );
    case 'interceptors':
      return (
        <InterceptorSection
          interceptors={props.call.interceptors}
          stageId={props.stageId}
        />
      );
    case 'middlewares':
      return <MiddlewareSection call={props.call} stageId={props.stageId} />;
    case 'request':
      return <RequestSection call={props.call} />;
    case 'response':
      return <ResponseSection call={props.call} stageId={props.stageId} />;
    case 'timeline':
      return (
        <TimelineSection call={props.call} onSelect={props.onSelectTimeline} />
      );
  }
}

function TimelineSection(props: {
  readonly call: CallDetail;
  readonly onSelect: (lane: TimelineLane) => void;
}): ReactElement {
  return (
    <>
      <h2>Timeline</h2>
      <TimelineChart
        onSelect={props.onSelect}
        timeline={readTimeline(props.call)}
      />
    </>
  );
}

function RequestSection(props: { readonly call: CallDetail }): ReactElement {
  return (
    <>
      <h2>Request</h2>
      <dl className="facts">
        <dt>Method</dt>
        <dd>{props.call.request.method.toUpperCase()}</dd>
        <dt>URL</dt>
        <dd>{props.call.request.url}</dd>
        <dt>Started</dt>
        <dd>{formatTimestamp(props.call.request.startedAt)}</dd>
      </dl>
      <h3>Headers</h3>
      <HeaderTable headers={props.call.request.headers} />
    </>
  );
}

function ResponseSection(props: {
  readonly call: CallDetail;
  readonly stageId: string | null;
}): ReactElement {
  return (
    <>
      <h2>Response</h2>
      <dl className="facts">
        <dt>Status</dt>
        <dd>{String(props.call.response.statusCode)}</dd>
        <dt>Sent</dt>
        <dd>{formatTimestamp(props.call.response.sentAt)}</dd>
        <dt>Duration</dt>
        <dd>
          <DurationText
            durationMs={durationMs(
              props.call.request.startedAt,
              props.call.response.sentAt,
            )}
          />
        </dd>
        <dt>Aborted</dt>
        <dd>{props.call.response.aborted ? 'Yes' : 'No'}</dd>
      </dl>
      <h3>Headers</h3>
      <HeaderTable headers={props.call.response.headers} />
      {props.call.httpErrors.length > 0 ? (
        <>
          <h3>Error filters</h3>
          <div className="stage-list">
            {props.call.httpErrors.map(
              (httpError: HttpErrorDetail): ReactElement => (
                <StageCard
                  durationMs={httpError.durationMs}
                  endedAt={httpError.endedAt}
                  error={httpError.error}
                  errorMessage={httpError.errorMessage}
                  errorTraces={httpError.errorTraces}
                  key={httpError.id}
                  meta={
                    httpError.filter === null
                      ? ['No filter']
                      : [httpError.filter]
                  }
                  selected={
                    props.stageId === readStageKey('error', httpError.id)
                  }
                  stageId={readStageKey('error', httpError.id)}
                  startedAt={httpError.startedAt}
                  title={httpError.filter ?? 'Unhandled error'}
                />
              ),
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

function MiddlewareSection(props: {
  readonly call: CallDetail;
  readonly stageId: string | null;
}): ReactElement {
  const showGroups: boolean =
    props.call.middlewares.length > 0 &&
    props.call.nativeMiddlewares.length > 0;

  return (
    <>
      <h2>Middlewares</h2>
      {props.call.middlewares.length > 0 ? (
        <StageGroup title={showGroups ? 'Framework' : undefined}>
          {props.call.middlewares.map(
            (middleware: MiddlewareDetail): ReactElement => (
              <StageCard
                durationMs={middleware.durationMs}
                endedAt={middleware.endedAt}
                error={middleware.error}
                errorMessage={middleware.errorMessage}
                errorTraces={middleware.errorTraces}
                key={middleware.id}
                meta={[formatPhase(middleware.phase)]}
                selected={
                  props.stageId === readStageKey('middleware', middleware.id)
                }
                stageId={readStageKey('middleware', middleware.id)}
                startedAt={middleware.startedAt}
                title={middleware.name}
              />
            ),
          )}
        </StageGroup>
      ) : null}
      {props.call.nativeMiddlewares.length > 0 ? (
        <StageGroup title={showGroups ? 'Native' : undefined}>
          {props.call.nativeMiddlewares.map(
            (middleware: NativeMiddlewareDetail): ReactElement => (
              <StageCard
                durationMs={middleware.durationMs}
                endedAt={middleware.endedAt}
                error={middleware.error}
                errorMessage={middleware.errorMessage}
                errorTraces={middleware.errorTraces}
                key={middleware.id}
                meta={['Native']}
                selected={
                  props.stageId === readStageKey('native', middleware.id)
                }
                stageId={readStageKey('native', middleware.id)}
                startedAt={middleware.startedAt}
                title={middleware.name}
              />
            ),
          )}
        </StageGroup>
      ) : null}
    </>
  );
}

function GuardSection(props: {
  readonly guards: readonly GuardDetail[];
  readonly stageId: string | null;
}): ReactElement {
  return (
    <>
      <h2>Guards</h2>
      <div className="stage-list">
        {props.guards.map((guard: GuardDetail): ReactElement => (
          <StageCard
            durationMs={guard.durationMs}
            endedAt={guard.endedAt}
            error={guard.error}
            errorMessage={guard.errorMessage}
            errorTraces={guard.errorTraces}
            key={guard.id}
            meta={[formatGuardOutcome(guard.allowed)]}
            outcome={guardOutcome(guard.allowed)}
            selected={props.stageId === readStageKey('guard', guard.id)}
            stageId={readStageKey('guard', guard.id)}
            startedAt={guard.startedAt}
            title={guard.name}
          />
        ))}
      </div>
    </>
  );
}

function ControllerSection(props: {
  readonly call: CallDetail;
  readonly stageId: string | null;
}): ReactElement {
  const controller: ControllerDetail | undefined = props.call.controller;

  return (
    <>
      <h2>Controller</h2>
      {controller === undefined ? null : (
        <div className="stage-list">
          <StageCard
            durationMs={controller.durationMs}
            endedAt={controller.endedAt}
            error={controller.error}
            errorMessage={controller.errorMessage}
            errorTraces={controller.errorTraces}
            meta={[controller.method]}
            selected={
              props.stageId === readStageKey('controller', controller.id)
            }
            stageId={readStageKey('controller', controller.id)}
            startedAt={controller.startedAt}
            title={controller.name}
          />
        </div>
      )}
      {props.call.pipes.length > 0 ? (
        <>
          <h3>Pipes</h3>
          <div className="stage-list">
            {props.call.pipes.map((pipe: PipeDetail): ReactElement => (
              <StageCard
                durationMs={pipe.durationMs}
                endedAt={pipe.endedAt}
                error={pipe.error}
                errorMessage={pipe.errorMessage}
                errorTraces={pipe.errorTraces}
                key={pipe.id}
                meta={[pipe.method, `Parameter ${String(pipe.parameterIndex)}`]}
                selected={props.stageId === readStageKey('pipe', pipe.id)}
                stageId={readStageKey('pipe', pipe.id)}
                startedAt={pipe.startedAt}
                title={pipe.name}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function InterceptorSection(props: {
  readonly interceptors: readonly InterceptorDetail[];
  readonly stageId: string | null;
}): ReactElement {
  return (
    <>
      <h2>Interceptors</h2>
      <div className="stage-list">
        {props.interceptors.map(
          (interceptor: InterceptorDetail): ReactElement => (
            <StageCard
              durationMs={interceptor.durationMs}
              endedAt={interceptor.endedAt}
              error={interceptor.error}
              errorMessage={interceptor.errorMessage}
              errorTraces={interceptor.errorTraces}
              key={interceptor.id}
              meta={[]}
              selected={
                props.stageId === readStageKey('interceptor', interceptor.id)
              }
              stageId={readStageKey('interceptor', interceptor.id)}
              startedAt={interceptor.startedAt}
              title={interceptor.name}
            />
          ),
        )}
      </div>
    </>
  );
}

function StageGroup(props: {
  readonly children: ReactElement | readonly ReactElement[];
  readonly title: string | undefined;
}): ReactElement {
  return (
    <section>
      {props.title === undefined ? null : <h3>{props.title}</h3>}
      <div className="stage-list">{props.children}</div>
    </section>
  );
}

function HeaderTable(props: {
  readonly headers: readonly HeaderEntry[];
}): ReactElement {
  if (props.headers.length === 0) {
    return <p className="detail-empty">No headers.</p>;
  }

  return (
    <table className="headers">
      <caption className="sr-only">Headers</caption>
      <tbody>
        {props.headers.map((header: HeaderEntry): ReactElement => (
          <tr key={header.name}>
            <th scope="row">{header.name}</th>
            <td>{header.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface StageCardProps {
  readonly durationMs: number;
  readonly endedAt: string;
  readonly error: string | undefined;
  readonly errorMessage: string | undefined;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly meta: readonly string[];
  readonly outcome?: string;
  readonly selected: boolean;
  readonly stageId: string;
  readonly startedAt: string;
  readonly title: string;
}

function StageCard(props: StageCardProps): ReactElement {
  const cardRef: RefObject<HTMLElement | null> = useRef<HTMLElement | null>(
    null,
  );

  useLayoutEffect((): void => {
    if (
      !props.selected ||
      cardRef.current === null ||
      typeof cardRef.current.scrollIntoView !== 'function'
    ) {
      return;
    }

    cardRef.current.scrollIntoView({
      block: 'nearest',
    });
  }, [props.selected, props.stageId]);

  return (
    <article
      aria-current={props.selected ? 'true' : undefined}
      className={props.selected ? 'stage is-selected' : 'stage'}
      ref={cardRef}
    >
      <div className="stage-title">
        <p className="stage-name">{props.title}</p>
        <DurationText durationMs={props.durationMs} />
      </div>
      {props.meta.length > 0 ? (
        <p className="stage-meta">
          {props.meta.map((item: string): ReactElement => (
            <span
              data-outcome={props.outcome}
              key={item}
              className={props.outcome === undefined ? undefined : 'outcome'}
            >
              {item}
            </span>
          ))}
        </p>
      ) : null}
      <p className="stage-time">
        {formatTimestamp(props.startedAt)}
        <span aria-hidden="true"> → </span>
        <span className="sr-only"> to </span>
        {formatTimestamp(props.endedAt)}
      </p>
      <StageError
        error={props.error}
        errorMessage={props.errorMessage}
        errorTraces={props.errorTraces}
      />
    </article>
  );
}

function StageError(props: {
  readonly error: string | undefined;
  readonly errorMessage: string | undefined;
  readonly errorTraces: readonly ErrorTrace[] | null;
}): ReactElement | null {
  if (props.errorTraces !== null && props.errorTraces.length > 0) {
    return (
      <div className="error-report">
        {props.errorMessage === undefined ? null : (
          <p className="error-message">{props.errorMessage}</p>
        )}
        <ErrorTraces traces={props.errorTraces} />
      </div>
    );
  }

  if (props.error === undefined) {
    return null;
  }

  return <pre className="error-block">{props.error}</pre>;
}

function formatTimestamp(value: string): string {
  return `${value.replace('T', ' ').replace('Z', '')} UTC`;
}

function formatPhase(phase: string): string {
  if (phase === 'preHandler') {
    return 'Pre-handler';
  }

  if (phase === 'postHandler') {
    return 'Post-handler';
  }

  return phase;
}

function formatGuardOutcome(allowed: boolean | null): string {
  if (allowed === true) {
    return 'Allowed';
  }

  if (allowed === false) {
    return 'Denied';
  }

  return 'Unknown';
}

function guardOutcome(allowed: boolean | null): string {
  if (allowed === true) {
    return 'allowed';
  }

  if (allowed === false) {
    return 'denied';
  }

  return 'unknown';
}
