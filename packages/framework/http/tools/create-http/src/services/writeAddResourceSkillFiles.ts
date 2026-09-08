import fs from 'node:fs/promises';
import path from 'node:path';

import { generateAddResourceSkillSource } from '../generation/calculations/generateAddResourceSkillSource.js';
import { type ApiStyle } from '../models/ApiStyle.js';

const ADD_RESOURCE_SKILL_RELATIVE_PATHS: readonly string[] = [
  '.agents/skills/add-resource/SKILL.md',
  '.claude/skills/add-resource/SKILL.md',
];

export async function writeAddResourceSkillFiles(
  projectPath: string,
  apiStyle: ApiStyle,
): Promise<void> {
  const skillSource: string = generateAddResourceSkillSource(apiStyle);

  await Promise.all(
    ADD_RESOURCE_SKILL_RELATIVE_PATHS.map(
      async (relativePath: string): Promise<void> => {
        const absolutePath: string = path.join(projectPath, relativePath);

        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, skillSource, 'utf8');
      },
    ),
  );
}
