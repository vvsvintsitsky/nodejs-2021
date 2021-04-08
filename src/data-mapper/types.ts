export interface DataMapper<T, P> {
  toPersistence(value: T): P;

  fromPersistence(value: P): T;
}
