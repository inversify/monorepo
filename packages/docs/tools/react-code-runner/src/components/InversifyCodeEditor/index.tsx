import { transformSync } from '@swc/wasm-web';
import type * as monaco from 'monaco-editor';
import React, { MouseEventHandler, useEffect, useRef } from 'react';

import createRpcWorker, {
  CreateRpcWorkerResult,
} from '../../actions/createRcpWorker';
import getInversifyMainFileMonacoModel from '../../actions/getInversifyMainFileMonacoModel';
import getMonaco from '../../actions/getMonaco';
import transformSourceCode from '../../actions/transformSourceCode';
import { mapImports } from '../../calculations/mapImports';
import { useSwc } from '../../hooks/useSwc';
import styles from './styles.module.css';

export interface InversifyCodeEditorProps {
  Button: (params: {
    readonly label?: string | undefined;
    readonly onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  }) => React.ReactElement;
  style?: React.CSSProperties | undefined;
}

export function InversifyCodeEditor({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Button,
  style,
}: InversifyCodeEditorProps): React.ReactElement {
  const isSwcInitialized: boolean = useSwc();
  const rpcWorker: React.RefObject<CreateRpcWorkerResult> =
    useRef(createRpcWorker());
  const containerElement: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const editor: React.RefObject<monaco.editor.IStandaloneCodeEditor | null> =
    useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = React.useState<boolean>(true);

  useEffect(() => {
    if (containerElement.current) {
      void (async () => {
        const monacoImport: typeof monaco = await getMonaco();

        const model: monaco.editor.ITextModel =
          getInversifyMainFileMonacoModel(monacoImport);

        editor.current = monacoImport.editor.create(
          containerElement.current as HTMLDivElement,
          {
            model,
          },
        );

        setIsLoading(false);
      })();
    }

    return () => {
      if (editor.current) {
        editor.current.dispose();
        rpcWorker.current.terminate();
      }
    };
  }, []);

  const containerStyles: React.CSSProperties = {
    ...style,
    position: 'relative',
  };

  const spinnerOverlayStyles: React.CSSProperties = {
    display: isLoading ? 'flex' : 'none',
  };

  return (
    <div style={containerStyles}>
      <div className={styles.spinnerOverlay} style={spinnerOverlayStyles}>
        <div className={styles.spinnerDot} />
      </div>
      <div style={{ height: '100%', width: '100%' }}>
        <div
          ref={containerElement}
          className="react-monaco-editor-container"
          style={{ height: '100%', width: '100%' }}
        />
        <Button
          onClick={() => {
            if (editor.current !== null && isSwcInitialized) {
              const transpiledJsCode: string = transformSync(
                editor.current.getValue(),
                {
                  jsc: {
                    parser: {
                      decorators: true,
                      syntax: 'typescript',
                    },
                    target: 'es2022',
                    transform: {
                      decoratorMetadata: true,
                      legacyDecorator: true,
                    },
                  },
                  module: {
                    type: 'es6',
                  },
                },
              ).code;

              const code: string = transformSourceCode(transpiledJsCode, [
                [
                  'customMapImports',
                  mapImports({
                    inversify: `${window.location.origin}/inversify.js`,
                  }),
                ],
              ]);

              const args: unknown[] = [];
              void rpcWorker.current.rpc(args, code);
            }
          }}
          label="Run"
        />
      </div>
    </div>
  );
}
