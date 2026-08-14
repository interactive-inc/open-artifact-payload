export type ContactSubmitResult =
  | { status: "ok" }
  | { status: "validationFailed"; errors: string[] }
  | { status: "turnstileFailed" }
  | { status: "rateLimited" }
  | { status: "serverError" }
