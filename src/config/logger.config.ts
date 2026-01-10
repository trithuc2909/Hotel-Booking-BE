import winston from 'winston';
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from 'winston/lib/winston/transports';
import config from './index';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const level = () => (config.env === 'development' ? 'debug' : 'warn');
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

const transports: Array<ConsoleTransportInstance | FileTransportInstance> = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        info => `[${info.timestamp}] ${info.level}: ${info.message}`
      )
    ),
  }),
];

if (config.env === 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/all.log' })
  );
}

const logger = winston.createLogger({ level: level(), levels, transports });
export default logger;
