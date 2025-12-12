import mermaid, { RenderResult } from 'mermaid';
import { useEffect, useRef } from 'react';

mermaid.initialize({});

const MermaidGraph: ({
  source,
  id,
}: {
  source: string | undefined;
  id: string;
}) => React.JSX.Element = ({
  source,
  id,
}: {
  source: string | undefined;
  id: string;
}) => {
  const mermaidRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (source !== undefined) {
      const initializeMermaid: () => Promise<void> = async () => {
        if (mermaidRef.current !== null) {
          mermaidRef.current.innerHTML = source;
          const { svg, bindFunctions }: RenderResult = await mermaid.render(
            `mermaid-diagram-${id}`,
            source,
          );
          mermaidRef.current.innerHTML = svg;
          bindFunctions?.(mermaidRef.current);
        }
      };

      void initializeMermaid();
    }
  }, [id, source]);

  return <div id={id} ref={mermaidRef}></div>;
};

export default MermaidGraph;
