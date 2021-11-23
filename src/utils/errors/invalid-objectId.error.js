class InvalidObjectIdError extends Error {
    constructor (message) {
      message = message || 'Invalid ObjectId!';
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = 'InvalidObjectIdError';
      this.message = message;
    }
}

module.exports = InvalidObjectIdError;