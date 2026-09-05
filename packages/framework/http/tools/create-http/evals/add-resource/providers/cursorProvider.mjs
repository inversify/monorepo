import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Agent, CursorAgentError, JsonlLocalAgentStore } from '@cursor/sdk';

const evalRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const skillPathPattern =
  /(?:^|[^\w.-])((?:[\w./\\-]+)?add-resource\/SKILL\.md)/gi;

function resolveWorkspaceDir(config, context) {
  const raw = config?.working_dir ?? context?.vars?.workspaceDir;

  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error(
      'Cursor provider requires config.working_dir or context.vars.workspaceDir.',
    );
  }

  return path.isAbsolute(raw) ? raw : path.resolve(evalRoot, raw);
}

function mapTokenUsage(usage) {
  if (usage == null) {
    return undefined;
  }

  return {
    cached: usage.cacheReadTokens,
    completion: usage.outputTokens ?? 0,
    prompt: usage.inputTokens ?? 0,
    total: usage.totalTokens,
  };
}

function stringifyUnknown(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const searchToolNames = new Set([
  'codebase_search',
  'find',
  'glob',
  'grep',
  'list',
  'ls',
  'sem_search',
  'semsearch',
]);

function resolveWorkspacePath(candidatePath, workspaceDir) {
  return path.isAbsolute(candidatePath)
    ? path.normalize(candidatePath)
    : path.resolve(workspaceDir, candidatePath);
}

function isCanonicalSkillPath(candidatePath, workspaceDir) {
  const resolvedCandidate = resolveWorkspacePath(candidatePath, workspaceDir);
  const canonicalPaths = [
    path.join(workspaceDir, '.agents', 'skills', 'add-resource', 'SKILL.md'),
    path.join(workspaceDir, '.claude', 'skills', 'add-resource', 'SKILL.md'),
  ].map((skillPath) => path.normalize(skillPath));

  return canonicalPaths.includes(resolvedCandidate);
}

function withWorkspaceSkill(prompt) {
  return [
    'Read and follow `.agents/skills/add-resource/SKILL.md` in this workspace before editing.',
    'Do not read skills, templates, or source files from parent directories.',
    '',
    prompt,
  ].join('\n');
}

function collectSkillCalls(event, workspaceDir) {
  if (event?.type !== 'tool_call' || event.status !== 'completed') {
    return [];
  }

  const toolName = typeof event.name === 'string' ? event.name : '';
  if (searchToolNames.has(toolName.toLowerCase())) {
    return [];
  }

  const haystack = [event.name, event.args, event.result]
    .map((value) => stringifyUnknown(value))
    .join('\n');

  if (
    /skill/i.test(toolName) &&
    /(?:^|[^\w-])add-resource(?:[^\w-]|$)/.test(haystack)
  ) {
    return [
      {
        name: 'add-resource',
        source: 'heuristic',
      },
    ];
  }

  const skillCalls = [];

  for (const match of haystack.matchAll(skillPathPattern)) {
    const relativePath = match[1].replaceAll('\\', '/');

    if (!isCanonicalSkillPath(relativePath, workspaceDir)) {
      continue;
    }

    if (!/^(?:read|edit|write)$/i.test(toolName)) {
      continue;
    }

    skillCalls.push({
      name: 'add-resource',
      path: relativePath,
      source: 'heuristic',
    });
  }

  return skillCalls;
}

function resolveModelSelection(config) {
  const fast = config?.fast ?? true;

  return {
    id: config?.model ?? 'composer-2.5',
    params: [
      {
        id: 'fast',
        value: fast === true || fast === 'true' ? 'true' : 'false',
      },
    ],
  };
}

function uniqueSkillCalls(skillCalls) {
  const seen = new Set();
  const unique = [];

  for (const skillCall of skillCalls) {
    const key = `${skillCall.name}:${skillCall.path}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(skillCall);
  }

  return unique;
}

export default class CursorSdkProvider {
  constructor(options = {}) {
    this.config = options.config ?? {};
    this.providerId = options.id ?? 'cursor:sdk';
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context) {
    let workspaceDir;

    try {
      workspaceDir = resolveWorkspaceDir(this.config, context);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const store = new JsonlLocalAgentStore(
      path.join(workspaceDir, '.cursor-agent-store'),
    );
    const skillCalls = [];

    try {
      await using agent = await Agent.create({
        apiKey: this.config.apiKey ?? process.env.CURSOR_API_KEY,
        local: {
          cwd: workspaceDir,
          sandboxOptions: { enabled: false },
          // Empty: 'project' walks to this monorepo and injects its skills.
          settingSources: [],
          store,
        },
        model: resolveModelSelection(this.config),
      });

      const run = await agent.send(withWorkspaceSkill(prompt));

      for await (const event of run.stream()) {
        skillCalls.push(...collectSkillCalls(event, workspaceDir));
      }

      const result = await run.wait();

      if (result.status !== 'finished') {
        return {
          error:
            result.error?.message ??
            `Cursor run ended with status "${result.status}".`,
          metadata: {
            agentId: agent.agentId,
            sessionId: result.id,
            skillCalls: uniqueSkillCalls(skillCalls),
          },
        };
      }

      return {
        metadata: {
          agentId: agent.agentId,
          sessionId: result.id,
          skillCalls: uniqueSkillCalls(skillCalls),
        },
        output: result.result ?? '',
        tokenUsage: mapTokenUsage(result.usage),
      };
    } catch (error) {
      const message =
        error instanceof CursorAgentError || error instanceof Error
          ? error.message
          : String(error);

      return {
        error: message,
        metadata: {
          skillCalls: uniqueSkillCalls(skillCalls),
        },
      };
    }
  }
}
