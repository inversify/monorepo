import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

import { AppShell } from '../components/AppShell.js';
import { CallList } from '../components/CallList.js';
import { FilterChips } from '../components/FilterChips.js';
import { FiltersButton } from '../components/FiltersButton.js';
import { InfiniteScrollSentinel } from '../components/InfiniteScrollSentinel.js';
import { SearchField } from '../components/SearchField.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { type CallFilters } from './callsApi.js';
import { useCallFilters } from './useCallFilters.js';
import { useCalls } from './useCalls.js';
import { useRequestUrlLike } from './useRequestUrlLike.js';

export function CallsPage(): ReactElement {
  const requestUrlLikeQuery: ReturnType<typeof useRequestUrlLike> =
    useRequestUrlLike();
  const draftState: [string, Dispatch<SetStateAction<string>>] = useState(
    requestUrlLikeQuery.requestUrlLike,
  );
  const draft: string = draftState[0];
  const setDraft: Dispatch<SetStateAction<string>> = draftState[1];
  const callFiltersQuery: ReturnType<typeof useCallFilters> = useCallFilters();
  const callFilters: CallFilters = callFiltersQuery.filters;
  const calls: ReturnType<typeof useCalls> = useCalls({
    requestMethod: callFilters.requestMethod,
    requestUrlLike: requestUrlLikeQuery.requestUrlLike,
    responseStatusCode: callFilters.responseStatusCode,
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

  const countLabel: string = calls.isInitialLoading
    ? 'Loading calls'
    : callCountLabel(calls.total);

  return (
    <AppShell>
      <h1>Calls</h1>
      <p className="lede">Recorded HTTP traffic.</p>
      <SearchField
        onSearch={requestUrlLikeQuery.setRequestUrlLike}
        onValueChange={setDraft}
        trailing={
          <FiltersButton
            filters={callFilters}
            onFiltersChange={callFiltersQuery.setFilters}
          />
        }
        value={draft}
      />
      <FilterChips
        filters={callFilters}
        onFiltersChange={callFiltersQuery.setFilters}
      />
      <p aria-live="polite" className="meta">
        {countLabel}
      </p>
      {calls.isInitialError ? (
        <StatusMessage
          actionLabel="Retry"
          message="Couldn't load calls."
          onAction={calls.retry}
        />
      ) : null}
      {!calls.isInitialLoading &&
      !calls.isInitialError &&
      calls.items.length === 0 ? (
        <StatusMessage
          actionLabel={undefined}
          message={emptyCallsMessage(
            callFilters,
            requestUrlLikeQuery.requestUrlLike,
          )}
          onAction={undefined}
        />
      ) : null}
      {calls.items.length > 0 ? (
        <CallList
          footer={
            <>
              {calls.hasNextPage ? (
                <InfiniteScrollSentinel
                  disabled={calls.isLoadingMore}
                  onVisible={calls.loadMore}
                />
              ) : null}
              {calls.isLoadingMore ? (
                <p className="status">Loading more</p>
              ) : null}
              {calls.isNextPageError ? (
                <StatusMessage
                  actionLabel="Retry"
                  message="Couldn't load more calls."
                  onAction={calls.retry}
                />
              ) : null}
            </>
          }
          items={calls.items}
        />
      ) : null}
    </AppShell>
  );
}

function emptyCallsMessage(
  filters: CallFilters,
  requestUrlLike: string,
): string {
  if (
    filters.requestMethod === undefined &&
    filters.responseStatusCode === undefined
  ) {
    return requestUrlLike.length > 0
      ? 'No calls match this URL.'
      : 'No calls recorded.';
  }

  return 'No calls match these filters.';
}

function callCountLabel(total: number): string {
  const noun: string = total === 1 ? 'call' : 'calls';

  return `${String(total)} ${noun}`;
}
