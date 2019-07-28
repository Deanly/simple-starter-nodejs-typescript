import socket_io from "socket.io";

import User from "../../models/User";
import Room from "../../models/Room";

import { simple as logger } from "../../util/logger";

export class UserContext {

    constructor (
        public connection: socket_io.Socket,
        private errorHandler: (error: Error) => void,
    ) { }

    user: User;
    rooms: Map<string, Room> = new Map();

    get id () {
        return this.connection.id;
    }

    on (event: string, listener: (...args: Array<any>) => Promise<void>): Function {
        const wrap = async (...args: Array<any>): Promise<void> => {
            logger.debug(`received:${event} from ${this.user.name}(${this.id})`);
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
        logger.debug(`sended:${event} to ${this.user.name}(${this.id})`);
        const args = [event];
        data.forEach(value => {
            // Serialize data you want
            args.push(value);
        });
        this.connection.emit.apply(this.connection, args);
    }
}