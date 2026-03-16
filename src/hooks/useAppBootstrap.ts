import { useEffect, useState } from 'react';
import { initDb } from '../db/sqlite';

type BootstrapStatus = 'loading' | 'ready' | 'error';

export const useAppBootstrap = () => {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const bootstrap = async () => {
    setStatus('loading');
    setError(null);

    try {
      await initDb();
      setStatus('ready');
    } catch (bootstrapError) {
      setStatus('error');
      setError(
        bootstrapError instanceof Error
          ? bootstrapError.message
          : 'Failed to initialize the app. Please try again.',
      );
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  return {
    status,
    error,
    retry: bootstrap,
  };
};
