/** Error classes for biztime. */

/** APIError extends the normal JS error so we can easily
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    console.error(this.stack);
  }
}
// end

module.exports = APIError;
