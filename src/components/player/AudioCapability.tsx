"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => "AudioContext" in window;
const getServerSnapshot = () => false;

/**
 * Reports a real browser capability without creating an AudioContext.
 * The engine itself remains unimplemented in Stage 1.
 */
export function AudioCapability() {
  const supported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <span className="audio-capability">
      {supported ? "Browser supported" : "Unavailable"}
    </span>
  );
}
