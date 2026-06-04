const path = require('path');
const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const details = stack || message;
    return `${timestamp} ${level}: ${details}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
    }),
  ],
});

if (!isProduction) {
  logger.add(new winston.transports.Console({
    level: 'info',
    format: consoleFormat,
  }));
}

module.exports = logger;
