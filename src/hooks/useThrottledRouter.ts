import { router } from "expo-router";
import { useCallback, useRef } from "react";

export function useThrottledRouter(delay = 800) {
  const canNavigate = useRef(true);

  const push = useCallback(
    (...args: Parameters<typeof router.push>) => {
      if (!canNavigate.current) return;
      canNavigate.current = false;
      router.push(...args);
      setTimeout(() => {
        canNavigate.current = true;
      }, delay);
    },
    [delay]
  );

  const replace = useCallback(
    (...args: Parameters<typeof router.replace>) => {
      if (!canNavigate.current) return;
      canNavigate.current = false;
      router.replace(...args);
      setTimeout(() => {
        canNavigate.current = true;
      }, delay);
    },
    [delay]
  );

  return { push, replace };
}
