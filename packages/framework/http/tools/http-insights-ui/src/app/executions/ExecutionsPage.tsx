import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

import { AppShell } from '../components/AppShell.js';
import { ExecutionList } from '../components/ExecutionList.js';
import { FilterChips } from '../components/FilterChips.js';
import { FiltersButton } from '../components/FiltersButton.js';
import { InfiniteScrollSentinel } from '../components/InfiniteScrollSentinel.js';
import { SearchField } from '../components/SearchField.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { type ExecutionFilters } from './executionsApi.js';
import { useExecutionFilters } from './useExecutionFilters.js';
import { useExecutions } from './useExecutions.js';
import { useRequestUrlLike } from './useRequestUrlLike.js';

export function ExecutionsPage(): ReactElement {
  const requestUrlLikeQuery: ReturnType<typeof useRequestUrlLike> =
    useRequestUrlLike();
  const draftState: [string, Dispatch<SetStateAction<string>>] = useState(
    requestUrlLikeQuery.requestUrlLike,
  );
  const draft: string = draftState[0];
  const setDraft: Dispatch<SetStateAction<string>> = draftState[1];
  const executionFiltersQuery: ReturnType<typeof useExecutionFilters> =
    useExecutionFilters();
  const executionFilters: ExecutionFilters = executionFiltersQuery.filters;
  const executions: ReturnType<typeof useExecutions> = useExecutions({
    requestMethod: executionFilters.requestMethod,
    requestUrlLike: requestUrlLikeQuery.requestUrlLike,
    responseStatusCode: executionFilters.responseStatusCode,
  });

  useEffect(() => {
    setDraft(requestUrlLikeQuery.requestUrlLike);
  }, [requestUrlLikeQuery.requestUrlLike]);

  useEffect(() => {
    const onKeyDown: (event: KeyboardEvent) => void = (
      event: KeyboardEvent,
    ): void => {
      if (
        event.key !== '/' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.activeElement instanceof HTMLInputElement ||
        document.querySelector('[role="dialog"]') !== null
      ) {
        return;
      }

      event.preventDefault();
      document.getElementById('requestUrlLike')?.focus();
    };

    document.addEventListener('keydown', onKeyDown);

    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const countLabel: string = executions.isInitialLoading
    ? 'Loading executions'
    : executionCountLabel(executions.total);

  return (
    <AppShell>
      <h1>Executions</h1>
      <p className="lede">Recorded HTTP traffic.</p>
      <SearchField
        onSearch={requestUrlLikeQuery.setRequestUrlLike}
        onValueChange={setDraft}
        trailing={
          <FiltersButton
            filters={executionFilters}
            onFiltersChange={executionFiltersQuery.setFilters}
          />
        }
        value={draft}
      />
      <FilterChips
        filters={executionFilters}
        onFiltersChange={executionFiltersQuery.setFilters}
      />
      <p aria-live="polite" className="meta">
        {countLabel}
      </p>
      {executions.isInitialError ? (
        <StatusMessage
          actionLabel="Retry"
          message="Couldn't load executions."
          onAction={executions.retry}
        />
      ) : null}
      {!executions.isInitialLoading &&
      !executions.isInitialError &&
      executions.items.length === 0 ? (
        <StatusMessage
          actionLabel={undefined}
          message={emptyExecutionsMessage(
            executionFilters,
            requestUrlLikeQuery.requestUrlLike,
          )}
          onAction={undefined}
        />
      ) : null}
      {executions.items.length > 0 ? (
        <ExecutionList
          footer={
            <>
              {executions.hasNextPage ? (
                <InfiniteScrollSentinel
                  disabled={executions.isLoadingMore}
                  onVisible={executions.loadMore}
                />
              ) : null}
              {executions.isLoadingMore ? (
                <p className="status">Loading more</p>
              ) : null}
              {executions.isNextPageError ? (
                <StatusMessage
                  actionLabel="Retry"
                  message="Couldn't load more executions."
                  onAction={executions.retry}
                />
              ) : null}
            </>
          }
          items={executions.items}
        />
      ) : null}
    </AppShell>
  );
}

function emptyExecutionsMessage(
  filters: ExecutionFilters,
  requestUrlLike: string,
): string {
  if (
    filters.requestMethod === undefined &&
    filters.responseStatusCode === undefined
  ) {
    return requestUrlLike.length > 0
      ? 'No executions match this URL.'
      : 'No executions recorded.';
  }

  return 'No executions match these filters.';
}

function executionCountLabel(total: number): string {
  const noun: string = total === 1 ? 'execution' : 'executions';

  return `${String(total)} ${noun}`;
}
