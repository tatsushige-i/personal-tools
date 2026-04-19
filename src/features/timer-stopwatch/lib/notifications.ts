type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch {
      return "denied";
    }
  }
  return Notification.permission;
}

export function playBeep(): void {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
    oscillator.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Audio context issues should not break the app.
  }
}

export function notifyTimerDone(title: string): void {
  playBeep();
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification("タイマー終了", {
      body: title || "タイマーが終了しました",
      silent: false,
    });
  } catch {
    // Ignore notification failures.
  }
}
