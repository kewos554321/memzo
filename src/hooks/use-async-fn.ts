import { useRef, useState } from "react";

/**
 * Wraps an async function with loading state.
 * Prevents duplicate executions while the function is running.
 *
 * @example
 * const [submit, loading] = useAsyncFn(async () => {
 *   await fetch("/api/...");
 *   router.push("/");
 * });
 */
export function useAsyncFn<T extends unknown[]>(
  fn: (...args: T) => Promise<void>
): [(...args: T) => Promise<void>, boolean] {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const handlerRef = useRef(async (...args: T) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      await fnRef.current(...args);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  });

  return [handlerRef.current, loading];
}
