import { Check, Copy } from 'lucide-react';
import {
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { type ErrorTrace, type ErrorTraceLocation } from './callApi.js';

const COPIED_STATE_MS: number = 2000;

export interface ErrorTracesProps {
  readonly traces: readonly ErrorTrace[];
}

export function ErrorTraces(props: ErrorTracesProps): ReactElement {
  return (
    <ol className="error-traces">
      {props.traces.map((trace: ErrorTrace, index: number): ReactElement => (
        <li className="error-trace" key={readTraceKey(trace, index)}>
          <p className="error-trace-location">
            <span className="error-trace-index">{String(index + 1)}</span>
            <span className="error-trace-function">
              {readFunctionLabel(trace.location.functionName)}
            </span>
            <span className="error-trace-location-file">
              <span className="error-trace-place" title={trace.location.file}>
                {readPlaceLabel(trace.location)}
              </span>
              <CopyLocationButton location={trace.location} />
            </span>
          </p>
          <pre className="error-trace-code">
            {trace.previousStatements.map(
              (statement: string, statementIndex: number): ReactElement => (
                <code
                  className="error-trace-statement"
                  key={`previous-${String(statementIndex)}`}
                >
                  {statement}
                </code>
              ),
            )}
            <code
              aria-current="true"
              className="error-trace-statement is-current"
            >
              {trace.traceStatement}
            </code>
            {trace.nextStatements.map(
              (statement: string, statementIndex: number): ReactElement => (
                <code
                  className="error-trace-statement"
                  key={`next-${String(statementIndex)}`}
                >
                  {statement}
                </code>
              ),
            )}
          </pre>
        </li>
      ))}
    </ol>
  );
}

interface CopyLocationButtonProps {
  readonly location: ErrorTraceLocation;
}

function CopyLocationButton(props: CopyLocationButtonProps): ReactElement {
  const copiedState: [boolean, (isCopied: boolean) => void] = useState(false);
  const isCopied: boolean = copiedState[0];
  const setIsCopied: (isCopied: boolean) => void = copiedState[1];
  const timeoutRef: RefObject<number | null> = useRef<number | null>(null);
  const locationText: string = readLocationText(props.location);

  useEffect((): (() => void) => {
    return (): void => {
      clearCopiedTimeout(timeoutRef);
    };
  }, []);

  const onClick: () => void = (): void => {
    void copyLocationText(locationText, setIsCopied, timeoutRef);
  };

  return (
    <button
      aria-label={isCopied ? `Copied ${locationText}` : `Copy ${locationText}`}
      className={isCopied ? 'error-trace-copy is-copied' : 'error-trace-copy'}
      onClick={onClick}
      title={locationText}
      type="button"
    >
      {isCopied ? (
        <Check aria-hidden="true" size={14} strokeWidth={1.75} />
      ) : (
        <Copy aria-hidden="true" size={14} strokeWidth={1.75} />
      )}
    </button>
  );
}

function readFunctionLabel(functionName: string | null): string {
  if (functionName === null || functionName.length === 0) {
    return 'anonymous';
  }

  return functionName;
}

function readLocationText(location: ErrorTraceLocation): string {
  return `${location.file}:${String(location.line)}:${String(location.column)}`;
}

function readPlaceLabel(location: ErrorTraceLocation): string {
  return `${location.filename}:${String(location.line)}:${String(location.column)}`;
}

function readTraceKey(trace: ErrorTrace, index: number): string {
  return `${trace.location.file}:${String(trace.location.line)}:${String(trace.location.column)}:${String(index)}`;
}

async function copyLocationText(
  locationText: string,
  setIsCopied: (isCopied: boolean) => void,
  timeoutRef: RefObject<number | null>,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(locationText);
  } catch {
    return;
  }

  setIsCopied(true);
  clearCopiedTimeout(timeoutRef);
  timeoutRef.current = window.setTimeout((): void => {
    setIsCopied(false);
  }, COPIED_STATE_MS);
}

function clearCopiedTimeout(timeoutRef: RefObject<number | null>): void {
  if (timeoutRef.current === null) {
    return;
  }

  window.clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}
