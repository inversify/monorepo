import BrowserOnly from '@docusaurus/BrowserOnly';
import { ServiceIdentifier } from '@inversifyjs/common';
import { GetPlanOptions, PlanResult } from '@inversifyjs/core';
import { Cloneable, CloneableFunction } from '@inversifyjs/react-code-runner';
import { InversifyCodeEditor } from '@inversifyjs/react-code-runner/InversifyCodeEditor';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { useState } from 'react';

import { Button } from '../Button';
import MermaidGraph from '../MermaidGraph';
import buildMermaidFlowChart from './buildMermaidFlowChart';
import { serviceIdentifierToString } from './serviceIdentifierToString';

interface GraphEntry {
  displayName: string;
  serviceIdentifier: ServiceIdentifier | CloneableFunction;
  source: string;
}

export default function DocusaurusInversifyCodeEditor({
  style,
}: {
  style?: React.CSSProperties;
}) {
  const [graphEntries, setGraphEntries]: [
    GraphEntry[],
    React.Dispatch<React.SetStateAction<GraphEntry[]>>,
  ] = useState<GraphEntry[]>([]);
  const [selectedGraphIndex, setSelectedGraphIndex]: [
    number | undefined,
    React.Dispatch<React.SetStateAction<number | undefined>>,
  ] = useState<number | undefined>(undefined);

  const selectedGraph: GraphEntry | undefined =
    selectedGraphIndex !== undefined
      ? graphEntries[selectedGraphIndex]
      : undefined;

  return (
    <BrowserOnly>
      {() => (
        <>
          <Tabs>
            <TabItem value="editor" label="Editor">
              <InversifyCodeEditor
                beforeCodeRun={() => {
                  setGraphEntries([]);
                  setSelectedGraphIndex(undefined);
                }}
                Button={Button}
                onPlan={(
                  options: Cloneable<GetPlanOptions>,
                  plan: Cloneable<PlanResult>,
                ) => {
                  const graphSource: string = buildMermaidFlowChart(
                    options,
                    plan,
                  );
                  const displayName: string = serviceIdentifierToString(
                    options.serviceIdentifier,
                  );

                  setGraphEntries((prev: GraphEntry[]) => [
                    ...prev,
                    {
                      displayName,
                      serviceIdentifier: options.serviceIdentifier,
                      source: graphSource,
                    },
                  ]);
                  setSelectedGraphIndex((prev: number | undefined) =>
                    prev === undefined ? 0 : graphEntries.length,
                  );
                }}
                style={style}
              />
            </TabItem>
            <TabItem value="graph" label="Graph">
              {graphEntries.length === 0 ? (
                <p>Run the code to generate a dependency graph.</p>
              ) : (
                <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                  <label
                    htmlFor="graph-selector"
                    style={{ marginRight: '0.5rem' }}
                  >
                    Select Graph:
                  </label>
                  <select
                    id="graph-selector"
                    value={selectedGraphIndex ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedGraphIndex(Number(e.target.value));
                    }}
                    style={{
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    {graphEntries.map((entry: GraphEntry, index: number) => (
                      <option key={index} value={index}>
                        {entry.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <MermaidGraph source={selectedGraph?.source} id="mermaid-graph" />
            </TabItem>
          </Tabs>
        </>
      )}
    </BrowserOnly>
  );
}
