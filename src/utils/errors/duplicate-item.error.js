class DuplicateItemError extends Error {
    constructor (message) {
      message = message || 'Duplicate item error, unique index check failed';
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = 'DuplicateItemError';
      this.message = message;
    }
}

module.exports = DuplicateItemError;
