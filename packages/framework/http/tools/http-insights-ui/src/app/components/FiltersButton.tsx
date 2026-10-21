import { type ReactElement, useEffect, useRef, useState } from 'react';

import { type CallFilters } from '../calls/callsApi.js';
import { FiltersDialog } from './FiltersDialog.js';

export interface FiltersButtonProps {
  readonly filters: CallFilters;
  readonly onFiltersChange: (filters: CallFilters) => void;
}

export function FiltersButton(props: FiltersButtonProps): ReactElement {
  const openState: [boolean, (isOpen: boolean) => void] = useState(false);
  const isOpen: boolean = openState[0];
  const setIsOpen: (isOpen: boolean) => void = openState[1];
  const buttonRef: React.RefObject<HTMLButtonElement | null> =
    useRef<HTMLButtonElement>(null);
  const hasFilters: boolean =
    props.filters.requestMethod !== undefined ||
    props.filters.responseStatusCode !== undefined;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    return (): void => {
      buttonRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-controls="call-filters-dialog"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Filters"
        className={hasFilters ? 'filters-button is-active' : 'filters-button'}
        onClick={(): void => {
          setIsOpen(true);
        }}
        ref={buttonRef}
        type="button"
      >
        <FiltersIcon />
      </button>
      {isOpen ? (
        <FiltersDialog
          filters={props.filters}
          onApply={props.onFiltersChange}
          onClose={(): void => {
            setIsOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function FiltersIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M3 6.5h11" />
      <path d="M3 12h11" />
      <path d="M3 17.5h11" />
      <circle cx="18.75" cy="6.5" fill="currentColor" r="1.7" stroke="none" />
      <circle cx="18.75" cy="12" fill="currentColor" r="1.7" stroke="none" />
      <circle cx="18.75" cy="17.5" fill="currentColor" r="1.7" stroke="none" />
    </svg>
  );
}
