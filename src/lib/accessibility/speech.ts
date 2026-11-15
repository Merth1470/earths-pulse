/**
 * One speech queue for the whole site.
 *
 * Both the per-instrument "read this aloud" buttons and the global voice guide
 * go through this module so two voices never talk at once. Nothing here is a
 * recorded file: the browser voice is the source of truth, which is why voice
 * availability is checked rather than assumed.
 */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string | null;
  onStart?: () => void;
  onEnd?: () => void;
  /** Called when another speaker took over instead of this one finishing. */
  onCancel?: () => void;
  onError?: (message: string) => void;
}

/**
 * A single site-wide mute switch. The voice guide owns it, so silencing the
 * guide also silences every "read this aloud" path instead of leaving one
 * voice running behind another.
 */
let speechMuted = false;

export function setSpeechMuted(value: boolean) {
  speechMuted = value;
  if (value) cancelSpeech();
}

export function isSpeechMuted(): boolean {
  return speechMuted;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function cancelSpeech() {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
}

export function listSpeechVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return [];
  const english = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  const rest = voices.filter((voice) => !voice.lang?.toLowerCase().startsWith("en"));
  return [...english, ...rest];
}

/** The voice that will actually read English text, or null for the default. */
export function englishVoice(): SpeechSynthesisVoice | null {
  return resolveVoice(null);
}

function resolveVoice(voiceURI: string | null | undefined): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (voiceURI) {
    const match = voices.find((voice) => voice.voiceURI === voiceURI);
    if (match) return match;
  }
  // Never hand English text to a non-English voice: a mismatched voice is worse
  // than the browser default, which still follows the utterance language.
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ?? null;
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function clearFlush() {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

/**
 * Speak a sequence of sentences as one passage and return a disposer.
 *
 * `cancel()` followed by `speak()` in the same tick is dropped by some Chromium
 * builds, so the first utterance is queued on the next frame.
 */
export function speakSequence(
  parts: string[],
  options: SpeakOptions = {},
): () => void {
  if (!speechSupported()) return () => {};
  if (speechMuted) return () => {};
  const sentences = parts.map((part) => part?.trim()).filter(Boolean);
  if (!sentences.length) return () => {};

  const synth = window.speechSynthesis;
  clearFlush();
  synth.cancel();

  let cancelled = false;
  const voice = resolveVoice(options.voiceURI);

  const start = () => {
    flushTimer = null;
    if (cancelled) return;
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = voice?.lang ?? "en-US";
      if (voice) utterance.voice = voice;
      utterance.rate = Math.min(2, Math.max(0.5, options.rate ?? 1));
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      if (index === 0) {
        utterance.onstart = () => {
          if (!cancelled) options.onStart?.();
        };
      }
      if (index === sentences.length - 1) {
        utterance.onend = () => {
          if (!cancelled) options.onEnd?.();
        };
      }
      utterance.onerror = (event) => {
        // Cancelling on purpose is not an error worth reporting.
        if (cancelled) return;
        if (event.error === "interrupted" || event.error === "canceled") {
          // Another speaker took over. This is not a finished passage, so the
          // caller must not treat it as one.
          options.onCancel?.();
          return;
        }
        options.onError?.(event.error);
      };

      synth.speak(utterance);
    });
  };

  flushTimer = setTimeout(start, 60);

  return () => {
    cancelled = true;
    clearFlush();
    if (speechSupported()) synth.cancel();
  };
}

/**
 * Speak a reading with the browser voice. This is an optional access path,
 * never the only way to receive the information.
 */
export function speakText(text: string): boolean {
  if (!speechSupported()) return false;
  speakSequence([text], { rate: 0.95 });
  return true;
}
