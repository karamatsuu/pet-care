const dotenv = require('dotenv');

dotenv.config();

const requiredVariables = ['DATABASE_URL', 'JWT_SECRET'];
const missingVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVariables.join(', ')}`
  );
}

const env = {
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
};

module.exports = env;
