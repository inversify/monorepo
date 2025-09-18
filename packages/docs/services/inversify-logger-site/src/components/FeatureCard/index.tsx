import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

interface FeatureCardProps {
  accent?: boolean;
  description: string;
  icon: string;
  title: string;
}

export default function FeatureCard({
  accent,
  description,
  icon,
  title,
}: FeatureCardProps): React.JSX.Element {
  return (
    <div
      className={clsx(styles.featureCard, {
        [styles.accentCard as string]: accent,
      })}
    >
      <div className={styles.featureIcon}>{icon}</div>
      <Heading as="h3" className={styles.featureTitle}>
        {title}
      </Heading>
      <p className={styles.featureDescription}>{description}</p>
      <div className={styles.cardShimmer}></div>
    </div>
  );
}
