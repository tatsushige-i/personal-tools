export type Mode = "encode" | "decode";

export type Base64Result =
  | { success: true; data: string }
  | { success: false; error: string };
