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

import { type ExecutionFilters } from '../executions/executionsApi.js';
import { HTTP_METHODS, MethodBadge } from './MethodBadge.js';
import { StatusCodeField } from './StatusCodeField.js';

export interface FiltersDialogProps {
  readonly filters: ExecutionFilters;
  readonly onApply: (filters: ExecutionFilters) => void;
  readonly onClose: () => void;
}

export function FiltersDialog(props: FiltersDialogProps): ReactElement {
  const titleId: string = useId();
  const dialogRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const draftState: [
    ExecutionFilters,
    Dispatch<SetStateAction<ExecutionFilters>>,
  ] = useState<ExecutionFilters>(props.filters);
  const draft: ExecutionFilters = draftState[0];
  const setDraftState: Dispatch<SetStateAction<ExecutionFilters>> =
    draftState[1];
  const draftRef: React.RefObject<ExecutionFilters> = useRef(props.filters);
  const setDraft: (update: SetStateAction<ExecutionFilters>) => void = (
    update: SetStateAction<ExecutionFilters>,
  ): void => {
    const nextDraft: ExecutionFilters =
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
        id="execution-filters-dialog"
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
                    setDraft((current: ExecutionFilters): ExecutionFilters => ({
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
            setDraft((current: ExecutionFilters): ExecutionFilters => ({
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
