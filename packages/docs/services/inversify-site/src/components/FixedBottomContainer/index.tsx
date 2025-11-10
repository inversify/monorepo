import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import styles from './styles.module.css';

interface FixedBottomContainerProps {
  children: React.ReactNode;
}

export default function FixedBottomContainer({
  children,
}: FixedBottomContainerProps): React.JSX.Element {
  const [isVisible, setIsVisible]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(true);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className={styles.fixedBottomContainer}>
      <button
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
        }}
        aria-label="Close"
      >
        <Icon icon="carbon:close" />
      </button>
      {children}
    </div>
  );
}
