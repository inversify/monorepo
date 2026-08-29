interface DocusaurusInversifyCodeEditorProps {
  style?: Record<string, string | number>;
}

/**
 * Placeholder for the interactive planning editor.
 * The full Monaco-based editor is not available in the Mintlify build yet.
 */
export default function DocusaurusInversifyCodeEditor(
  _props: DocusaurusInversifyCodeEditorProps,
) {
  return (
    <aside>
      <p>
        Interactive planning visualization is available in the Docusaurus docs
        site.
      </p>
    </aside>
  );
}
