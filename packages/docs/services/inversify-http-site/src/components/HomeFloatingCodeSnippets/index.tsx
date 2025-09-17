import FloatingCodeSnippet, {
  CodeSnippet,
} from '@site/src/components/FloatingCodeSnippet';
import useHomeFloatingCodeSnippets, {
  DEFAULT_Z_INDEX_LOW,
} from '@site/src/hooks/useHomeFloatingCodeSnippets';
import React from 'react';

import styles from './styles.module.css';

interface HomeFloatingCodeSnippetsProps {
  codeSnippets: CodeSnippet[];
}

export default function HomeFloatingCodeSnippets({
  codeSnippets,
}: HomeFloatingCodeSnippetsProps): React.JSX.Element {
  const {
    handleCodeSnippetClick,
    snippet_z_indexes,
  }: {
    handleCodeSnippetClick: (clickedIndex: number) => void;
    snippet_z_indexes: number[];
  } = useHomeFloatingCodeSnippets();

  return (
    <div className={styles.codeDemo}>
      {codeSnippets.map((snippet: CodeSnippet, index: number) => (
        <FloatingCodeSnippet
          key={snippet.id}
          index={index}
          snippet={snippet}
          zIndex={snippet_z_indexes[index] ?? DEFAULT_Z_INDEX_LOW}
          onClick={() => {
            handleCodeSnippetClick(index);
          }}
        />
      ))}
    </div>
  );
}
