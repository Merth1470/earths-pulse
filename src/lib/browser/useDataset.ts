"use client";

import { useCallback, useEffect, useState } from "react";

interface DatasetState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

/**
 * Fetch a bundled dataset with cancellation and a retry counter. The loader is
 * expected to be a stable module-level function.
 */
export function useDataset<T>(loader: () => Promise<T>): DatasetState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loading = data === null && error === null;

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((loaded) => {
        if (!cancelled) setData(loaded);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "The bundled dataset could not be retrieved.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, loader]);

  const retry = useCallback(() => {
    setData(null);
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  return { data, error, loading, retry };
}
