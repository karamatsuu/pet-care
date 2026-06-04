const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const errorStatus = err.statusCode || err.status;
  const statusCode = Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus < 600
    ? errorStatus
    : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  console.error(err);

  const response = {
    error: message,
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
