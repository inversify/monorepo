import React from 'react';

import styles from './styles.module.css';

interface DocumentationButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function DocumentationButton({
  href,
  children,
}: DocumentationButtonProps): React.JSX.Element {
  return (
    <div className={styles.buttonContainer}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.documentationButton}
      >
        <span className={styles.buttonText}>{children}</span>
        <span className={styles.buttonIcon}>📖</span>
        <div className={styles.shimmer}></div>
      </a>
    </div>
  );
}
