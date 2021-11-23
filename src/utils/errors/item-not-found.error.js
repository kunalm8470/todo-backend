class ItemNotFoundError extends Error {
  constructor (message) {
    message = message || 'Item not found!';
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ItemNotFoundError';
    this.message = message;
  }
}

module.exports = ItemNotFoundError;
