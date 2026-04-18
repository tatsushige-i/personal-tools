import { roundAmount, formatCurrency, calculateSplit } from "../calculator";
import type { BillItem, BillOptions, Participant } from "../types";

describe("roundAmount", () => {
  it("1円単位で四捨五入", () => {
    expect(roundAmount(1234.5, "round", 1)).toBe(1235);
    expect(roundAmount(1234.4, "round", 1)).toBe(1234);
  });

  it("10円単位で切り上げ", () => {
    expect(roundAmount(1234, "ceil", 10)).toBe(1240);
    expect(roundAmount(1230, "ceil", 10)).toBe(1230);
  });

  it("100円単位で切り捨て", () => {
    expect(roundAmount(1299, "floor", 100)).toBe(1200);
    expect(roundAmount(1300, "floor", 100)).toBe(1300);
  });

  it("10円単位で四捨五入", () => {
    expect(roundAmount(1235, "round", 10)).toBe(1240);
    expect(roundAmount(1234, "round", 10)).toBe(1230);
  });

  it("100円単位で切り上げ", () => {
    expect(roundAmount(1201, "ceil", 100)).toBe(1300);
    expect(roundAmount(1200, "ceil", 100)).toBe(1200);
  });

  it("1円単位で切り捨て", () => {
    expect(roundAmount(1234.9, "floor", 1)).toBe(1234);
  });

  it("500円単位で切り上げ", () => {
    expect(roundAmount(1234, "ceil", 500)).toBe(1500);
    expect(roundAmount(1500, "ceil", 500)).toBe(1500);
    expect(roundAmount(1501, "ceil", 500)).toBe(2000);
  });

  it("1000円単位で四捨五入", () => {
    expect(roundAmount(1499, "round", 1000)).toBe(1000);
    expect(roundAmount(1500, "round", 1000)).toBe(2000);
    expect(roundAmount(2800, "round", 1000)).toBe(3000);
  });

  it("1000円単位で切り捨て", () => {
    expect(roundAmount(1999, "floor", 1000)).toBe(1000);
    expect(roundAmount(2000, "floor", 1000)).toBe(2000);
  });
});

describe("formatCurrency", () => {
  it("カンマ区切りでフォーマット", () => {
    expect(formatCurrency(1000)).toBe("1,000");
    expect(formatCurrency(12345678)).toBe("12,345,678");
    expect(formatCurrency(0)).toBe("0");
  });
});

