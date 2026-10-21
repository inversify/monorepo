import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useEffect,
  useId,
  useState,
} from 'react';

import {
  filterHttpStatusCodes,
  formatHttpStatusCode,
  type HttpStatusCode,
  readHttpStatusCode,
} from '../calls/httpStatusCodes.js';

export interface StatusCodeFieldProps {
  readonly onChange: (statusCode: number | undefined) => void;
  readonly value: number | undefined;
}

export function StatusCodeField(props: StatusCodeFieldProps): ReactElement {
  const inputId: string = useId();
  const listboxId: string = useId();
  const draftState: [string | undefined, (draft: string | undefined) => void] =
    useState<string | undefined>(undefined);
  const draft: string | undefined = draftState[0];
  const setDraft: (draft: string | undefined) => void = draftState[1];
  const openState: [boolean, (isOpen: boolean) => void] = useState(false);
  const isOpen: boolean = openState[0];
  const setIsOpen: (isOpen: boolean) => void = openState[1];
  const activeIndexState: [number, (activeIndex: number) => void] = useState(0);
  const activeIndex: number = activeIndexState[0];
  const setActiveIndex: (activeIndex: number) => void = activeIndexState[1];
  const selected: HttpStatusCode | undefined =
    props.value === undefined ? undefined : readHttpStatusCode(props.value);
  const matches: readonly HttpStatusCode[] = filterHttpStatusCodes(draft ?? '');
  const clampedActiveIndex: number =
    matches.length === 0 ? 0 : Math.min(activeIndex, matches.length - 1);
  const activeStatus: HttpStatusCode | undefined = matches[clampedActiveIndex];
  const inputValue: string =
    draft ?? (selected === undefined ? '' : formatHttpStatusCode(selected));

  useEffect(() => {
    if (!isOpen || activeStatus === undefined) {
      return undefined;
    }

    const activeElement: HTMLElement | null = document.getElementById(
      statusOptionId(listboxId, activeStatus.code),
    );

    if (
      activeElement !== null &&
      typeof activeElement.scrollIntoView === 'function'
    ) {
      activeElement.scrollIntoView({
        block: 'nearest',
      });
    }

    return undefined;
  }, [activeStatus, isOpen, listboxId]);

  const selectStatus: (status: HttpStatusCode) => void = (
    status: HttpStatusCode,
  ): void => {
    props.onChange(status.code);
    setDraft(undefined);
    setIsOpen(false);
  };

  const onFocus: (event: FocusEvent<HTMLInputElement>) => void = (
    event: FocusEvent<HTMLInputElement>,
  ): void => {
    setIsOpen(true);
    event.currentTarget.select();

    const selectedIndex: number =
      props.value === undefined
        ? -1
        : matches.findIndex(
            (status: HttpStatusCode): boolean => status.code === props.value,
          );

    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
  };

  const onChange: (event: ChangeEvent<HTMLInputElement>) => void = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setDraft(event.currentTarget.value);
    setIsOpen(true);
    setActiveIndex(0);
  };

  const onBlur: () => void = (): void => {
    if (draft !== undefined && draft.trim().length === 0) {
      props.onChange(undefined);
    }

    setDraft(undefined);
    setIsOpen(false);
  };

  const onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(nextActiveIndex(clampedActiveIndex, matches.length, 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(nextActiveIndex(clampedActiveIndex, matches.length, -1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (isOpen && activeStatus !== undefined) {
        selectStatus(activeStatus);
      }

      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setDraft(undefined);
      setIsOpen(false);
    }
  };

  return (
    <div className="status-filter">
      <label htmlFor={inputId}>Response status code</label>
      <input
        aria-activedescendant={
          isOpen && activeStatus !== undefined
            ? statusOptionId(listboxId, activeStatus.code)
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        autoCapitalize="off"
        autoComplete="off"
        id={inputId}
        onBlur={onBlur}
        onChange={onChange}
        onClick={(): void => {
          setIsOpen(true);
        }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="400 or Bad Request"
        role="combobox"
        spellCheck={false}
        type="text"
        value={inputValue}
      />
      {isOpen ? (
        <ul
          aria-label="Response status codes"
          className="status-options"
          id={listboxId}
          role="listbox"
        >
          {matches.length === 0 ? (
            <li className="status-empty">No matching status codes</li>
          ) : (
            matches.map(
              (status: HttpStatusCode, index: number): ReactElement => {
                const isActive: boolean = status === activeStatus;
                const chooseStatus: (
                  event: MouseEvent<HTMLLIElement>,
                ) => void = (event: MouseEvent<HTMLLIElement>): void => {
                  event.preventDefault();
                  selectStatus(status);
                };

                return (
                  <li
                    aria-label={formatHttpStatusCode(status)}
                    aria-selected={status.code === props.value}
                    data-active={isActive ? 'true' : 'false'}
                    id={statusOptionId(listboxId, status.code)}
                    key={status.code}
                    onClick={chooseStatus}
                    onMouseDown={chooseStatus}
                    onMouseEnter={(): void => {
                      setActiveIndex(index);
                    }}
                    role="option"
                  >
                    <span className="status-code">{String(status.code)}</span>
                    <span>{status.reason}</span>
                  </li>
                );
              },
            )
          )}
        </ul>
      ) : null}
    </div>
  );
}

function nextActiveIndex(
  activeIndex: number,
  length: number,
  delta: number,
): number {
  if (length === 0) {
    return 0;
  }

  const next: number = activeIndex + delta;

  if (next < 0) {
    return 0;
  }

  const lastIndex: number = length - 1;

  if (next > lastIndex) {
    return lastIndex;
  }

  return next;
}

function statusOptionId(listboxId: string, code: number): string {
  return `${listboxId}-${String(code)}`;
}
