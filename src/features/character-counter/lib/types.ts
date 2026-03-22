export type CountStats = {
  total: number;
  totalExcludingSpaces: number;
  lines: number;
  bytes: number;
  fullWidth: number;
  halfWidth: number;
};

export type Platform = {
  name: string;
  limit: number;
};
