import fs from "fs";
import path from "path";
import async from "async";
import morgan from "morgan";
import express from "express";
import dotenv from "dotenv";
import http from "http";
import socket_io from "socket.io";
import body_parser from "body-parser";
import cookie_parser from "cookie-parser";
import lusca from "lusca";
import os from "os";

require("./implements/global");

import { core as initLogger } from "../logger";
import { initHttpRouter } from "./http-entry-service/router-http-entry";
import { initSocketRouter } from "./socket-entry-service/router-socket-entry";
import BootErrors from "./exceptions/BootErrors";

let app: express.Express;
let env_file_name: string;

let flag_isolated_socket_port = false;

const NODE_APP_INSTANCE = 0;

async.waterfall([

    function loadCmdParameters (cb: Function) {
        for (let i = 2; i < process.argv.length; i++) {
            switch (process.argv[i]) {
                case "--debug": global.debug = true; break;
                case "--isolated-socket-port": flag_isolated_socket_port = true; break;
                default:
                    if (process.argv[i].split("=")[0] === "--env") env_file_name = process.argv[i].split("=")[1];
                    break;
            }
        }
        return cb();
    },

    function loadConfiguration (cb: Function) {
        /** dotenv configurations */
        dotenv.config({ path: env_file_name || ".env.example" });

        /** global custom configurations */
        global.VIEWS_HTML_PATH = path.join(__dirname, "..", "..", "www", "views", "html");
        return cb();
    },

    function initializeLogger (cb: Function) {
        if (global.debug === true) {
            initLogger.level = "debug";
            initLogger.warning("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            initLogger.warning("!!!! Running with debug-mode enabled !!!!");
            initLogger.warning("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            initLogger.debug("process.env: " + JSON.stringify(process.env));
        }
        return cb();
    },

    function performance (cb: Function) {
        global.Promise = require("bluebird");
        return cb();
    },

    function connectDatabase (cb: Function) {
        return cb();
    },

    function initializeCore (cb: Function) {
        const initWorker = function (dir: string, cb: Function) {
            let p = 0;
            async.mapSeries(fs.readdirSync(`./dist/${dir}`), function (componentName, cb) {
                const n = ++p;
                if (fs.lstatSync(`./dist/${dir}/${componentName}`).isDirectory()) {
                    initWorker(`./${dir}/${componentName}`, cb);
                } else {
                    if (componentName.endsWith("js")) {
                        const component = require(`../${dir}/${componentName}`);
                        if (component.init) {
                            initLogger.debug(`\x1b[36m[${n}]Initiating ${dir} ${componentName} \x1b[0m`);
                            component.init((err?: Error) => {
                                initLogger.debug(`\x1b[32m[${n}"]Done ${dir} ${componentName} \x1b[0m`);
                                cb(err);
                            });
                        } else {
                            initLogger.debug(`\x1b[33m[${n}]Skip ${dir} ${componentName} \x1b[0m`);
                            cb();
                        }
                    } else {
                            initLogger.debug(`[${n}]Skip ${dir} ${componentName}`);
                        cb();
                    }
                }
            }, err => cb(err));
        };
        initWorker("core", (err: Error) => cb(err, initWorker));
    },

    // function initializeServices (initWorker: Function, cb: Function) {
    //     initWorker("services", (err: Error) => cb(err, initWorker));
    // },

    function initializeServices (initWorker: Function, cb: Function) {
        initWorker("chat", (err: Error) => cb(err));
    },

    function startExpress (cb: Function) {
        app = express();
        const server = http.createServer(app);

        // app.use(lusca({
        //     csrf: true,
        //     csp: { /* ... */},
        //     xframe: "SAMEORIGIN",
        //     p3p: "ABCDEF",
        //     hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
        //     xssProtection: true,
        //     nosniff: true,
        //     referrerPolicy: "same-origin"
        // }));

        app.disable("x-powered-by");
        app.disable("etag");

        app.use(body_parser.json());
        app.use(body_parser.urlencoded({extended: true}));
        app.use(cookie_parser());

        /* Bind Access Log */
        // if (flagAccessLog) app.use(morgan(':remote-addr - [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

        /* Bind Cross Domain Handler */
        app.use(function (req, res, next) {
            if (process.env.ACCESS_CONTROL_ALLOW_ORIGIN) { res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN); }
            if (process.env.ACCESS_CONTROL_ALLOW_METHODS) { res.header("Access-Control-Allow-Methods", process.env.ACCESS_CONTROL_ALLOW_METHODS); }
            if (process.env.ACCESS_CONTROL_ALLOW_HEADERS) { res.header("Access-Control-Allow-Headers", process.env.ACCESS_CONTROL_ALLOW_HEADERS); }

            if ("OPTIONS" === req.method) res.sendStatus(200);
            else next();
        });

        /* Bind Static Service Path */
        // app.use("/", express.static("www"));
        app.use("/resources", express.static("www/resources"));

        /* renderer */
        // app.use(renderer);
        global.viewFilePath = (view: string) => {
            return path.join(global.VIEWS_HTML_PATH, view);
        };

        cb(void 0, server);
    },

    function socketServer (server: http.Server, cb: Function) {
        let socketServer, io;
        if (flag_isolated_socket_port) {
            socketServer = http.createServer(function (q, r) {
                if (process.env.SOCKET_ACCESS_CONTROL_ALLOW_ORIGIN) { r.setHeader("Access-Control-Allow-Origin", process.env.SOCKET_ACCESS_CONTROL_ALLOW_ORIGIN); }
                if (process.env.SOCKET_ACCESS_CONTROL_ALLOW_METHODS) { r.setHeader("Access-Control-Allow-Methods", process.env.SOCKET_ACCESS_CONTROL_ALLOW_METHODS); }
                if (process.env.SOCKET_ACCESS_CONTROL_ALLOW_HEADERS) { r.setHeader("Access-Control-Allow-HEADERS", process.env.SOCKET_ACCESS_CONTROL_ALLOW_HEADERS); }
                if (process.env.SOCKET_ACCESS_CONTROL_ALLOW_CREDENTIALS) { r.setHeader("Access-Control-Allow-Credentials", process.env.SOCKET_ACCESS_CONTROL_ALLOW_CREDENTIALS); }

                r.setHeader("Cache-Control", "no-cache");
            });
            io = socket_io(socketServer);
            cb(void 0, server, socketServer, io);
        } else {
            io = socket_io(server);
            cb(void 0, server, server, io);
        }
    },

    function bindRouter (server: http.Server, socketServer: http.Server, io: socket_io.Server, cb: Function) {
        initHttpRouter((err, router) => {
            if (err) return cb(err);
            app.use(router);
            initLogger.info("Initialized Http Router");
            return cb(undefined, server, socketServer, io);
        });
    },

    function bindSocketRouter (server: http.Server, socketServer: http.Server, io: socket_io.Server, cb: Function) {
        initSocketRouter(io, function (err: Error) {
            if (err) return cb(err);
            initLogger.info("Initialize Socket Router");
            return cb(undefined, server, socketServer);
        });
    },

    function bindHandlers (server: http.Server, socketServer: http.Server, cb: Function) {
        app.use((req, res, next) => {
            res.status(404).send({code: "404", message: "Not Found" });
        });

        const errorHandler: express.ErrorRequestHandler = (err, req, res) => {
            if (err instanceof ErrorExt) {
                res.status(err.statusCode).send({ code: err.statusCode.toString(), message: "internal server error" });
            } else {
                res.status(500).send({ code: "500", message: "internal server error" });
            }
            initLogger.error(err);
        };
        app.use(errorHandler);

        process.on("uncaughtException", (err) => {
            const error = new BootErrors.BootstrapErrorException(err.message, { unexpected: true, unhandled: true });
            if (err.stack) error.stack = err.stack;
            initLogger.alert(error);
        });

        cb(undefined, server, socketServer);
    },

    function startListenHttp (server: http.Server, socketServer: http.Server, cb: Function) {
        const port = parseInt(process.env.BASE_PORT);
        initLogger.info("Binding on HTTP port " + port);
        server.listen(port);
        global.http_port = port;
        cb(undefined, socketServer);
    },

    function bindEndpoint (socketServer: http.Server, cb: Function) {
        if (process.env.HOST) {
            global.host = process.env.HOST;
        } else {
            const ifaces = os.networkInterfaces();
            Object.keys(ifaces).forEach((ifname) => {
                ifaces[ifname].forEach((iface) => {
                    if (global.host || "IPv4" !== iface.family || iface.internal !== false) {
                        return;
                    }
                    global.host = iface.address;
                });
            });
            if (!global.host) global.host = "127.0.0.1";
        }
        cb(undefined, socketServer);
    },

    function startListenSocket (socketServer: http.Server, cb: Function) {
        let socketPort;
        if (flag_isolated_socket_port) {
            socketPort = parseInt(process.env.SOCKET_PORT) + NODE_APP_INSTANCE;
            socketServer.listen(socketPort);
        } else {
            socketPort = global.http_port;
        }

        initLogger.info("Binding on SocketIO port " + socketPort);
        global.socket_port = socketPort;
        cb();
    },

    function serverInformation (cb: Function) {
        const stats = fs.statSync(path.resolve(__dirname, ".."));
        const serverInfo = {
            userInfo: require("os").userInfo(),
            directory: {
                path: path.resolve(__dirname, ".."),
                size: stats.size,
                mode: stats.mode,
                otherExecute: stats.mode & 1 ? true : false,
                otherWrite: stats.mode & 2 ? true : false,
                otherRead: stats.mode & 4 ? true : false,
                groupExecute: stats.mode & 10 ? true : false,
                groupWrite: stats.mode & 20 ? true : false,
                groupRead: stats.mode & 40 ? true : false,
                ownerExecute: stats.mode & 100 ? true : false,
                ownerWrite: stats.mode & 200 ? true : false,
                ownerRead: stats.mode & 400 ? true : false,
                file: stats.mode & 0o0100000 ? true : false,
                directory: stats.mode & 0o0040000 ? true : false,
            }
        };
        initLogger.info(`Server Information\n\tUserInfo: ${JSON.stringify(serverInfo.userInfo)}\n\tDirectoryInfo: ${JSON.stringify(serverInfo.directory)}`);
        cb();
    }

], (err: any) => {
    if (err) {
        initLogger.error(err);
        throw "Failed to startup service";
    }
    initLogger.info(`The service is prepared. ${global.host}:${global.http_port},${global.socket_port}`);
});
