const cors = require('cors');
const helmet = require('helmet');

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

const securityMiddleware = [
  helmet(),
  cors({
    origin: allowedOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
];

module.exports = {
  allowedOrigin,
  securityMiddleware,
};
