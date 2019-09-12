import { config, format, createLogger, transports, LeveledLogMethod, Logger, LogEntry } from "winston";

export enum LogLevels {
    EMERGENCY = "emerg", ALERT = "alert", CRITICAL = "crit",
    ERROR = "error", WARNING = "warning", NOTICE = "notice",
    INFO = "info", DEBUG = "debug"
}

interface ILogger extends Pick<Logger,
    LogLevels.EMERGENCY | LogLevels.ALERT | LogLevels.CRITICAL
    | LogLevels.ERROR | LogLevels.WARNING | LogLevels.NOTICE | LogLevels.INFO | LogLevels.DEBUG
> {
    level: string;
}

export const simple: ILogger = createLogger({
    levels: config.syslog.levels,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.colorize(),
        // format.json(),
        format.printf((info) => {
            const log = `[${info.timestamp}][${info.level}]:${info.message}`;

            return info.stack
                ? `${log}\n${info.stack}`
                : log;
        }),
    ),
    transports: [
        new transports.Console(),
        // new transports.File({ filename: "error.log", level: "error" }),
        // new transports.File({ filename: "combined.log" }),
    ],
});

export const system: ILogger = createLogger({
    levels: config.syslog.levels,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.colorize(),
        format.printf((info) => {
            const log = `[${info.timestamp}][${info.level}][SYS]:${info.message}`;

            return info.stack
                ? `${log}\n${info.stack}`
                : log;
        }),
    ),
    transports: [
        new transports.Console(),
    ],
});

export const core: ILogger = createLogger({
    levels: config.syslog.levels,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.colorize(),
        format.printf((info) => {
            const log = `[${info.timestamp}][${info.level}][CORE]:${info.message}`;
            return info.stack
                ? `${log}\n${info.stack}`
                : log;
        }),
    ),
    transports: [
        new transports.Console(),
    ],
});


export function changeLogLevel (level: LogLevels) {
    core.level = level;
    simple.level = level;
    system.level = level;
}