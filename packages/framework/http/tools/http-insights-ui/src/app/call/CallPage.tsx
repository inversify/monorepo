import { ArrowLeft } from 'lucide-react';
import { type ReactElement, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { durationMs } from '../calls/durationMs.js';
import { AppShell } from '../components/AppShell.js';
import { DurationText } from '../components/DurationText.js';
import { MethodBadge } from '../components/MethodBadge.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { StatusPill } from '../components/StatusPill.js';
import { buildCallSearch } from './buildCallSearch.js';
import { type CallDetail } from './callApi.js';
import { CallMenu } from './CallMenu.js';
import { CallSection } from './CallSection.js';
import { type CallSectionId, isCallSectionEnabled } from './callSections.js';
import { readCallSection } from './readCallSection.js';
import { readCallStage } from './readCallStage.js';
import {
  readTimelineTarget,
  type TimelineTarget,
} from './readTimelineTarget.js';
import { type TimelineLane } from './timeline.js';
import { useCall } from './useCall.js';

export function CallPage(): ReactElement {
  const callId: string | undefined = useParams()['callId'];
  const callState: ReturnType<typeof useCall> = useCall(callId);
  const searchState: ReturnType<typeof useSearchParams> = useSearchParams();
  const searchParams: URLSearchParams = searchState[0];
  const setSearchParams: ReturnType<typeof useSearchParams>[1] = searchState[1];
  const section: CallSectionId = readCallSection(searchParams);
  const stageId: string | null = readCallStage(searchParams);
  const call: CallDetail | undefined = callState.call;

  const selectSection: (nextSection: CallSectionId) => void = (
    nextSection: CallSectionId,
  ): void => {
    setSearchParams(buildCallSearch(nextSection, null));
  };

  const selectTimelineLane: (lane: TimelineLane) => void = (
    lane: TimelineLane,
  ): void => {
    const target: TimelineTarget = readTimelineTarget(lane);

    setSearchParams(buildCallSearch(target.section, target.stageId));
  };

  useEffect(() => {
    const title: string =
      call === undefined
        ? 'Call — HTTP Insights'
        : `${call.request.method.toUpperCase()} ${call.request.url} — HTTP Insights`;

    document.title = title;

    return (): void => {
      document.title = 'Calls — HTTP Insights';
    };
  }, [call]);

  const selected: CallSectionId =
    call !== undefined && isCallSectionEnabled(section, call)
      ? section
      : 'timeline';

  return (
    <AppShell wide>
      <Link className="back-link" to="/">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} />
        Calls
      </Link>
      {callId === undefined || callId.length === 0 ? (
        <StatusMessage
          actionLabel={undefined}
          message="This call was not found."
          onAction={undefined}
        />
      ) : null}
      {callState.isLoading ? <p className="meta">Loading call</p> : null}
      {callState.isNotFound ? (
        <StatusMessage
          actionLabel={undefined}
          message="This call was not found."
          onAction={undefined}
        />
      ) : null}
      {callState.isError ? (
        <StatusMessage
          actionLabel="Retry"
          message="Couldn't load this call."
          onAction={callState.retry}
        />
      ) : null}
      {call === undefined ? null : (
        <>
          <div className="call-summary">
            <MethodBadge method={call.request.method} />
            <h1 title={call.request.url}>{call.request.url}</h1>
            <StatusPill statusCode={call.response.statusCode} />
            <DurationText
              durationMs={durationMs(
                call.request.startedAt,
                call.response.sentAt,
              )}
            />
          </div>
          <div className="call-layout">
            <CallMenu call={call} onSelect={selectSection} section={selected} />
            <CallSection
              call={call}
              onSelectTimeline={selectTimelineLane}
              section={selected}
              stageId={selected === section ? stageId : null}
            />
          </div>
        </>
      )}
    </AppShell>
  );
}
