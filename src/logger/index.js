const winston = require("winston");
const { Logtail } = require("@logtail/node");
// const { LogtailTransport } = require("winston-transport-logtail");
const LokiTransport = require('winston-loki');
const environment = require("../config/environmentConfig");
const { environmentTypes } = require("../constants/commonConstants");

const customFormat = winston.format.printf(
    ({ level, message, timestamp, stack, ...meta }) => {
        const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";

        return `${timestamp} [${level}]: ${stack || message} ${metaString}`;
    }
);

const dev_logger = () => {
    return winston.createLogger({
        level: "info",
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            customFormat
            // winston.format.errors({ stack: true }),
            // winston.format.json()
        ),
        transports: [
            new winston.transports.Console(), // for Docker stdout
            // new LogtailTransport(logtail), // send to cloud
            new LokiTransport({
                host: environment.GRAFANA_LOKI_ENDPOINT,
                basicAuth: `${environment.GRAFANA_LOKI_USER}:${environment.GRAFANA_LOKI_API_KEY}`,
                onConnectionError: (err) => {
                    console.error("Loki connection error:", err);
                },
                labels: { app: "my-node-api" },
                json: true
            }),
        ],
    });
};

const prod_logger = () => {
    return winston.createLogger({
        level: "info",
        format: winston.format.combine(
            // winston.format.colorize(),
            winston.format.timestamp(),
            customFormat
            // winston.format.errors({ stack: true }),
            // winston.format.json()
        ),
        transports: [
            new winston.transports.Console(), // for Docker stdout
            // new LogtailTransport(logtail), // send to cloud
            new LokiTransport({
                host: environment.GRAFANA_LOKI_ENDPOINT,
                basicAuth: `${environment.GRAFANA_LOKI_USER}:${environment.GRAFANA_LOKI_API_KEY}`,
                onConnectionError: (err) => {
                    console.error("Loki connection error:", err);
                },
                labels: { app: "my-node-api" },
                json: true
            }),
        ],
    });
};

// NOTE: injectingrespective logger based on the current environment
let logger = dev_logger();

if(environment.ENVIRONMENT === environmentTypes.PROD){
    logger = prod_logger();

}

// console.log(">>>>>>>>>>>>>>>>>>>>>> LOGGER");
// // console.log(Object.keys(logger));
// console.log(logger._readableState.pipes[1]);



module.exports = logger;


// >>>>>>>>>>>>>>>>>>>>>>>>> // NOTE: COMMENT 

// const winston = require("winston");
// const LokiTransport = require("winston-loki");
// const environment = require("../config/environmentConfig");

// // Define log levels
// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     debug: 4,
// };

// // Define colors for console output
// const colors = {
//     error: "red",
//     warn: "yellow",
//     info: "green",
//     http: "magenta",
//     debug: "white",
// };

// winston.addColors(colors);

// // Determine log level based on environment
// const level = () => {
//     const env = environment.ENVIRONMENT || "DEV";
//     const isDevelopment = env === "DEV";
//     return isDevelopment ? "debug" : "info";
// };

// // Custom format for console (development)
// const consoleFormat = winston.format.combine(
//     winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
//     winston.format.colorize({ all: true }),
//     winston.format.printf(
//         (info) => `${info.timestamp} ${info.level}: ${info.message}`
//     )
// );

// // Custom format for Loki (production)
// const lokiFormat = winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.errors({ stack: true }),
//     winston.format.json()
// );

// // Create transports array
// const transports = [];

// // Console transport (always enabled for local debugging)
// transports.push(
//     new winston.transports.Console({
//         format: consoleFormat,
//     })
// );

// // Loki transport (production only)
// if (environment.ENVIRONMENT=== "PROD" && environment.GRAFANA_LOKI_ENDPOINT) {
//     transports.push(
//         new LokiTransport({
//             host: environment.GRAFANA_LOKI_ENDPOINT,
//             labels: {
//                 app: "nodejs-api",
//                 environment: environment.ENVIRONMENT,
//                 version: "1.0.0",
//                 host: environment.GRAFANA_LOKI_ENDPOINT,
//             },
//             json: true,
//             format: lokiFormat,
//             replaceTimestamp: true,
//             onConnectionError: (err) =>
//                 console.error("Loki connection error:", err),
//             basicAuth: `${environment.GRAFANA_LOKI_USER}:${environment.GRAFANA_LOKI_API_KEY}`,
//             // Batching configuration for better performance
//             batching: true,
//             interval: 5, // Send logs every 5 seconds
//         })
//     );
// }

// // Create logger instance
// const logger = winston.createLogger({
//     level: level(),
//     levels,
//     transports,
//     // Handle exceptions and rejections
//     exceptionHandlers: transports,
//     rejectionHandlers: transports,
//     exitOnError: false,
// });

// module.exports = logger;

