export interface Validator<P> {
  (data: P): { message?: string; dataPath?: string }[] | null | undefined;
}
