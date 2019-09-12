import socket_io from "socket.io";

import { core as logger } from "../../logger";

export default class BaseContext {

    constructor (
        public connection: socket_io.Socket,
        private errorHandler: (error: Error) => void,
    ) { }


    get id () {
        return this.connection.id;
    }
    get address () {
        if (this.connection.handshake.headers["x-forwarded-for"]) return (this.connection.handshake as any)["x-forwarded-for"];
        else return this.connection.handshake.address;
    }

    toString () {
        return `{ id:${this.id}, address:${this.address} }`;
    }

    on (event: string, listener: (...args: Array<any>) => Promise<void>): Function {
        const wrap = async (...args: Array<any>): Promise<void> => {
            logger.debug(`received:${event} from (${this.id})`);
            try {
                // Deserialize data
                await listener.apply(undefined, args);
            } catch (e) {
                this.errorHandler(e);
            }
        };
        this.connection.on(event, wrap);
        return listener;
    }

    off (event: string, listener: (...args: any[]) => void): void {
        if (!listener) this.connection.removeAllListeners(event);
        else this.connection.removeListener(event, listener);
    }

    emit (event: string, ...data: Array<any>): void {
        logger.debug(`sended:${event} to (${this.id})`);
        const args = [event];
        data.forEach(value => {
            // Serialize data you want
            args.push(value);
        });
        this.connection.emit.apply(this.connection, args);
    }
}