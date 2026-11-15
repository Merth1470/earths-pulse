"use client";

/**
 * Persisted voice preferences, read through `useSyncExternalStore`.
 *
 * Keeping this outside component state means the server render, the first
 * client render, and a second tab all agree, and no effect has to push state
 * in after mount.
 */

const MUTED_KEY = "earths-pulse:voice-muted";
const CHANGE_EVENT = "earths-pulse:voice-preference";

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeVoicePreferences(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readVoiceMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeVoiceMuted(value: boolean) {
  try {
    window.localStorage.setItem(MUTED_KEY, value ? "true" : "false");
  } catch {
    /* storage can be denied; the in-memory switch still works */
  }
  notify();
}

/** True once the intro has been spoken in this tab. */
export function markIntroSeen() {
  try {
    window.sessionStorage.setItem("earths-pulse:voice-intro", "true");
  } catch {
    /* ignore */
  }
}

export function introWasSeen(): boolean {
  try {
    return window.sessionStorage.getItem("earths-pulse:voice-intro") === "true";
  } catch {
    return false;
  }
}
