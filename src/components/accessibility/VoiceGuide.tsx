"use client";

import { CircleHelp, Keyboard, Volume2, VolumeX, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  KEY_GROUPS,
  ROUTE_SHORTCUTS,
  fullGuideSpeech,
  introSpeech,
  replaySpeech,
  routeGuide,
} from "@/lib/accessibility/guide";
import {
  cancelSpeech,
  englishVoice,
  setSpeechMuted,
  speakSequence,
  speechSupported,
} from "@/lib/accessibility/speech";
import { INSTRUMENT_EVENT } from "@/lib/accessibility/useInstrumentShortcuts";
import {
  introWasSeen,
  markIntroSeen,
  readVoiceMuted,
  subscribeVoicePreferences,
  writeVoiceMuted,
} from "@/lib/browser/voicePreferences";

const subscribeNoop = () => () => {};
const speechSupportedSnapshot = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * True when a keystroke belongs to the control instead of the shortcut layer.
 *
 * Text fields need every character. A select only needs the keys its own
 * type-ahead uses, so "J" still reaches the shortcut layer inside a list of
 * years while "N" still jumps to "North Atlantic" inside a list of regions.
 */
function controlConsumesKey(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return !["range", "checkbox", "radio", "button", "submit", "reset"].includes(type);
  }
  if (tag === "SELECT") {
    if (key.length !== 1) return false;
    const wanted = key.toLowerCase();
    return Array.from((target as HTMLSelectElement).options).some((option) =>
      option.text.trim().toLowerCase().startsWith(wanted),
    );
  }
  return target.isContentEditable;
}

function focusFirst(selector: string): boolean {
  const scope = document.getElementById("main") ?? document;
  const element = scope.querySelector<HTMLElement>(selector);
  if (!element) return false;
  element.focus();
  return true;
}

function instrumentPresent(): boolean {
  return Boolean(document.querySelector("[data-ep-instrument]"));
}

/**
 * The site-wide voice guide.
 *
 * It speaks the introduction on first visit, replays itself with H, opens the
 * full key list with ?, and routes every single-key shortcut. The header
 * button is the pointer equivalent of the same actions.
 */
