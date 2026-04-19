import {
  createTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  tickTimer,
  getDisplayRemaining,
} from "../timer-engine";

describe("createTimer", () => {
  it("idle 状態で初期化される", () => {
    const timer = createTimer("t1", "Laundry", 60_000);
    expect(timer).toMatchObject({
      id: "t1",
      title: "Laundry",
      durationMs: 60_000,
      remainingMs: 60_000,
      endsAt: null,
      status: "idle",
    });
  });
});

describe("startTimer", () => {
  it("idle から running に遷移し endsAt が設定される", () => {
    const timer = createTimer("t1", "Laundry", 60_000);
    const started = startTimer(timer, 1_000);
    expect(started.status).toBe("running");
    expect(started.endsAt).toBe(61_000);
  });

  it("running 中は変更されない", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const again = startTimer(running, 2_000);
    expect(again).toBe(running);
  });

  it("残り 0 の completed タイマーはスタートしない", () => {
    const completed = { ...createTimer("t1", "x", 60_000), remainingMs: 0 };
    expect(startTimer(completed, 1_000)).toBe(completed);
  });
});

describe("pauseTimer", () => {
  it("running から paused に遷移し remainingMs を計算", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const paused = pauseTimer(running, 21_000);
    expect(paused.status).toBe("paused");
    expect(paused.remainingMs).toBe(40_000);
    expect(paused.endsAt).toBeNull();
  });

  it("running 以外のタイマーは変更されない", () => {
    const timer = createTimer("t1", "x", 60_000);
    expect(pauseTimer(timer, 1_000)).toBe(timer);
  });

  it("終了時刻を過ぎていたら remainingMs は 0", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const paused = pauseTimer(running, 999_999);
    expect(paused.remainingMs).toBe(0);
  });
});

describe("resetTimer", () => {
  it("duration に戻し idle にする", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const reset = resetTimer(running);
    expect(reset.status).toBe("idle");
    expect(reset.remainingMs).toBe(60_000);
    expect(reset.endsAt).toBeNull();
  });
});

describe("tickTimer", () => {
  it("running 中で endsAt 未到達なら状態変化なし", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const result = tickTimer(running, 30_000);
    expect(result.justCompleted).toBe(false);
    expect(result.timer).toBe(running);
  });

  it("running 中で endsAt 到達時に completed へ遷移し justCompleted が true", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const result = tickTimer(running, 61_000);
    expect(result.justCompleted).toBe(true);
    expect(result.timer.status).toBe("completed");
    expect(result.timer.remainingMs).toBe(0);
    expect(result.timer.endsAt).toBeNull();
  });

  it("running 以外は変化しない", () => {
    const timer = createTimer("t1", "x", 60_000);
    const result = tickTimer(timer, 999_999);
    expect(result.justCompleted).toBe(false);
    expect(result.timer).toBe(timer);
  });
});

describe("getDisplayRemaining", () => {
  it("running 中は endsAt - now を返す", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    expect(getDisplayRemaining(running, 21_000)).toBe(40_000);
  });

  it("paused は remainingMs を返す", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    const paused = pauseTimer(running, 21_000);
    expect(getDisplayRemaining(paused, 999_999)).toBe(40_000);
  });

  it("running で endsAt 超過時は 0 を返す", () => {
    const timer = createTimer("t1", "x", 60_000);
    const running = startTimer(timer, 1_000);
    expect(getDisplayRemaining(running, 999_999)).toBe(0);
  });
});
