// MDX Components Registration for Mintlify
// This file should be created in each documentation site root

import type { MDXComponents } from 'mdx/types';
import React from 'react';

// Import custom components
import { MonacoEditor } from './src/components/MonacoEditor';
import { InteractiveCodeRunner } from './src/components/CodeRunner';

// Markdown component overrides (optional)
const components: MDXComponents = {
  // Override heading styles if needed
  h1: ({ children, ...props }) => (
    <h1 style={{ marginTop: '32px', marginBottom: '16px' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 style={{ marginTop: '24px', marginBottom: '12px' }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 style={{ marginTop: '16px', marginBottom: '8px' }} {...props}>
      {children}
    </h3>
  ),

  // Override code blocks
  code: ({ children, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'plaintext';

    return (
      <code
        className={className}
        style={{
          backgroundColor: '#f3f4f6',
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        }}
        {...props}
      >
        {children}
      </code>
    );
  },

  // Override pre (code blocks)
  pre: ({ children, ...props }) => (
    <pre
      style={{
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        marginBottom: '16px',
      }}
      {...props}
    >
      {children}
    </pre>
  ),

  // Override links
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      style={{
        color: '#0066cc',
        textDecoration: 'none',
        borderBottom: '1px solid #0066cc',
      }}
      {...props}
    >
      {children}
    </a>
  ),

  // Override blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote
      style={{
        borderLeft: '4px solid #e5e7eb',
        paddingLeft: '16px',
        marginLeft: 0,
        marginRight: 0,
        color: '#6b7280',
        fontStyle: 'italic',
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Custom components
  MonacoEditor,
  CodeRunner: InteractiveCodeRunner,

  // Add more overrides as needed
  table: ({ children, ...props }) => (
    <div
      style={{
        overflowX: 'auto',
        marginBottom: '16px',
      }}
    >
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }) => (
    <th
      style={{
        border: '1px solid #e5e7eb',
        padding: '8px 12px',
        textAlign: 'left',
        fontWeight: 600,
        backgroundColor: '#f9fafb',
      }}
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td
      style={{
        border: '1px solid #e5e7eb',
        padding: '8px 12px',
      }}
      {...props}
    >
      {children}
    </td>
  ),
};

export const useMDXComponents = (defaults: MDXComponents): MDXComponents => {
  return {
    ...defaults,
    ...components,
  };
};
