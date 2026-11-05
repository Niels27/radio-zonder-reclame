// Pre-roll skipping for commercial stations.
//
// StreamTheWorld/DPG streams start every new connection with ~15-20 s of
// advertising. Seeking a live <audio> element forward makes the browser wait
// until the live data catches up with the new position, so that part of the
// stream is never played: the listener gets a short silence instead of ads.

const STORAGE_KEY = 'auto_skip_preroll';
const PREROLL_SECONDS = 17;

export function isPrerollSkipEnabled() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) === true;
  } catch {
    return false;
  }
}

export function setPrerollSkipEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Boolean(enabled)));
  } catch {
    // Storage unavailable (private mode): the setting just won't persist.
  }
}

export const hasPreroll = (station) => station?.category === 'commercial' || station?.category === 'themes';

/** Jump past the pre-roll, then fade the volume back in. */
export async function skipPreroll(audio, targetVolume) {
  audio.volume = 0;
  audio.currentTime += PREROLL_SECONDS;
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 40));
    audio.volume = targetVolume * (i / steps);
  }
}
