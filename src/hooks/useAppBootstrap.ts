import { useEffect, useState } from 'react';
import { initDb } from '../db/sqlite';

export const useAppBootstrap = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb().finally(() => setReady(true));
  }, []);

  return ready;
};
