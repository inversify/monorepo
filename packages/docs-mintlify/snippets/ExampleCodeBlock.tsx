import { type ReactNode, useEffect, useState } from 'react';

export interface CustomCodeBlockProps {
  filename?: string;
  language?: string;
  children?: ReactNode;
}

export const ExampleCodeBlock = ({
  filename,
  language,
  children,
}: CustomCodeBlockProps) => {
  const extractInlineSource = (node: ReactNode): string | null => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return null;
    }
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'number') {
      return String(node);
    }
    if (Array.isArray(node)) {
      const parts: string[] = [];
      for (const child of node) {
        const inner = extractInlineSource(child as ReactNode);
        if (inner !== null) parts.push(inner);
      }
      return parts.length === 0 ? null : parts.join('');
    }
    const asElement = node as { props?: { children?: ReactNode } };
    if (asElement.props !== undefined) {
      return extractInlineSource(asElement.props.children);
    }
    return null;
  };

  const inlineSourceRaw = extractInlineSource(children);
  const inlineSource =
    inlineSourceRaw === null
      ? null
      : inlineSourceRaw.replace(/^\n+/u, '').replace(/\s+$/u, '') === ''
        ? null
        : inlineSourceRaw;
  const resolvedLanguage = language ?? (inlineSource !== null ? 'bash' : 'ts');
  const languageAliases: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    sh: 'bash',
    shell: 'bash',
    ts: 'typescript',
    tsx: 'tsx',
  };
  const prismLanguage = languageAliases[resolvedLanguage] ?? resolvedLanguage;

  const [codeHtml, setCodeHtml] = useState<string>('');
  const [rawCode, setRawCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const escapeHtml = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const themeCss = [
      '.example-code-block .token.comment,',
      '.example-code-block .token.prolog,',
      '.example-code-block .token.doctype,',
      '.example-code-block .token.cdata { color: #6a9955; font-style: italic; }',
      '.example-code-block .token.punctuation { color: #d4d4d4; }',
      '.example-code-block .token.property,',
      '.example-code-block .token.tag,',
      '.example-code-block .token.boolean,',
      '.example-code-block .token.number,',
      '.example-code-block .token.constant,',
      '.example-code-block .token.symbol,',
      '.example-code-block .token.deleted { color: #b5cea8; }',
      '.example-code-block .token.selector,',
      '.example-code-block .token.attr-name,',
      '.example-code-block .token.string,',
      '.example-code-block .token.char,',
      '.example-code-block .token.builtin,',
      '.example-code-block .token.inserted { color: #ce9178; }',
      '.example-code-block .token.operator,',
      '.example-code-block .token.entity,',
      '.example-code-block .token.url { color: #d4d4d4; }',
      '.example-code-block .token.atrule,',
      '.example-code-block .token.attr-value,',
      '.example-code-block .token.keyword { color: #569cd6; }',
      '.example-code-block .token.function,',
      '.example-code-block .token.class-name,',
      '.example-code-block .token.maybe-class-name { color: #dcdcaa; }',
      '.example-code-block .token.regex,',
      '.example-code-block .token.important,',
      '.example-code-block .token.variable { color: #d16969; }',
      '.example-code-block .token.decorator,',
      '.example-code-block .token.annotation { color: #dcdcaa; }',
      '.example-code-block .token.parameter { color: #9cdcfe; }',
      'html:not(.dark) .example-code-block .token.comment { color: #6a737d; }',
      'html:not(.dark) .example-code-block .token.punctuation { color: #24292e; }',
      'html:not(.dark) .example-code-block .token.number,',
      'html:not(.dark) .example-code-block .token.boolean,',
      'html:not(.dark) .example-code-block .token.constant { color: #005cc5; }',
      'html:not(.dark) .example-code-block .token.string,',
      'html:not(.dark) .example-code-block .token.builtin { color: #032f62; }',
      'html:not(.dark) .example-code-block .token.operator { color: #24292e; }',
      'html:not(.dark) .example-code-block .token.keyword { color: #d73a49; }',
      'html:not(.dark) .example-code-block .token.function,',
      'html:not(.dark) .example-code-block .token.class-name,',
      'html:not(.dark) .example-code-block .token.maybe-class-name { color: #6f42c1; }',
      'html:not(.dark) .example-code-block .token.decorator,',
      'html:not(.dark) .example-code-block .token.annotation { color: #6f42c1; }',
      'html:not(.dark) .example-code-block .token.parameter { color: #24292e; }',
    ].join('\n');

    const ensureTheme = (): void => {
      if (typeof document === 'undefined') return;
      if (document.getElementById('example-code-block-theme') !== null) return;
      const style = document.createElement('style');
      style.id = 'example-code-block-theme';
      style.textContent = themeCss;
      document.head.appendChild(style);
    };

    const loadScript = async (id: string, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.getElementById(
          id,
        ) as HTMLScriptElement | null;
        if (existing !== null) {
          if (existing.dataset.loaded === 'true') {
            resolve();
            return;
          }
          existing.addEventListener('load', () => {
            resolve();
          });
          existing.addEventListener('error', () => {
            reject(new Error('failed to load ' + src));
          });
          return;
        }
        const el = document.createElement('script');
        el.id = id;
        el.src = src;
        el.async = false;
        el.addEventListener('load', () => {
          el.dataset.loaded = 'true';
          resolve();
        });
        el.addEventListener('error', () => {
          reject(new Error('failed to load ' + src));
        });
        document.head.appendChild(el);
      });
    };

    const loadPrism = async (): Promise<{
      highlight: (code: string, grammar: unknown, lang: string) => string;
      languages: Record<string, unknown>;
    }> => {
      const base = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0';
      await loadScript('example-prism-core', base + '/prism.min.js');
      await loadScript(
        'example-prism-typescript',
        base + '/components/prism-typescript.min.js',
      );
      await loadScript(
        'example-prism-tsx',
        base + '/components/prism-tsx.min.js',
      );
      await loadScript(
        'example-prism-bash',
        base + '/components/prism-bash.min.js',
      );
      await loadScript(
        'example-prism-json',
        base + '/components/prism-json.min.js',
      );
      const w = window as unknown as {
        Prism?: {
          highlight: (code: string, grammar: unknown, lang: string) => string;
          languages: Record<string, unknown>;
        };
      };
      if (w.Prism === undefined) {
        throw new Error('Prism failed to attach to window');
      }
      return w.Prism;
    };

    ensureTheme();

    const highlightAndSet = async (trimmed: string): Promise<void> => {
      setRawCode(trimmed);
      try {
        const Prism = await loadPrism();
        if (cancelled) return;
        const grammar =
          Prism.languages[prismLanguage] ?? Prism.languages.typescript;
        if (grammar === undefined) {
          setCodeHtml(escapeHtml(trimmed));
          return;
        }
        const html: string = Prism.highlight(trimmed, grammar, prismLanguage);
        setCodeHtml(html);
      } catch (_err: unknown) {
        if (!cancelled) {
          setCodeHtml(escapeHtml(trimmed));
        }
      }
    };

    if (inlineSource !== null) {
      const trimmed = inlineSource.replace(/\s+$/u, '');
      void highlightAndSet(trimmed);
      return () => {
        cancelled = true;
      };
    }

    if (filename === undefined) {
      setError(
        'ExampleCodeBlock requires either a filename prop or inline children',
      );
      return () => {
        cancelled = true;
      };
    }

    fetch(filename)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('HTTP ' + String(res.status));
        }
        return res.text();
      })
      .then(async (text) => {
        if (cancelled) return;
        const trimmed = text.replace(/\s+$/u, '');
        await highlightAndSet(trimmed);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filename, prismLanguage, inlineSource]);

  const handleCopy = () => {
    if (rawCode === '') return;
    void navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    });
  };

  if (error !== null) {
    return (
      <div className="example-code-block code-block mt-5 mb-8 not-prose rounded-2xl relative min-w-0 border border-red-500/30 bg-red-500/5 p-4 text-red-500 font-mono text-sm">
        ExampleCodeBlock error loading {filename}: {error}
      </div>
    );
  }

  return (
    <div
      className="example-code-block code-block mt-5 mb-8 not-prose rounded-2xl relative group min-w-0 print:print-color-exact text-gray-950 dark:text-gray-50 codeblock-light border border-gray-950/10 dark:border-white/10 dark:twoslash-dark bg-transparent dark:bg-transparent"
      data-example-code-block-filename={filename}
      data-example-code-block-language={prismLanguage}
    >
      <div
        data-floating-buttons="true"
        className="absolute top-3 right-4 flex items-center gap-1.5 print:hidden"
      >
        <div className="code-block-copy-button z-10 select-none">
          <button
            type="button"
            onClick={handleCopy}
            className="size-6.5 flex items-center justify-center rounded-md group/copy-button bg-gray-100 dark:bg-gray-800"
            aria-label="Copy the contents from the code block"
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4 shrink-0 text-emerald-500"
              >
                <path d="M3.5 9.5L7.5 13.5L14.5 4.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4 shrink-0 text-gray-400 group-hover/copy-button:text-gray-500 dark:text-white/40 dark:group-hover/copy-button:text-white/60"
              >
                <path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" />
                <path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div
        role="presentation"
        data-component-part="code-block-root"
        className="w-0 min-w-full max-w-full h-full text-sm leading-6 code-block-background rounded-2xl bg-white dark:bg-codeblock"
      >
        <div
          role="presentation"
          className="size-full rounded-[inherit] py-3.5 px-4 base-ui-disable-scrollbar"
          style={{ overflow: 'auto' }}
        >
          <div className="min-w-full h-full">
            <div className="font-mono whitespace-pre leading-6 text-gray-900 dark:text-gray-100">
              <pre
                style={{
                  background: 'transparent',
                  color: 'inherit',
                  margin: 0,
                }}
              >
                <code
                  data-language={prismLanguage}
                  className={'language-' + prismLanguage}
                  dangerouslySetInnerHTML={{ __html: codeHtml }}
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
