// Monaco Editor MDX Component for Mintlify
// This component wraps the Monaco editor to work with Mintlify's MDX system

import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  language?: string;
  value: string;
  height?: string;
  theme?: 'vs' | 'vs-dark';
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  language = 'typescript',
  value,
  height = '400px',
  theme = 'vs-dark',
  readOnly = true,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      });

      if (onChange) {
        editorRef.current.onDidChangeModelContent(() => {
          onChange(editorRef.current?.getValue() || '');
        });
      }
    }

    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, [language, theme, readOnly, onChange]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};

export default MonacoEditor;
