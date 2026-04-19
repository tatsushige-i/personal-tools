import { formatTimer, formatStopwatch } from "../format-time";

describe("formatTimer", () => {
  it("残り時間を MM:SS 形式で表示", () => {
    expect(formatTimer(0)).toBe("00:00");
    expect(formatTimer(1_000)).toBe("00:01");
    expect(formatTimer(61_000)).toBe("01:01");
    expect(formatTimer(599_000)).toBe("09:59");
  });

  it("1時間以上は HH:MM:SS 形式で表示", () => {
    expect(formatTimer(3_600_000)).toBe("01:00:00");
    expect(formatTimer(3_661_000)).toBe("01:01:01");
  });

  it("負の値は 00:00 で表示", () => {
    expect(formatTimer(-500)).toBe("00:00");
  });

  it("端数ミリ秒は切り上げ（残り時間の直感に合わせる）", () => {
    expect(formatTimer(500)).toBe("00:01");
    expect(formatTimer(1)).toBe("00:01");
  });
});

describe("formatStopwatch", () => {
  it("MM:SS.mm 形式で表示", () => {
    expect(formatStopwatch(0)).toBe("00:00.00");
    expect(formatStopwatch(1_234)).toBe("00:01.23");
    expect(formatStopwatch(60_999)).toBe("01:00.99");
  });

  it("1時間以上は HH:MM:SS.mm 形式で表示", () => {
    expect(formatStopwatch(3_600_000)).toBe("01:00:00.00");
    expect(formatStopwatch(3_661_120)).toBe("01:01:01.12");
  });

  it("負の値は 00:00.00 で表示", () => {
    expect(formatStopwatch(-1)).toBe("00:00.00");
  });
});
