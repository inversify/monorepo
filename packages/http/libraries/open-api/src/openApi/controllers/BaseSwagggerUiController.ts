import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

import { htmlTemplateString, jsTemplateString } from '../data/constants';
import { SwaggerUiInitOptions } from '../models/SwaggerUiInitOptions';
import { SwaggerUiOptions } from '../models/SwaggerUiOptions';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';

export abstract class BaseSwaggerUiController<TResponse, TResult> {
  readonly #options: SwaggerUiProviderOptions;
  readonly #swaggerUiHtml: string;
  readonly #swaggerUiInitJs: string;

  constructor(options: SwaggerUiProviderOptions) {
    this.#options = options;
    this.#swaggerUiHtml = this.#buildSwaggerUiHtml(options);
    this.#swaggerUiInitJs = this.#buildSwaggerInitJs(
      options.api.openApiObject,
      options.ui?.swaggerUiOptions,
    );
  }

  public getOpenApiObject(): OpenApi3Dot1Object {
    return this.#options.api.openApiObject;
  }

  public getSwaggerUi(): string {
    return this.#swaggerUiHtml;
  }

  public getSwaggerUiInitJs(): string {
    return this.#swaggerUiInitJs;
  }

  public getSwaggerUiResource(resource: string, response: TResponse): TResult {
    const rootPath: string = getAbsoluteFSPath();

    return this._sendFile(response, rootPath, resource);
  }

  #buildJsInitOptions(initOptions: SwaggerUiInitOptions): string {
    const functionPlaceholder: string = '____FUNCTION_PLACEHOLDER____';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const fns: Function[] = [];
    let json: string = JSON.stringify(
      initOptions,
      (_key: string, value: unknown) => {
        if (typeof value === 'function') {
          fns.push(value);
          return functionPlaceholder;
        }
        return value;
      },
    );

    json = json.replace(new RegExp('"' + functionPlaceholder + '"', 'g'), () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (fns.shift() as Function).toString(),
    );

    return `let options = ${json};`;
  }

  #buildSwaggerInitJs(
    openApiObject: OpenApi3Dot1Object,
    swaggerUiOptions: SwaggerUiOptions = {},
  ): string {
    const swaggerInitOptions: SwaggerUiInitOptions = {
      openApiObject,
      swaggerUiOptions,
      swaggerUrl: undefined,
    };

    const jsInitOptions: string = this.#buildJsInitOptions(swaggerInitOptions);

    return jsTemplateString.replace('<% swaggerOptions %>', jsInitOptions);
  }

  #buildSwaggerUiHtml(options: SwaggerUiProviderOptions): string {
    const explorerEnabled: boolean = options.ui?.explorerEnabled === true;

    const explorerCss: string = explorerEnabled
      ? ''
      : '.swagger-ui .topbar .download-url-wrapper { display: none }';

    return htmlTemplateString
      .replace('<% customCss %>', options.ui?.customCss ?? '')
      .replace('<% explorerCss %>', explorerCss)
      .replace('<% favIconString %>', '')
      .replace(/<% baseUrl %>/g, `${options.api.path}/resources/`)
      .replace(
        '<% customJs %>',
        this.#toTags(
          options.ui?.customJs,
          this.#toExternalScriptTag.bind(this),
        ),
      )
      .replace(
        '<% customJsStr %>',
        this.#toTags(
          options.ui?.customJsUrls,
          this.#toInlineScriptTag.bind(this),
        ),
      )
      .replace(
        '<% customCssUrl %>',
        this.#toTags(
          options.ui?.customCssUrls,
          this.#toExternalStylesheetTag.bind(this),
        ),
      )
      .replace('<% title %>', options.ui?.title ?? '');
  }

  #toExternalScriptTag(url: string): string {
    return `<script src='${url}'></script>`;
  }

  #toExternalStylesheetTag(url: string): string {
    return `<link href='${url}' rel='stylesheet'>`;
  }

  #toInlineScriptTag(jsCode: string): string {
    return `<script>${jsCode}</script>`;
  }

  #toTags(
    customCode: string | string[] | undefined,
    toScript: (url: string) => string,
  ): string {
    if (customCode === undefined) {
      return '';
    }

    if (typeof customCode === 'string') {
      return toScript(customCode);
    } else {
      return customCode.map(toScript).join('\n');
    }
  }

  protected abstract _sendFile(
    response: TResponse,
    rootPath: string,
    path: string,
  ): TResult;
}
