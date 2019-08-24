import { format, createLogger, transports } from "winston";

const print = format.printf((info) => {
    const log = `${info.level}: ${info.message}`;

    return info.stack
        ? `${log}\n${info.stack}`
        : log;
});

export const simple = createLogger({
    level: global.debug ? "debug" : "info",
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        print,
        // format.json(),
    ),
    transports: [
        new transports.Console(),
        // new transports.File({ filename: "error.log", level: "error" }),
        // new transports.File({ filename: "combined.log" }),
    ],
});