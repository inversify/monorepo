// React Code Runner MDX Component for Mintlify
// This component wraps the InversifyJS React code runner

import React, { useState } from 'react';
import { CodeRunner } from '@inversifyjs/react-code-runner';

interface CodeRunnerProps {
  code: string;
  title?: string;
  language?: string;
  showOutput?: boolean;
}

export const InteractiveCodeRunner: React.FC<CodeRunnerProps> = ({
  code,
  title,
  language = 'typescript',
  showOutput = true,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div
      style={{
        marginBottom: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
      }}
    >
      {title && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f3f4f6',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <CodeRunner
          code={code}
          language={language}
          showOutput={showOutput}
          onRunStart={() => setIsRunning(true)}
          onRunEnd={() => setIsRunning(false)}
        />
      </div>
    </div>
  );
};

export default InteractiveCodeRunner;
