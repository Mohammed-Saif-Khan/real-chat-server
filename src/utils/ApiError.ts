interface ErrorDetail {
  field?: string;
  message: string;
}

class ApiError extends Error {
  status: number;
  data: null;
  success: false;
  errors: ErrorDetail[];

  constructor(
    status: number,
    message: string = "Something went wrong",
    errors: ErrorDetail[] = [],
    stack: string = ""
  ) {
    super(message);

    this.status = status;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.message = message;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError, ErrorDetail };
