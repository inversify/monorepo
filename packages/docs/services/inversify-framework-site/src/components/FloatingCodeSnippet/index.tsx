import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

interface CodeSnippet {
  code: string;
  id: number;
  language: string;
  title: string;
}

const ANIMATION_DELAY_MS: number = 500;
const ANIMATION_DELAY_MULTIPLIER: number = 0.2;

interface FloatingCodeSnippetProps {
  index: number;
  snippet: CodeSnippet;
  zIndex: number;
  onClick: () => void;
}

export default function FloatingCodeSnippet({
  index,
  onClick,
  snippet,
  zIndex,
}: FloatingCodeSnippetProps): React.JSX.Element {
  const [isVisible, setIsVisible]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false);

  useEffect(() => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      setIsVisible(true);
    }, index * ANIMATION_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [index]);

  return (
    <div
      className={clsx(styles.floatingCode, {
        [styles.visible as string]: isVisible,
      })}
      style={
        {
          '--delay': `${(index * ANIMATION_DELAY_MULTIPLIER).toString()}s`,
          zIndex,
        } as React.CSSProperties
      }
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className={styles.codeSnippetHeader}>
        <span className={styles.codeTitle}>{snippet.title}</span>
        <span className={styles.codeLang}>{snippet.language}</span>
      </div>
      <CodeBlock className={styles.codeSnippetContent ?? ''} language="ts">
        {snippet.code}
      </CodeBlock>
    </div>
  );
}

export type { CodeSnippet };
