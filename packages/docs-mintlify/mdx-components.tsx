function CodeBlock({
  children,
  language,
}: {
  children?: unknown;
  language?: string;
}) {
  const content =
    typeof children === 'string' ? children : String(children ?? '');

  return (
    <pre>
      <code className={language ? `language-${language}` : undefined}>
        {content}
      </code>
    </pre>
  );
}

export function useMDXComponents(components: Record<string, unknown>) {
  return {
    ...components,
    CodeBlock,
  };
}
