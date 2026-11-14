"use client";

import { useSyncExternalStore } from "react";

const subscribeCache = new Map<string, (onChange: () => void) => () => void>();

function subscribe(query: string) {
  const cached = subscribeCache.get(query);
  if (cached) return cached;

  const subscribeFn = (onChange: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  };
  subscribeCache.set(query, subscribeFn);
  return subscribeFn;
}

const snapshotCache = new Map<string, () => boolean>();

function snapshot(query: string) {
  const cached = snapshotCache.get(query);
  if (cached) return cached;
  const read = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;
  snapshotCache.set(query, read);
  return read;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(subscribe(query), snapshot(query), () => false);
}
