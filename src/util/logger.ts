import winston from "winston";
import { Logger } from "winston";

const logger = new (Logger)({
    transports: [
        new (winston.transports.Console)({ level: process.env.NODE_ENV === "production" ? "error" : "debug" }),
        new (winston.transports.File)({ filename: "debug.log", level: "debug"})
    ]
});


export default logger;
