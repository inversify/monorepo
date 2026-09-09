import { beforeAll, describe, expect, it } from 'vitest';

import { ApiStyle } from '../../models/ApiStyle.js';
import { generateAddResourceSkillSource } from './generateAddResourceSkillSource.js';

describe(generateAddResourceSkillSource, () => {
  describe('when called with code-first', () => {
    let result: string;

    beforeAll(() => {
      result = generateAddResourceSkillSource(ApiStyle.codeFirst);
    });

    it('should describe decorated class models', () => {
      expect(result).toContain('name: add-resource');
      expect(result).toContain(
        'Add request and response API models with the OpenAPI 3.2 schema decorators',
      );
      expect(result).toContain('Domain models must be interfaces, not classes.');
      expect(result).not.toContain('This app is schema first.');
    });
  });

  describe('when called with schema-first', () => {
    let result: string;

    beforeAll(() => {
      result = generateAddResourceSkillSource(ApiStyle.schemaFirst);
    });

    it('should describe JSON schemas, stubs, and generate:api', () => {
      expect(result).toContain('name: add-resource');
      expect(result).toContain('This app is schema first.');
      expect(result).toContain('export type <Name> = any;');
      expect(result).toContain('components.schemas.<Name>');
      expect(result).toContain('OpenApi3Dot2SchemaObject');
      expect(result).toContain('generate:api');
      expect(result).toContain('Domain models must be interfaces, not classes.');
      expect(result).not.toContain(
        'Add request and response API models with the OpenAPI 3.2 schema decorators',
      );
    });
  });
});
