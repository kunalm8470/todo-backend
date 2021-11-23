class PathNotFoundError extends Error {
    constructor (message) {
      message = message || 'Requested path not found!';
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = 'PathNotFoundError';
      this.message = message;
    }
}

module.exports = PathNotFoundError;