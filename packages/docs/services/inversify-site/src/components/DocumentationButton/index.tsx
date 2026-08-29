import Link from '@docusaurus/Link';
import React, { HTMLAttributeAnchorTarget } from 'react';

import styles from './styles.module.css';

interface DocumentationButtonProps {
  href: string;
  children: React.ReactNode;
  target?: HTMLAttributeAnchorTarget;
}

export default function DocumentationButton({
  href,
  children,
  target,
}: DocumentationButtonProps): React.JSX.Element {
  return (
    <div className={styles.buttonContainer}>
      <Link
        to={href}
        target={target}
        rel="noopener noreferrer"
        className={styles.documentationButton ?? ''}
      >
        <span className={styles.buttonText}>{children}</span>
        <span className={styles.buttonIcon}>📖</span>
        <div className={styles.shimmer}></div>
      </Link>
    </div>
  );
}
