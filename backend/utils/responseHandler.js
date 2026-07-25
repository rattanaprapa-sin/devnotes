/**
 * Standard API response handler
 * @param {boolean} success - Indicates if the operation was successful
 * @param {string} message - Response message
 * @param {*} data - Response data (can be any type)
 * @returns {Object} Standardized response object
 */
const createResponse = (success = true, message = '', data = null) => {
  return {
    success,
    message,
    data
  };
};

module.exports = {
  createResponse
};
