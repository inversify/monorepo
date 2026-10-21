import { ArrowLeft } from 'lucide-react';
import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Link, useParams } from 'react-router';

import { durationMs } from '../calls/durationMs.js';
import { AppShell } from '../components/AppShell.js';
import { DurationText } from '../components/DurationText.js';
import { MethodBadge } from '../components/MethodBadge.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { StatusPill } from '../components/StatusPill.js';
import { type CallDetail } from './callApi.js';
import { CallMenu } from './CallMenu.js';
import { CallSection } from './CallSection.js';
import { type CallSectionId, isCallSectionEnabled } from './callSections.js';
import { useCall } from './useCall.js';

export function CallPage(): ReactElement {
  const callId: string | undefined = useParams()['callId'];
  const callState: ReturnType<typeof useCall> = useCall(callId);
  const sectionState: [CallSectionId, Dispatch<SetStateAction<CallSectionId>>] =
    useState<CallSectionId>('timeline');
  const section: CallSectionId = sectionState[0];
  const setSection: Dispatch<SetStateAction<CallSectionId>> = sectionState[1];
  const call: CallDetail | undefined = callState.call;

  useEffect(() => {
    setSection('timeline');
  }, [callId]);

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
            <CallMenu call={call} onSelect={setSection} section={selected} />
            <CallSection call={call} section={selected} />
          </div>
        </>
      )}
    </AppShell>
  );
}
