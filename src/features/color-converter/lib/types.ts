export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export type ColorValue = {
  hex: string; // "#rrggbb" lowercase
  rgb: RGB;
  hsl: HSL;
  tailwind: string | null; // "red-500" or null
};

export type PaletteEntry = {
  id: string;
  color: ColorValue;
};

export type ContrastResult = {
  ratio: number;
  ratioText: string; // "4.53:1"
  aa: boolean; // normal text >= 4.5
  aaLarge: boolean; // large text >= 3
  aaa: boolean; // normal text >= 7
  aaaLarge: boolean; // large text >= 4.5
};
