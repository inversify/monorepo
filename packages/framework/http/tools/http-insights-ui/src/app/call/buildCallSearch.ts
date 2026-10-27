import { type CallSectionId } from './callSections.js';

const CALL_SECTION_PARAM: string = 'section';
const CALL_STAGE_PARAM: string = 'stage';

export function buildCallSearch(
  section: CallSectionId,
  stageId: string | null,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();

  if (section !== 'timeline') {
    params.set(CALL_SECTION_PARAM, section);
  }

  if (section !== 'timeline' && stageId !== null && stageId.length > 0) {
    params.set(CALL_STAGE_PARAM, stageId);
  }

  return params;
}
