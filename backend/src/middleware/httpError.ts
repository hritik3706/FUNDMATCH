export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    public details?: Record<string, string>,
    public publicMessage?: string,
  ) {
    super(publicMessage ?? error);
  }
}
