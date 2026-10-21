import {
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  formatTimelineMark,
  readTimelineMarks,
  type Timeline,
  TIMELINE_KIND_COLOR,
  TIMELINE_KIND_LABEL,
  TIMELINE_KIND_TEXT,
  type TimelineKind,
  type TimelineLane,
} from './timeline.js';
import {
  readTimelineTooltipPlacement,
  type TimelineTooltipPlacement,
} from './timelineTooltip.js';

const BAR_HEIGHT: number = 22;
const BAR_RADIUS: number = 4;
const HORIZONTAL_PADDING: number = 16;
const LABEL_GAP: number = 8;
const HALF: number = 2;
const LABEL_PADDING: number = 8;
const MIN_BAR_WIDTH: number = 3;
const PLOT_PADDING: number = 8;
const ROW_HEIGHT: number = 30;
const RULER_HEIGHT: number = 36;
const TICK_LABEL_Y: number = 12;
const TICK_STEM: number = 6;

const durationFormat: Intl.NumberFormat = new Intl.NumberFormat('en-US');

export interface TimelineChartProps {
  readonly timeline: Timeline;
}

export function TimelineChart(props: TimelineChartProps): ReactElement {
  const plotRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const canvasRef: React.RefObject<HTMLCanvasElement | null> =
    useRef<HTMLCanvasElement>(null);
  const barsRef: React.RefObject<TimelineBar[]> = useRef<TimelineBar[]>([]);
  const hoverState: [
    TimelineHover | undefined,
    (hover: TimelineHover | undefined) => void,
  ] = useState<TimelineHover | undefined>(undefined);
  const hover: TimelineHover | undefined = hoverState[0];
  const setHover: (hover: TimelineHover | undefined) => void = hoverState[1];
  const kinds: readonly TimelineKind[] = readPresentKinds(props.timeline);

  useLayoutEffect(() => {
    const plot: HTMLDivElement | null = plotRef.current;
    const canvas: HTMLCanvasElement | null = canvasRef.current;

    if (plot === null || canvas === null) {
      return undefined;
    }

    const draw: () => void = (): void => {
      barsRef.current = paintTimeline(canvas, plot, props.timeline);
    };

    draw();

    const resizeObserver: ResizeObserver | undefined =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(draw)
        : undefined;
    const themeObserver: MutationObserver = new MutationObserver(draw);

    resizeObserver?.observe(plot);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
      attributes: true,
    });

    return (): void => {
      resizeObserver?.disconnect();
      themeObserver.disconnect();
    };
  }, [props.timeline]);

  const onMouseMove: (event: ReactMouseEvent<HTMLCanvasElement>) => void = (
    event: ReactMouseEvent<HTMLCanvasElement>,
  ): void => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;

    if (canvas === null) {
      return;
    }

    const bounds: DOMRect = canvas.getBoundingClientRect();
    const x: number = event.clientX - bounds.left;
    const y: number = event.clientY - bounds.top;
    const bar: TimelineBar | undefined = barsRef.current.find(
      (candidate: TimelineBar): boolean =>
        x >= candidate.x &&
        x <= candidate.labelRight &&
        y >= candidate.y &&
        y <= candidate.y + candidate.height,
    );

    setHover(
      bar === undefined
        ? undefined
        : {
            lane: bar.lane,
            placement: readTimelineTooltipPlacement(
              x,
              y,
              bounds.width,
              bounds.height,
            ),
          },
    );
  };

  return (
    <div className="waterfall">
      <ul className="sr-only">
        {props.timeline.lanes.map((lane: TimelineLane): ReactElement => (
          <li key={lane.id}>{lane.label}</li>
        ))}
      </ul>
      <div className="waterfall-plot" ref={plotRef}>
        <canvas
          aria-label="Timing waterfall"
          onMouseLeave={(): void => {
            setHover(undefined);
          }}
          onMouseMove={onMouseMove}
          ref={canvasRef}
          role="img"
        />
        {hover === undefined ? null : (
          <div
            className="timeline-tooltip"
            style={{
              left: hover.placement.left,
              top: hover.placement.top,
              transform: hover.placement.transform,
            }}
          >
            <p>{hover.lane.label}</p>
            <p>
              {TIMELINE_KIND_LABEL[hover.lane.kind]}
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              {`started at ${String(hover.lane.offsetMs)} ms`}
            </p>
          </div>
        )}
      </div>
      <ul aria-label="Timeline kinds" className="timeline-legend">
        {kinds.map((kind: TimelineKind): ReactElement => (
          <li key={kind}>
            <span
              className="timeline-swatch"
              style={{ background: TIMELINE_KIND_COLOR[kind] }}
            />
            {TIMELINE_KIND_LABEL[kind]}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TimelineBar {
  readonly height: number;
  readonly labelRight: number;
  readonly lane: TimelineLane;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

interface TimelineHover {
  readonly lane: TimelineLane;
  readonly placement: TimelineTooltipPlacement;
}

function readCanvasContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D | null {
  try {
    return canvas.getContext('2d');
  } catch {
    return null;
  }
}

function paintTimeline(
  canvas: HTMLCanvasElement,
  plot: HTMLDivElement,
  timeline: Timeline,
): TimelineBar[] {
  const width: number = Math.max(plot.clientWidth, 1);
  const height: number = RULER_HEIGHT + timeline.lanes.length * ROW_HEIGHT;
  const pixelRatio: number =
    window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
  const context: CanvasRenderingContext2D | null = readCanvasContext(canvas);

  canvas.style.width = `${String(width)}px`;
  canvas.style.height = `${String(height)}px`;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);

  if (context === null) {
    return [];
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const style: CSSStyleDeclaration = getComputedStyle(plot);
  const grid: string = readCssColor(
    style,
    '--line',
    'rgba(168, 198, 226, 0.2)',
  );
  const tick: string = readCssColor(style, '--faint', '#6d8296');
  const outsideText: string = readCssColor(style, '--text', '#e7eef6');
  const plotWidth: number = Math.max(width - HORIZONTAL_PADDING, 1);
  const marks: readonly number[] = readTimelineMarks(timeline.totalMs);

  context.textBaseline = 'middle';
  context.strokeStyle = grid;
  context.lineWidth = 1;

  for (const mark of marks) {
    const x: number = PLOT_PADDING + (mark / timeline.totalMs) * plotWidth;

    context.beginPath();
    context.moveTo(x, RULER_HEIGHT - TICK_STEM);
    context.lineTo(x, height);
    context.stroke();
    context.font = '11px "IBM Plex Mono", ui-monospace, monospace';
    context.fillStyle = tick;
    context.textAlign = mark === 0 ? 'left' : 'center';
    context.fillText(formatTimelineMark(mark), x, TICK_LABEL_Y);
  }

  const bars: TimelineBar[] = timeline.lanes.map(
    (lane: TimelineLane, index: number): TimelineBar => {
      const y: number =
        RULER_HEIGHT + index * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / HALF;
      const x: number =
        PLOT_PADDING + (lane.offsetMs / timeline.totalMs) * plotWidth;
      const barWidth: number = Math.max(
        (lane.durationMs / timeline.totalMs) * plotWidth,
        MIN_BAR_WIDTH,
      );
      const caption: string = timelineCaption(lane);

      context.fillStyle = TIMELINE_KIND_COLOR[lane.kind];
      context.beginPath();
      context.roundRect(x, y, barWidth, BAR_HEIGHT, BAR_RADIUS);
      context.fill();

      context.font = '600 12px "IBM Plex Sans", "Segoe UI", sans-serif';
      context.textAlign = 'left';

      const insideWidth: number = barWidth - LABEL_PADDING * HALF;
      const captionWidth: number = context.measureText(caption).width;
      const fitsInside: boolean = captionWidth <= insideWidth;
      let labelRight: number = x + barWidth;

      if (fitsInside) {
        context.fillStyle = TIMELINE_KIND_TEXT[lane.kind];
        context.fillText(caption, x + LABEL_PADDING, y + BAR_HEIGHT / HALF);
      } else {
        context.fillStyle = outsideText;
        context.fillText(
          caption,
          x + barWidth + LABEL_GAP,
          y + BAR_HEIGHT / HALF,
        );
        labelRight = x + barWidth + LABEL_GAP + captionWidth;
      }

      return {
        height: BAR_HEIGHT,
        labelRight,
        lane,
        width: barWidth,
        x,
        y,
      };
    },
  );

  return bars;
}

function timelineCaption(lane: TimelineLane): string {
  return `${lane.label}  ${durationFormat.format(lane.durationMs)} ms`;
}

function readPresentKinds(timeline: Timeline): readonly TimelineKind[] {
  const kinds: TimelineKind[] = [];

  for (const lane of timeline.lanes) {
    if (!kinds.includes(lane.kind)) {
      kinds.push(lane.kind);
    }
  }

  return kinds;
}

function readCssColor(
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
): string {
  const value: string = style.getPropertyValue(name).trim();

  return value.length > 0 ? value : fallback;
}
