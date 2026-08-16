export function generateStatusV1Source(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'StatusV1',
})
export class StatusV1 {
  @OasSchemaProperty({
    type: 'string',
  })
  public status!: string;
}
`;
}
