import { type ReactElement } from 'react';

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
import { readTimeline } from './timeline.js';
import { TimelineChart } from './TimelineChart.js';

export interface CallSectionProps {
  readonly call: CallDetail;
  readonly section: CallSectionId;
}

export function CallSection(props: CallSectionProps): ReactElement {
  return (
    <div
      aria-labelledby={sectionTabId(props.section)}
      className="panel detail-panel"
      role="tabpanel"
    >
      {renderSection(props.section, props.call)}
    </div>
  );
}

function renderSection(section: CallSectionId, call: CallDetail): ReactElement {
  switch (section) {
    case 'controller':
      return <ControllerSection call={call} />;
    case 'guards':
      return <GuardSection guards={call.guards} />;
    case 'interceptors':
      return <InterceptorSection interceptors={call.interceptors} />;
    case 'middlewares':
      return <MiddlewareSection call={call} />;
    case 'request':
      return <RequestSection call={call} />;
    case 'response':
      return <ResponseSection call={call} />;
    case 'timeline':
      return <TimelineSection call={call} />;
  }
}

function TimelineSection(props: { readonly call: CallDetail }): ReactElement {
  return (
    <>
      <h2>Timeline</h2>
      <TimelineChart timeline={readTimeline(props.call)} />
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

function ResponseSection(props: { readonly call: CallDetail }): ReactElement {
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

function MiddlewareSection(props: { readonly call: CallDetail }): ReactElement {
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
            errorMessage={guard.errorMessage}
            errorTraces={guard.errorTraces}
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

function ControllerSection(props: { readonly call: CallDetail }): ReactElement {
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
              errorMessage={interceptor.errorMessage}
              errorTraces={interceptor.errorTraces}
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
  readonly errorMessage: string | undefined;
  readonly errorTraces: readonly ErrorTrace[] | null;
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
