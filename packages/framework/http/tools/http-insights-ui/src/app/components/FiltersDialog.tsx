import { X } from 'lucide-react';
import {
  type Dispatch,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { type CallFilters } from '../calls/callsApi.js';
import { HTTP_METHODS, MethodBadge } from './MethodBadge.js';
import { StatusCodeField } from './StatusCodeField.js';

export interface FiltersDialogProps {
  readonly filters: CallFilters;
  readonly onApply: (filters: CallFilters) => void;
  readonly onClose: () => void;
}

export function FiltersDialog(props: FiltersDialogProps): ReactElement {
  const titleId: string = useId();
  const dialogRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const draftState: [CallFilters, Dispatch<SetStateAction<CallFilters>>] =
    useState<CallFilters>(props.filters);
  const draft: CallFilters = draftState[0];
  const setDraftState: Dispatch<SetStateAction<CallFilters>> = draftState[1];
  const draftRef: React.RefObject<CallFilters> = useRef(props.filters);
  const setDraft: (update: SetStateAction<CallFilters>) => void = (
    update: SetStateAction<CallFilters>,
  ): void => {
    const nextDraft: CallFilters =
      typeof update === 'function' ? update(draftRef.current) : update;

    draftRef.current = nextDraft;
    setDraftState(nextDraft);
  };

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const onBackdropMouseDown: (event: MouseEvent<HTMLDivElement>) => void = (
    event: MouseEvent<HTMLDivElement>,
  ): void => {
    if (event.target === event.currentTarget) {
      props.onClose();
    }
  };

  const onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void = (
    event: KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      props.onClose();
      return;
    }

    if (event.key !== 'Tab' || dialogRef.current === null) {
      return;
    }

    trapTab(event, dialogRef.current);
  };

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onBackdropMouseDown}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal"
        id="call-filters-dialog"
        onKeyDown={onKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId}>Filters</h2>
          <button
            aria-label="Close filters"
            className="modal-close"
            onClick={props.onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} strokeWidth={1.75} />
          </button>
        </div>
        <fieldset className="method-filter">
          <legend>Request method</legend>
          <div className="method-options">
            {HTTP_METHODS.map((method: string): ReactElement => {
              const isSelected: boolean = draft.requestMethod === method;

              return (
                <button
                  aria-pressed={isSelected}
                  className="method-option"
                  key={method}
                  onClick={(): void => {
                    setDraft((current: CallFilters): CallFilters => ({
                      requestMethod: isSelected ? undefined : method,
                      responseStatusCode: current.responseStatusCode,
                    }));
                  }}
                  type="button"
                >
                  <MethodBadge method={method} />
                </button>
              );
            })}
          </div>
        </fieldset>
        <StatusCodeField
          onChange={(statusCode: number | undefined): void => {
            setDraft((current: CallFilters): CallFilters => ({
              requestMethod: current.requestMethod,
              responseStatusCode: statusCode,
            }));
          }}
          value={draft.responseStatusCode}
        />
        <div className="modal-actions">
          <button
            className="modal-apply"
            onClick={(): void => {
              props.onApply(draftRef.current);
              props.onClose();
            }}
            type="button"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function trapTab(
  event: KeyboardEvent<HTMLDivElement>,
  dialog: HTMLDivElement,
): void {
  const elements: readonly HTMLElement[] = [
    ...dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled])',
    ),
  ];
  const first: HTMLElement | undefined = elements[0];
  const last: HTMLElement | undefined = elements.at(-1);

  if (first === undefined || last === undefined) {
    event.preventDefault();
    return;
  }

  const active: Element | null = document.activeElement;

  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
