export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak a reading with the browser voice. This is an optional access path,
 * never the only way to receive the information.
 */
export function speakText(text: string): boolean {
  if (!speechSupported()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  synth.speak(utterance);
  return true;
}

export function cancelSpeech() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
