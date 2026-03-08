export type IdType = "uuidv4" | "uuidv7" | "ulid";

export type GenerationRecord = {
  id: string;
  type: IdType;
  values: string[];
  count: number;
  timestamp: Date;
};