export function VoiceGuide() {
  const pathname = usePathname();
  const router = useRouter();

  const supported = useSyncExternalStore(
    subscribeNoop,
    speechSupportedSnapshot,
    () => false,
  );
  const muted = useSyncExternalStore(
    subscribeVoicePreferences,
    readVoiceMuted,
    () => false,
  );

  const [speaking, setSpeaking] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  // Set once speech has failed to produce sound more than once. The browser
  // exposes the API but cannot actually talk, so the prompt stops promising it.
  const [silentEngine, setSilentEngine] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const disposeRef = useRef<(() => void) | null>(null);
  const spokenPathRef = useRef<string | null>(null);
  const mutedRef = useRef(false);
  const startedRef = useRef(false);
  const watchdogRef = useRef<number | null>(null);
  const silentStrikesRef = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
    setSpeechMuted(muted);
  }, [muted]);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  // Speak a passage, replacing whatever is already talking.
  const speak = useCallback(
    (parts: string[], onDone?: () => void) => {
      if (typeof window === "undefined") return;
      if (mutedRef.current) return;
      if (!speechSupported()) return;

      disposeRef.current?.();
      clearWatchdog();
      setSpeaking(true);

      let didStart = false;

      // Browsers may accept an utterance and never speak it: autoplay may be
      // blocked before the first interaction, or the engine may expose no
      // voices at all. Either way, stop pretending we are talking and offer
      // the visible start control instead of leaving the listener in silence.
      const fail = () => {
        clearWatchdog();
        setSpeaking(false);
        setNeedsGesture(true);
      };

      watchdogRef.current = window.setTimeout(fail, 1600);

      disposeRef.current = speakSequence(parts, {
        rate: 0.97,
        onStart: () => {
          didStart = true;
          silentStrikesRef.current = 0;
          clearWatchdog();
          // Sound is happening, so any "press a key to start" prompt is stale.
          setNeedsGesture(false);
          setSilentEngine(false);
        },
        onEnd: () => {
          clearWatchdog();
          setSpeaking(false);
          if (didStart) {
            onDone?.();
            return;
          }
          // The engine reported a finished utterance without ever starting it.
          // After a second such attempt, treat the engine as mute for this
          // session so the prompt stops promising that pressing a key helps.
          silentStrikesRef.current += 1;
          setNeedsGesture(true);
          if (silentStrikesRef.current >= 2) setSilentEngine(true);
        },
        onCancel: () => {
          clearWatchdog();
          setSpeaking(false);
        },
        onError: fail,
      });
    },
    [clearWatchdog],
  );

  const stopVoice = useCallback(() => {
    disposeRef.current?.();
    disposeRef.current = null;
    clearWatchdog();
    cancelSpeech();
    setSpeaking(false);
  }, [clearWatchdog]);

  const replay = useCallback(() => {
    setNeedsGesture(false);
    speak(replaySpeech(pathname));
  }, [pathname, speak]);

  const toggleMute = useCallback(
    (next?: boolean) => {
      const value = next ?? !mutedRef.current;
      mutedRef.current = value;
      setSpeechMuted(value);
      writeVoiceMuted(value);
      if (value) {
        // Silence whatever is mid-sentence instead of letting one more line out.
        stopVoice();
        return;
      }
      setNeedsGesture(false);
      speak([
        "Voice guide on.",
        "Press H to hear how to use this page.",
        "Press question mark for every keyboard shortcut.",
      ]);
    },
    [speak, stopVoice],
  );

  const openShortcuts = useCallback(() => {
    setNeedsGesture(false);
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    setDialogOpen(true);
    if (!mutedRef.current) speak(fullGuideSpeech());
  }, [speak]);

  const closeShortcuts = useCallback(() => {
    dialogRef.current?.close();
    setDialogOpen(false);
  }, []);

  // Remember the voice that will actually speak, which can arrive after paint.
  useEffect(() => {
    if (!supported) return undefined;
    const pick = () => setVoiceName(englishVoice()?.name ?? null);
    const timer = window.setTimeout(pick, 0);
    window.speechSynthesis.addEventListener?.("voiceschanged", pick);
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.removeEventListener?.("voiceschanged", pick);
    };
  }, [supported]);

  // Arriving somewhere: name the page, then the one key that explains it.
  const announceArrival = useCallback(
    (path: string) =>
      speak([
        routeGuide(path).lines[0],
        "Press H to hear how to use this page.",
      ]),
    [speak],
  );

  // First visit: introduce the site and name the replay key. Deferred one tick
  // so speech never starts inside the effect body during hydration.
  useEffect(() => {
    if (!supported || startedRef.current) return undefined;
    startedRef.current = true;

    // Claim this path synchronously. The navigation effect below runs later in
    // the same commit; without this it would speak the page lines first and the
    // welcome would arrive second, repeating the arrival twice.
    spokenPathRef.current = pathname;
    const firstVisit = !introWasSeen();

    const timer = window.setTimeout(() => {
      if (mutedRef.current) {
        setNeedsGesture(true);
        return;
      }

      // Later visits in the same tab get the short version: where you are and
      // the key that replays the instructions.
      if (!firstVisit) {
        announceArrival(pathname);
        return;
      }

      markIntroSeen();
      speak(introSpeech(pathname));
    }, 120);

    return () => window.clearTimeout(timer);
  }, [announceArrival, pathname, speak, supported]);

  // On client-side navigation, say where the visitor arrived.
  useEffect(() => {
    if (!supported || mutedRef.current) return undefined;
    if (spokenPathRef.current === pathname) return undefined;
    spokenPathRef.current = pathname;
    const timer = window.setTimeout(() => announceArrival(pathname), 0);
    return () => window.clearTimeout(timer);
  }, [announceArrival, pathname, supported]);

  useEffect(() => {
    return () => {
      disposeRef.current?.();
      if (watchdogRef.current !== null) window.clearTimeout(watchdogRef.current);
      cancelSpeech();
    };
  }, []);

  // Global single-key shortcuts.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (dialogRef.current?.open) return; // the dialog owns its own keys

      const key = event.key;

      // Escape silences the voice from anywhere, including a select.
      if (key === "Escape") {
        if (speaking) {
          event.preventDefault();
          stopVoice();
        }
        return;
      }

      if (key === "?") {
        event.preventDefault();
        openShortcuts();
        return;
      }

      if (controlConsumesKey(event.target, key)) return;

      const route = ROUTE_SHORTCUTS.find((item) => item.key === key);
      if (route) {
        event.preventDefault();
        router.push(route.href);
        return;
      }

      switch (key.toLowerCase()) {
        case "h":
          event.preventDefault();
          replay();
          return;
        case "m":
          event.preventDefault();
          toggleMute();
          return;
        case "p":
        case "s":
        case "r": {
          event.preventDefault();
          if (!instrumentPresent()) {
            speak([
              "There is no instrument on this page.",
              "Press 1 for the ocean, 2 for the carbon cycle, or 3 for air quality.",
            ]);
            return;
          }
          window.dispatchEvent(
            new CustomEvent(INSTRUMENT_EVENT, {
              detail: { action: key === "p" ? "toggle" : key === "s" ? "stop" : "read" },
            }),
          );
          return;
        }
        case "j":
          event.preventDefault();
          if (!focusFirst("[data-ep-seek]")) speak(["This page has no sample slider."]);
          return;
        case "v":
          event.preventDefault();
          if (!focusFirst("[data-ep-volume]")) speak(["This page has no volume slider."]);
          return;
        case "l":
          event.preventDefault();
          if (!focusFirst("[data-ep-layers]")) speak(["This page has no sound-layer switches."]);
          return;
        case "c":
          event.preventDefault();
          if (!focusFirst("[data-ep-select]")) speak(["This page has no selector."]);
          return;
        default:
          return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openShortcuts, replay, router, speak, speaking, stopVoice, toggleMute]);

  return (
    <>
      <button
        aria-keyshortcuts="?"
        className="header-guide"
        onClick={openShortcuts}
        type="button"
      >
        <Keyboard aria-hidden="true" size={13} strokeWidth={1.6} />
        <span className="header-guide-label">Voice guide</span>
        <kbd aria-hidden="true">?</kbd>
      </button>

      {needsGesture && !dialogOpen ? (
        <div aria-labelledby="voice-prompt-title" className="voice-prompt" role="region">
          <p className="voice-prompt-copy" id="voice-prompt-title">
            {silentEngine ? (
              <>
                <strong>The voice is not starting here.</strong> This browser
                reports a speech engine but produced no sound. Every instruction
                is in the shortcut list: press <kbd>?</kbd> to open it, or read
                the same guide at <kbd>6</kbd>.
              </>
            ) : (
              <>
                <strong>Voice guide ready.</strong> The introduction needs one key
                press to start. Press <kbd>H</kbd> at any time to hear this page
                again.
              </>
            )}
          </p>
          <div className="voice-prompt-actions">
            {silentEngine ? (
              <button
                className="voice-prompt-start"
                onClick={() => {
                  setNeedsGesture(false);
                  openShortcuts();
                }}
                type="button"
              >
                <Keyboard aria-hidden="true" size={13} strokeWidth={1.7} />
                Open the shortcut list
              </button>
            ) : (
              <button
                className="voice-prompt-start"
                onClick={() => {
                  setNeedsGesture(false);
                  if (mutedRef.current) toggleMute(false);
                  else speak(introSpeech(pathname));
                }}
                type="button"
              >
                <Volume2 aria-hidden="true" size={13} strokeWidth={1.7} />
                Start the guide
              </button>
            )}
            <button
              className="voice-prompt-mute"
              onClick={() => {
                toggleMute(true);
                setNeedsGesture(false);
              }}
              type="button"
            >
              <VolumeX aria-hidden="true" size={13} strokeWidth={1.7} />
              Keep it silent
            </button>
          </div>
        </div>
      ) : null}

      <dialog
        aria-labelledby="voice-dialog-title"
        className="voice-dialog"
        onCancel={(event) => {
          event.preventDefault();
          stopVoice();
          closeShortcuts();
        }}
        onClose={() => setDialogOpen(false)}
        ref={dialogRef}
      >
        <div className="voice-dialog-inner">
          <div className="voice-dialog-head">
            <div>
              <p className="voice-dialog-kicker">
                <CircleHelp aria-hidden="true" size={12} strokeWidth={1.7} />
                Earth&apos;s Pulse
              </p>
              <h2 className="voice-dialog-title" id="voice-dialog-title">
                Voice guide and keyboard shortcuts
              </h2>
            </div>
            <button
              aria-label="Close the keyboard shortcut list"
              className="voice-dialog-close"
              onClick={() => {
                stopVoice();
                closeShortcuts();
              }}
              type="button"
            >
              <X aria-hidden="true" size={15} strokeWidth={1.8} />
            </button>
          </div>

          <p className="voice-dialog-copy">
            This site is built to be used without a mouse and without a screen.
            Everything below works from the keyboard, and the voice guide reads
            the same instructions aloud.
          </p>

          <div className="voice-dialog-actions">
            <button className="button-primary" onClick={replay} type="button">
              <Volume2 aria-hidden="true" size={13} strokeWidth={1.7} />
              Hear this page again <kbd>H</kbd>
            </button>
            <button
              aria-pressed={muted}
              className="button-secondary"
              onClick={() => toggleMute()}
              type="button"
            >
              {muted ? (
                <Volume2 aria-hidden="true" size={13} strokeWidth={1.7} />
              ) : (
                <VolumeX aria-hidden="true" size={13} strokeWidth={1.7} />
              )}
              {muted ? "Turn the voice on" : "Silence the voice"} <kbd>M</kbd>
            </button>
          </div>

          <p className="voice-dialog-status">
            <span
              aria-hidden="true"
              className={`status-dot status-dot--${muted ? "neutral" : speaking ? "available" : "pending"}`}
            />
            {!supported
              ? "This browser does not offer a speech engine. Every instruction below stays on screen."
              : muted
                ? "Voice off. The guide stays silent until you turn it back on."
                : speaking
                  ? "Speaking now."
                  : silentEngine
                    ? "No sound is coming out. Every instruction below is on screen."
                    : voiceName
                      ? `Ready · ${voiceName}`
                      : "Ready."}
          </p>
          <p aria-live="polite" className="sr-only">
            {muted
              ? "Voice guide off."
              : speaking
                ? "Voice guide speaking."
                : silentEngine
                  ? "Voice guide unavailable. The instructions are on screen."
                  : "Voice guide ready."}
          </p>

          <div className="voice-dialog-groups">
            {KEY_GROUPS.map((group) => (
              <section className="voice-keys" key={group.id}>
                <h3 className="voice-keys-title">{group.title}</h3>
                <dl className="voice-keys-list">
                  {group.rows.map((row) => (
                    <div key={`${group.id}-${row.keys}`}>
                      <dt>
                        <kbd>{row.keys}</kbd>
                      </dt>
                      <dd>{row.label}</dd>
                    </div>
                  ))}
                </dl>
                {group.note ? <p className="voice-keys-note">{group.note}</p> : null}
              </section>
            ))}
          </div>

          <p className="voice-dialog-note">
            Text fields keep every key you type. Inside a selector, a letter is
            only used as a shortcut when no option starts with that letter, so
            typing still jumps the way the browser normally does.
          </p>
        </div>
      </dialog>
    </>
  );
}