describe("calculateSplit", () => {
  const defaultOptions: BillOptions = {
    taxRate: "0",
    serviceChargeRate: "0",
    roundingMethod: "round",
    roundingUnit: 1,
  };

  function makeItems(...amounts: number[]): BillItem[] {
    return amounts.map((a, i) => ({
      id: `item-${i}`,
      name: `Item ${i + 1}`,
      amount: String(a),
    }));
  }

  function makeParticipants(
    ...configs: { name: string; ratio?: string }[]
  ): Participant[] {
    return configs.map((c, i) => ({
      id: `p-${i}`,
      name: c.name,
      ratio: c.ratio ?? "1",
    }));
  }

  it("均等割り（2人）", () => {
    const result = calculateSplit(
      makeItems(10000),
      makeParticipants({ name: "A" }, { name: "B" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.subtotal).toBe(10000);
    expect(result!.totalAmount).toBe(10000);
    expect(result!.perPersonResults).toHaveLength(2);
    expect(result!.perPersonResults[0].amount).toBe(5000);
    expect(result!.perPersonResults[1].amount).toBe(5000);
    expect(result!.difference).toBe(0);
  });

  it("均等割り（3人、端数あり・100円切り上げ）", () => {
    const result = calculateSplit(
      makeItems(10000),
      makeParticipants({ name: "A" }, { name: "B" }, { name: "C" }),
      { ...defaultOptions, roundingMethod: "ceil", roundingUnit: 100 },
    );
    expect(result).not.toBeNull();
    // 10000 / 3 = 3333.33... → 切り上げ100円 = 3400
    expect(result!.perPersonResults[0].amount).toBe(3400);
    expect(result!.perPersonResults[1].amount).toBe(3400);
    expect(result!.perPersonResults[2].amount).toBe(3400);
    expect(result!.adjustedTotal).toBe(10200);
    expect(result!.difference).toBe(200);
  });

  it("均等割り（3人、端数あり・100円切り捨て）", () => {
    const result = calculateSplit(
      makeItems(10000),
      makeParticipants({ name: "A" }, { name: "B" }, { name: "C" }),
      { ...defaultOptions, roundingMethod: "floor", roundingUnit: 100 },
    );
    expect(result).not.toBeNull();
    // 10000 / 3 = 3333.33... → 切り捨て100円 = 3300
    expect(result!.perPersonResults[0].amount).toBe(3300);
    expect(result!.adjustedTotal).toBe(9900);
    expect(result!.difference).toBe(-100);
  });

  it("傾斜配分（比率 2:1）", () => {
    const result = calculateSplit(
      makeItems(9000),
      makeParticipants({ name: "幹事", ratio: "2" }, { name: "一般", ratio: "1" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    // 9000 の 2:1 → 6000, 3000
    expect(result!.perPersonResults[0].amount).toBe(6000);
    expect(result!.perPersonResults[1].amount).toBe(3000);
  });

  it("傾斜配分（比率 1.5:1:0.7）", () => {
    const result = calculateSplit(
      makeItems(32000),
      makeParticipants(
        { name: "幹事", ratio: "1.5" },
        { name: "一般", ratio: "1" },
        { name: "学生", ratio: "0.7" },
      ),
      { ...defaultOptions, roundingUnit: 100, roundingMethod: "round" },
    );
    expect(result).not.toBeNull();
    // totalRatio = 3.2, shares: 15000, 10000, 7000
    expect(result!.perPersonResults[0].amount).toBe(15000);
    expect(result!.perPersonResults[1].amount).toBe(10000);
    expect(result!.perPersonResults[2].amount).toBe(7000);
  });

  it("税・サービス料の計算", () => {
    const result = calculateSplit(
      makeItems(10000),
      makeParticipants({ name: "A" }, { name: "B" }),
      { ...defaultOptions, taxRate: "10", serviceChargeRate: "10" },
    );
    expect(result).not.toBeNull();
    expect(result!.subtotal).toBe(10000);
    expect(result!.taxAmount).toBe(1000);
    expect(result!.serviceChargeAmount).toBe(1000);
    expect(result!.totalAmount).toBe(12000);
    expect(result!.perPersonResults[0].amount).toBe(6000);
    expect(result!.perPersonResults[1].amount).toBe(6000);
  });

  it("複数項目の合算", () => {
    const result = calculateSplit(
      makeItems(5000, 3000, 2000),
      makeParticipants({ name: "A" }, { name: "B" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.subtotal).toBe(10000);
    expect(result!.perPersonResults[0].amount).toBe(5000);
  });

  it("参加者0人はnullを返す", () => {
    const result = calculateSplit(makeItems(10000), [], defaultOptions);
    expect(result).toBeNull();
  });

  it("金額0以下はnullを返す", () => {
    const result = calculateSplit(
      makeItems(0),
      makeParticipants({ name: "A" }),
      defaultOptions,
    );
    expect(result).toBeNull();
  });

  it("1人の場合は全額", () => {
    const result = calculateSplit(
      makeItems(8500),
      makeParticipants({ name: "A" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.perPersonResults[0].amount).toBe(8500);
  });

  it("不正な金額文字列は0として扱う", () => {
    const items: BillItem[] = [
      { id: "1", name: "有効", amount: "5000" },
      { id: "2", name: "不正", amount: "abc" },
    ];
    const result = calculateSplit(
      items,
      makeParticipants({ name: "A" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.subtotal).toBe(5000);
  });

  it("不正な比率は1として扱う", () => {
    const result = calculateSplit(
      makeItems(10000),
      makeParticipants({ name: "A", ratio: "abc" }, { name: "B", ratio: "1" }),
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.perPersonResults[0].amount).toBe(5000);
    expect(result!.perPersonResults[1].amount).toBe(5000);
  });

  it("名前が空の場合はデフォルト名を使用", () => {
    const result = calculateSplit(
      makeItems(10000),
      [{ id: "p-0", name: "", ratio: "1" }],
      defaultOptions,
    );
    expect(result).not.toBeNull();
    expect(result!.perPersonResults[0].name).toBe("参加者1");
  });
});
