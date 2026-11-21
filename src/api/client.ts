import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

/** One field that failed validation, as Karatly reports it in a problem detail's "errors" list. */
export interface FieldViolation {
  field: string;
  message: string;
}

/**
 * Every failed API call becomes an ApiError. Karatly answers errors with an RFC 7807 problem
 * detail: a machine-readable code (e.g. METAL_NOT_FOUND), a sentence for people, and for
 * validation failures one entry per invalid field. When the server cannot be reached at all,
 * the code is NETWORK_ERROR.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldViolation[];

  constructor(status: number, code: string, message: string, fieldErrors: FieldViolation[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** The message for one form field, if the server rejected it. */
  messageFor(field: string): string | undefined {
    return this.fieldErrors.find((violation) => violation.field === field)?.message;
  }
}

export const NOT_REACHABLE = 'The Karatly API is not reachable. Is it running?';

interface ProblemDetail {
  title?: string;
  detail?: string;
  code?: string;
  errors?: FieldViolation[];
}

/** Turns an error response into an ApiError, whether or not the body is a problem detail. */
export async function toApiError(response: Response): Promise<ApiError> {
  let problem: ProblemDetail = {};
  try {
    problem = (await response.clone().json()) as ProblemDetail;
  } catch {
    // Not JSON: e.g. a proxy's HTML error page when the API is down.
  }
  const message =
    problem.detail ??
    problem.title ??
    ([502, 503, 504].includes(response.status) ? NOT_REACHABLE : `Request failed (HTTP ${response.status}).`);
  return new ApiError(response.status, problem.code ?? `HTTP_${response.status}`, message, problem.errors ?? []);
}

const throwOnError: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      throw await toApiError(response);
    }
    return undefined;
  },
  onError({ error }) {
    return error instanceof ApiError ? error : new ApiError(0, 'NETWORK_ERROR', NOT_REACHABLE);
  },
};

/**
 * The typed client for the Karatly API. Paths, parameters and bodies are checked against
 * schema.d.ts, which is generated from the API's OpenAPI document (npm run generate:api).
 *
 * Requests go to the same origin as the page ("/api/..."): in development Vite forwards them
 * to the API, in Docker nginx does, so the browser never needs CORS.
 */
export const api = createClient<paths>({
  baseUrl: globalThis.location?.origin ?? '',
  // Look fetch up on every call, so anything that wraps it later (the mock API in tests) sees every request.
  fetch: (request) => globalThis.fetch(request),
});
api.use(throwOnError);
