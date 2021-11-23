class InvalidPaginationParameterError extends Error {
    constructor (message) {
      message = message || 'Invalid pagination parameters';
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = 'InvalidPaginationParameterError';
      this.message = message;
    }
}

module.exports = InvalidPaginationParameterError;