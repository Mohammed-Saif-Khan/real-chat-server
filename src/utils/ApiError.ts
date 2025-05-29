interface ErrorDetail {
  field?: string;
  message: string;
}

class ApiError extends Error {
  statusCode: number;
  data: null;
  success: false;
  errors: ErrorDetail[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: ErrorDetail[] = [],
    stack: string = ""
  ) {
    super(message);

    this.statusCode = statusCode;
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
