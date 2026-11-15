"use client";

import { useEffect, useRef } from "react";

export type InstrumentAction = "toggle" | "stop" | "read";

export const INSTRUMENT_EVENT = "earths-pulse:instrument";

interface Handlers {
  onToggle: () => void;
  onStop: () => void;
  onRead: () => void;
}

/**
 * Lets the global voice guide drive an instrument without a pointer.
 *
 * Each instrument mounts once, so a page-level listener is enough. The handler
 * is stored in a ref so a re-render never leaves a stale callback attached.
 */
export function useInstrumentShortcuts(handlers: Handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const listener = (event: Event) => {
      const action = (event as CustomEvent<{ action?: InstrumentAction }>).detail
        ?.action;
      if (action === "toggle") handlersRef.current.onToggle();
      else if (action === "stop") handlersRef.current.onStop();
      else if (action === "read") handlersRef.current.onRead();
    };
    window.addEventListener(INSTRUMENT_EVENT, listener);
    return () => window.removeEventListener(INSTRUMENT_EVENT, listener);
  }, []);
}
