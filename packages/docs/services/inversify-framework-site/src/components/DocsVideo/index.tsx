import useBaseUrl from '@docusaurus/useBaseUrl';
import { type ReactElement } from 'react';

import styles from './styles.module.css';

export interface DocsVideoProps {
  readonly label: string;
  readonly poster?: string;
  readonly src: string;
}

export default function DocsVideo(props: DocsVideoProps): ReactElement {
  const posterSrc: string = useBaseUrl(props.poster ?? '');
  const videoSrc: string = useBaseUrl(props.src);
  const hasPoster: boolean = props.poster !== undefined;

  return (
    <figure className={styles.figure}>
      <video
        aria-label={props.label}
        className={styles.video}
        controls
        height={720}
        playsInline
        poster={hasPoster ? posterSrc : undefined}
        preload={hasPoster ? 'none' : 'metadata'}
        width={1280}
      >
        <source src={videoSrc} type="video/mp4" />
        <a href={videoSrc}>{props.label}</a>
      </video>
      <figcaption className={styles.caption}>{props.label}</figcaption>
    </figure>
  );
}
