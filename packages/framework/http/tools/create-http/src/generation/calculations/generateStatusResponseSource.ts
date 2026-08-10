export function generateStatusResponseSource(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'StatusResponse',
})
export class StatusResponse {
  @OasSchemaProperty({
    type: 'string',
  })
  public status!: string;
}
`;
}
