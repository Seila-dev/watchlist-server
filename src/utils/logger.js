// import winston from 'winston';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Definir níveis de log customizados
// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   debug: 4,
// };

// const level = () => {
//   const env = process.env.NODE_ENV || 'development';
//   const isDevelopment = env === 'development';
//   return isDevelopment ? 'debug' : 'warn';
// };

// // Definir cores para os níveis
// const colors = {
//   error: 'red',
//   warn: 'yellow',
//   info: 'green',
//   http: 'magenta',
//   debug: 'white',
// };

// winston.addColors(colors);

// // Formato para desenvolvimento
// const developmentFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
//   winston.format.colorize({ all: true }),
//   winston.format.printf(
//     (info) => `${info.timestamp} ${info.level}: ${info.message}` +
//     (info.splat !== undefined ? `${info.splat}` : " ") +
//     (info.label ? `[${info.label}]` : "") +
//     (info.stack ? `\n${info.stack}` : "")
//   ),
// );

// // Formato para produção
// const productionFormat = winston.format.combine(
//   winston.format.timestamp(),
//   winston.format.errors({ stack: true }),
//   winston.format.json(),
// );

// // Transports
// const transports = [];

// // Console transport (sempre ativo)
// transports.push(
//   new winston.transports.Console({
//     format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat
//   })
// );

// // File transports para produção
// if (process.env.NODE_ENV === 'production') {
//   transports.push(
//     // Logs de erro
//     new winston.transports.File({
//       filename: path.join(process.cwd(), 'logs', 'error.log'),
//       level: 'error',
//       format: productionFormat,
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
    
//     // Todos os logs
//     new winston.transports.File({
//       filename: path.join(process.cwd(), 'logs', 'combined.log'),
//       format: productionFormat,
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     })
//   );
// }

// // Criar logger
// export const logger = winston.createLogger({
//   level: level(),
//   levels,
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.errors({ stack: true }),
//     winston.format.splat(),
//     winston.format.json()
//   ),
//   transports,
//   exitOnError: false,
// });

// // Stream para integração com Morgan (se necessário)
// export const loggerStream = {
//   write: (message) => {
//     logger.http(message.substring(0, message.lastIndexOf('\n')));
//   },
// };

// export default logger;