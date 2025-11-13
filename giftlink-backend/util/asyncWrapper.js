// utils/asyncWrapper.js

/**
 * Wraps an async route handler so errors are automatically
 * forwarded to Express's error handling middleware.
 *
 * Usage:
 *   router.get("/", asyncWrapper(async (req, res) => {
 *     const data = await someAsyncCall();
 *     res.json(data);
 *   }));
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
