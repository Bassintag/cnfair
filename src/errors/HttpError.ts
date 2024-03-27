export class HttpError<T> extends Error {
  constructor(
    readonly code: number,
    readonly payload: T,
    message?: string,
  ) {
    super(message);
  }
}
