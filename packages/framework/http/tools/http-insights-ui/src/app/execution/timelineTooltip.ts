const HALF: number = 2;
const TOOLTIP_GAP: number = 8;

export interface TimelineTooltipPlacement {
  readonly left: number;
  readonly top: number;
  readonly transform: string | undefined;
}

export function readTimelineTooltipPlacement(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
): TimelineTooltipPlacement {
  const shiftX: boolean = x >= canvasWidth / HALF;
  const shiftY: boolean = y >= canvasHeight / HALF;

  return {
    left: shiftX ? x - TOOLTIP_GAP : x + TOOLTIP_GAP,
    top: shiftY ? y - TOOLTIP_GAP : y + TOOLTIP_GAP,
    transform: readTooltipTransform(shiftX, shiftY),
  };
}

function readTooltipTransform(
  shiftX: boolean,
  shiftY: boolean,
): string | undefined {
  if (!shiftX && !shiftY) {
    return undefined;
  }

  const translateX: string = shiftX ? '-100%' : '0';
  const translateY: string = shiftY ? '-100%' : '0';

  return `translate(${translateX}, ${translateY})`;
}
