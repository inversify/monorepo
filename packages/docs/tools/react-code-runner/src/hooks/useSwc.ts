import initSwc from '@swc/wasm-web';
import { useEffect, useState } from 'react';

export function useSwc() {
  const [initialized, setInitialized]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState(false);

  useEffect(() => {
    async function importAndRunSwcOnMount() {
      await initSwc();
      setInitialized(true);
    }

    void importAndRunSwcOnMount();
  }, []);

  return initialized;
}
