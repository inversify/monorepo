import React, { useState } from 'react';

const DEFAULT_Z_INDEX_HIGH: number = 3;
const DEFAULT_Z_INDEX_MEDIUM: number = 2;
export const DEFAULT_Z_INDEX_LOW: number = 1;

interface UseHomeFloatingCodeSnippetsReturn {
  handleCodeSnippetClick: (clickedIndex: number) => void;
  snippet_z_indexes: number[];
}

export default function useHomeFloatingCodeSnippets(): UseHomeFloatingCodeSnippetsReturn {
  const [snippet_z_indexes, set_snippet_z_indexes]: [
    number[],
    React.Dispatch<React.SetStateAction<number[]>>,
  ] = useState<number[]>([
    DEFAULT_Z_INDEX_LOW,
    DEFAULT_Z_INDEX_MEDIUM,
    DEFAULT_Z_INDEX_HIGH,
  ]);

  const handleCodeSnippetClick: (clickedIndex: number) => void = (
    clickedIndex: number,
  ): void => {
    const max_index: number = Math.max(...snippet_z_indexes);
    const new_indexes: number[] = [...snippet_z_indexes];
    new_indexes[clickedIndex] = max_index + 1;
    set_snippet_z_indexes(new_indexes);
  };

  return {
    handleCodeSnippetClick,
    snippet_z_indexes,
  };
}
