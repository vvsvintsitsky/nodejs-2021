export type Value = Record<string, unknown>;

export interface DataMapper {
  toPersistence(value: Value): Value;

  fromPersistence(value: Value): Value;
}
