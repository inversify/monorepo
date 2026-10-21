import { ArrowLeft } from 'lucide-react';
import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Link, useParams } from 'react-router';

import { AppShell } from '../components/AppShell.js';
import { DurationText } from '../components/DurationText.js';
import { MethodBadge } from '../components/MethodBadge.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { StatusPill } from '../components/StatusPill.js';
import { durationMs } from '../executions/durationMs.js';
import { type ExecutionDetail } from './executionApi.js';
import { ExecutionMenu } from './ExecutionMenu.js';
import { ExecutionSection } from './ExecutionSection.js';
import {
  type ExecutionSectionId,
  isExecutionSectionEnabled,
} from './executionSections.js';
import { useExecution } from './useExecution.js';

export function ExecutionPage(): ReactElement {
  const executionId: string | undefined = useParams()['executionId'];
  const executionState: ReturnType<typeof useExecution> =
    useExecution(executionId);
  const sectionState: [
    ExecutionSectionId,
    Dispatch<SetStateAction<ExecutionSectionId>>,
  ] = useState<ExecutionSectionId>('timeline');
  const section: ExecutionSectionId = sectionState[0];
  const setSection: Dispatch<SetStateAction<ExecutionSectionId>> =
    sectionState[1];
  const execution: ExecutionDetail | undefined = executionState.execution;

  useEffect(() => {
    setSection('timeline');
  }, [executionId]);

  useEffect(() => {
    const title: string =
      execution === undefined
        ? 'Execution — HTTP Insights'
        : `${execution.request.method.toUpperCase()} ${execution.request.url} — HTTP Insights`;

    document.title = title;

    return (): void => {
      document.title = 'Executions — HTTP Insights';
    };
  }, [execution]);

  const selected: ExecutionSectionId =
    execution !== undefined && isExecutionSectionEnabled(section, execution)
      ? section
      : 'timeline';

  return (
    <AppShell wide>
      <Link className="back-link" to="/">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} />
        Executions
      </Link>
      {executionId === undefined || executionId.length === 0 ? (
        <StatusMessage
          actionLabel={undefined}
          message="This execution was not found."
          onAction={undefined}
        />
      ) : null}
      {executionState.isLoading ? (
        <p className="meta">Loading execution</p>
      ) : null}
      {executionState.isNotFound ? (
        <StatusMessage
          actionLabel={undefined}
          message="This execution was not found."
          onAction={undefined}
        />
      ) : null}
      {executionState.isError ? (
        <StatusMessage
          actionLabel="Retry"
          message="Couldn't load this execution."
          onAction={executionState.retry}
        />
      ) : null}
      {execution === undefined ? null : (
        <>
          <div className="execution-summary">
            <MethodBadge method={execution.request.method} />
            <h1 title={execution.request.url}>{execution.request.url}</h1>
            <StatusPill statusCode={execution.response.statusCode} />
            <DurationText
              durationMs={durationMs(
                execution.request.startedAt,
                execution.response.sentAt,
              )}
            />
          </div>
          <div className="execution-layout">
            <ExecutionMenu
              execution={execution}
              onSelect={setSection}
              section={selected}
            />
            <ExecutionSection execution={execution} section={selected} />
          </div>
        </>
      )}
    </AppShell>
  );
}
