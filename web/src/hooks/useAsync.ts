import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
}

// Runs `fn` on mount and whenever `deps` change. Returns { loading, data, error }.
// A stale-guard ignores the result of a superseded or unmounted call so late
// responses can't clobber newer state. `fn` is intentionally not in the dep
// array — callers key re-runs off `deps` (e.g. a slug or query), matching the
// read-only fetch-per-route pattern here.
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: null });

    fn().then(
      (data) => {
        if (active) setState({ loading: false, data, error: null });
      },
      (err: unknown) => {
        if (active) {
          const message = err instanceof Error ? err.message : 'Something went wrong.';
          setState({ loading: false, data: null, error: message });
        }
      },
    );

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
