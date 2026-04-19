import {
  createStopwatch,
  startStopwatch,
  pauseStopwatch,
  resetStopwatch,
  getElapsed,
  recordLap,
} from "../stopwatch-engine";

describe("createStopwatch", () => {
  it("idle 状態で初期化される", () => {
    const sw = createStopwatch();
    expect(sw).toEqual({
      status: "idle",
      accumulatedMs: 0,
      startedAt: null,
      laps: [],
    });
  });
});

describe("startStopwatch", () => {
  it("idle から running に遷移し startedAt が設定される", () => {
    const started = startStopwatch(createStopwatch(), 1_000);
    expect(started.status).toBe("running");
    expect(started.startedAt).toBe(1_000);
  });

  it("running 中は変更されない", () => {
    const running = startStopwatch(createStopwatch(), 1_000);
    expect(startStopwatch(running, 2_000)).toBe(running);
  });
});

describe("pauseStopwatch", () => {
  it("running から paused に遷移し accumulatedMs を加算", () => {
    const running = startStopwatch(createStopwatch(), 1_000);
    const paused = pauseStopwatch(running, 6_000);
    expect(paused.status).toBe("paused");
    expect(paused.accumulatedMs).toBe(5_000);
    expect(paused.startedAt).toBeNull();
  });

  it("paused から再度 start / pause すると累積経過が維持される", () => {
    const sw = startStopwatch(createStopwatch(), 1_000);
    const paused = pauseStopwatch(sw, 6_000);
    const restarted = startStopwatch(paused, 10_000);
    const pausedAgain = pauseStopwatch(restarted, 13_000);
    expect(pausedAgain.accumulatedMs).toBe(8_000);
  });

  it("running 以外は変更されない", () => {
    const sw = createStopwatch();
    expect(pauseStopwatch(sw, 1_000)).toBe(sw);
  });
});

describe("resetStopwatch", () => {
  it("初期状態に戻る", () => {
    expect(resetStopwatch()).toEqual(createStopwatch());
  });
});

describe("getElapsed", () => {
  it("running 中は accumulated + (now - startedAt)", () => {
    const running = startStopwatch(createStopwatch(), 1_000);
    expect(getElapsed(running, 6_000)).toBe(5_000);
  });

  it("paused は accumulatedMs を返す", () => {
    const running = startStopwatch(createStopwatch(), 1_000);
    const paused = pauseStopwatch(running, 6_000);
    expect(getElapsed(paused, 999_999)).toBe(5_000);
  });
});

describe("recordLap", () => {
  it("ラップ毎に total と split を記録", () => {
    const sw = startStopwatch(createStopwatch(), 0);
    const lap1 = recordLap(sw, 3_000, "l1");
    expect(lap1.laps).toEqual([{ id: "l1", totalMs: 3_000, splitMs: 3_000 }]);

    const lap2 = recordLap(lap1, 8_000, "l2");
    expect(lap2.laps).toEqual([
      { id: "l1", totalMs: 3_000, splitMs: 3_000 },
      { id: "l2", totalMs: 8_000, splitMs: 5_000 },
    ]);
  });

  it("running でないときはラップを追加しない", () => {
    const sw = createStopwatch();
    expect(recordLap(sw, 1_000, "l1")).toBe(sw);
  });
});
