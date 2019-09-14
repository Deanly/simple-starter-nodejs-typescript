import socket_io from "socket.io";

import BaseContext from "./BaseContext";
import { core as logger } from "../../logger";

import * as ctxManager from "./context-manager";
import * as evtManager from "./event-manager";

function errorHandler (error: Error): void {
    logger.error(error);
}

export enum CoreEvents {
    Connect = "connect", Disconnect = "disconnect"
}

function routeClient (connection: socket_io.Socket) {
    const context = new BaseContext(connection, errorHandler);

    const delegateEventsToContext = () => {
        connection.on(CoreEvents.Disconnect, () => {
            Promise.all(evtManager.getAllListeners(CoreEvents.Disconnect).map(async fn => await fn(context)))
                .catch(errorHandler)
                .then(() => {
                    context.connection.removeAllListeners();
                    ctxManager.del(context.id);
                })
                .finally(() => {
                    logger.info(`[socket][disconnected]: ${context.toString()}`);
                    context.connection = void 0;
                });
        });

        evtManager.getAllEvents()
            .filter(event => !Object.values(CoreEvents).includes(event as CoreEvents))
            .forEach(event => {
                evtManager.getAllGrantedListeners(context, event)
                    .forEach(listener => {
                        context.on(event, async (...args: any[]) => {
                            listener(context, ...args);
                        });
                    });
            });
    };

    // ... authorization

    context.grantAuthority("normal");

    ctxManager.set(context.id, context);

    Promise.all(evtManager.getAllListeners(CoreEvents.Connect).map(async fn => await fn(context)))
        .catch(e => {
            errorHandler(e);
            ctxManager.del(context.id);
        })
        .then(() => {
            delegateEventsToContext();
            context.delegated = true;
        })
        .finally(() => {
            logger.info(`[socket][connected]: ${context.toString()}`);
        });
}


export function initSocketRouter (socket: socket_io.Server, cb: Function) {
    socket.on("connect", (conn) => {
        routeClient(conn);
    });

    return cb(undefined);
}
