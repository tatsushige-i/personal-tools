export type LengthStatus = "ok" | "short" | "long" | "missing";

export type LengthRange = {
  min: number;
  max: number;
};

export type LengthCheck = {
  status: LengthStatus;
  actual: number;
  recommended: LengthRange;
};

export const TITLE_RANGE: LengthRange = { min: 30, max: 60 };
export const DESCRIPTION_RANGE: LengthRange = { min: 120, max: 160 };

export function checkLength(
  text: string | null | undefined,
  range: LengthRange,
): LengthCheck {
  if (text === null || text === undefined || text === "") {
    return { status: "missing", actual: 0, recommended: range };
  }

  const actual = [...text].length;
  let status: LengthStatus;
  if (actual < range.min) {
    status = "short";
  } else if (actual > range.max) {
    status = "long";
  } else {
    status = "ok";
  }

  return { status, actual, recommended: range };
}

export function checkTitle(text: string | null | undefined): LengthCheck {
  return checkLength(text, TITLE_RANGE);
}

export function checkDescription(text: string | null | undefined): LengthCheck {
  return checkLength(text, DESCRIPTION_RANGE);
}
