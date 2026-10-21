import { type ReactElement } from 'react';

import { DurationText } from '../components/DurationText.js';
import { durationMs } from '../executions/durationMs.js';
import {
  type ControllerDetail,
  type ExecutionDetail,
  type GuardDetail,
  type HeaderEntry,
  type HttpErrorDetail,
  type InterceptorDetail,
  type MiddlewareDetail,
  type NativeMiddlewareDetail,
  type PipeDetail,
} from './executionApi.js';
import { sectionTabId } from './ExecutionMenu.js';
import { type ExecutionSectionId } from './executionSections.js';
import { readTimeline } from './timeline.js';
import { TimelineChart } from './TimelineChart.js';

export interface ExecutionSectionProps {
  readonly execution: ExecutionDetail;
  readonly section: ExecutionSectionId;
}

export function ExecutionSection(props: ExecutionSectionProps): ReactElement {
  return (
    <div
      aria-labelledby={sectionTabId(props.section)}
      className="panel detail-panel"
      role="tabpanel"
    >
      {renderSection(props.section, props.execution)}
    </div>
  );
}

function renderSection(
  section: ExecutionSectionId,
  execution: ExecutionDetail,
): ReactElement {
  switch (section) {
    case 'controller':
      return <ControllerSection execution={execution} />;
    case 'guards':
      return <GuardSection guards={execution.guards} />;
    case 'interceptors':
      return <InterceptorSection interceptors={execution.interceptors} />;
    case 'middlewares':
      return <MiddlewareSection execution={execution} />;
    case 'request':
      return <RequestSection execution={execution} />;
    case 'response':
      return <ResponseSection execution={execution} />;
    case 'timeline':
      return <TimelineSection execution={execution} />;
  }
}

function TimelineSection(props: {
  readonly execution: ExecutionDetail;
}): ReactElement {
  return (
    <>
      <h2>Timeline</h2>
      <TimelineChart timeline={readTimeline(props.execution)} />
    </>
  );
}

function RequestSection(props: {
  readonly execution: ExecutionDetail;
}): ReactElement {
  return (
    <>
      <h2>Request</h2>
      <dl className="facts">
        <dt>Method</dt>
        <dd>{props.execution.request.method.toUpperCase()}</dd>
        <dt>URL</dt>
        <dd>{props.execution.request.url}</dd>
        <dt>Started</dt>
        <dd>{formatTimestamp(props.execution.request.startedAt)}</dd>
      </dl>
      <h3>Headers</h3>
      <HeaderTable headers={props.execution.request.headers} />
    </>
  );
}

function ResponseSection(props: {
  readonly execution: ExecutionDetail;
}): ReactElement {
  return (
    <>
      <h2>Response</h2>
      <dl className="facts">
        <dt>Status</dt>
        <dd>{String(props.execution.response.statusCode)}</dd>
        <dt>Sent</dt>
        <dd>{formatTimestamp(props.execution.response.sentAt)}</dd>
        <dt>Duration</dt>
        <dd>
          <DurationText
            durationMs={durationMs(
              props.execution.request.startedAt,
              props.execution.response.sentAt,
            )}
          />
        </dd>
        <dt>Aborted</dt>
        <dd>{props.execution.response.aborted ? 'Yes' : 'No'}</dd>
      </dl>
      <h3>Headers</h3>
      <HeaderTable headers={props.execution.response.headers} />
      {props.execution.httpErrors.length > 0 ? (
        <>
          <h3>Error filters</h3>
          <div className="stage-list">
            {props.execution.httpErrors.map(
              (httpError: HttpErrorDetail): ReactElement => (
                <StageCard
                  durationMs={httpError.durationMs}
                  endedAt={httpError.endedAt}
                  error={httpError.error}
                  key={httpError.id}
                  meta={
                    httpError.filter === null
                      ? ['No filter']
                      : [httpError.filter]
                  }
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
  readonly execution: ExecutionDetail;
}): ReactElement {
  const showGroups: boolean =
    props.execution.middlewares.length > 0 &&
    props.execution.nativeMiddlewares.length > 0;

  return (
    <>
      <h2>Middlewares</h2>
      {props.execution.middlewares.length > 0 ? (
        <StageGroup title={showGroups ? 'Framework' : undefined}>
          {props.execution.middlewares.map(
            (middleware: MiddlewareDetail): ReactElement => (
              <StageCard
                durationMs={middleware.durationMs}
                endedAt={middleware.endedAt}
                error={middleware.error}
                key={middleware.id}
                meta={[formatPhase(middleware.phase)]}
                startedAt={middleware.startedAt}
                title={middleware.name}
              />
            ),
          )}
        </StageGroup>
      ) : null}
      {props.execution.nativeMiddlewares.length > 0 ? (
        <StageGroup title={showGroups ? 'Native' : undefined}>
          {props.execution.nativeMiddlewares.map(
            (middleware: NativeMiddlewareDetail): ReactElement => (
              <StageCard
                durationMs={middleware.durationMs}
                endedAt={middleware.endedAt}
                error={middleware.error}
                key={middleware.id}
                meta={['Native']}
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
            key={guard.id}
            meta={[formatGuardOutcome(guard.allowed)]}
            outcome={guardOutcome(guard.allowed)}
            startedAt={guard.startedAt}
            title={guard.name}
          />
        ))}
      </div>
    </>
  );
}

function ControllerSection(props: {
  readonly execution: ExecutionDetail;
}): ReactElement {
  const controller: ControllerDetail | undefined = props.execution.controller;

  return (
    <>
      <h2>Controller</h2>
      {controller === undefined ? null : (
        <div className="stage-list">
          <StageCard
            durationMs={controller.durationMs}
            endedAt={controller.endedAt}
            error={controller.error}
            meta={[controller.method]}
            startedAt={controller.startedAt}
            title={controller.name}
          />
        </div>
      )}
      {props.execution.pipes.length > 0 ? (
        <>
          <h3>Pipes</h3>
          <div className="stage-list">
            {props.execution.pipes.map((pipe: PipeDetail): ReactElement => (
              <StageCard
                durationMs={pipe.durationMs}
                endedAt={pipe.endedAt}
                error={pipe.error}
                key={pipe.id}
                meta={[pipe.method, `Parameter ${String(pipe.parameterIndex)}`]}
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
              key={interceptor.id}
              meta={[]}
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
  readonly meta: readonly string[];
  readonly outcome?: string;
  readonly startedAt: string;
  readonly title: string;
}

function StageCard(props: StageCardProps): ReactElement {
  return (
    <article className="stage">
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
      {props.error === undefined ? null : (
        <pre className="error-block">{props.error}</pre>
      )}
    </article>
  );
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
