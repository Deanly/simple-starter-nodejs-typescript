import socket_io from "socket.io";

import { core as logger } from "../../logger";

export default class BaseContext {

    constructor (
        public connection: socket_io.Socket,
        private errorHandler: (error: Error) => void,
    ) {
        this.label = connection.id;
        this.delegated = false;
        this.authorityToNamespaces = new Set();
    }

    private authorityToNamespaces: Set<string>;

    token: string;
    delegated: boolean;
    label: string;

    get id () {
        return this.connection.id;
    }
    get address () {
        if (this.connection.handshake.headers["x-forwarded-for"]) return (this.connection.handshake as any)["x-forwarded-for"];
        else return this.connection.handshake.address;
    }
    get authorities () {
        return Array.from(this.authorityToNamespaces.values());
    }
    get delegatedListenerCount () {
        return this.connection.eventNames()
            .reduce((cnt, event) => {
                return cnt + this.connection.listenerCount(event);
            }, 0);
    }

    toString () {
        return `{ id:${this.id}, label:${this.label}, address:${this.address}, delegated:${this.delegated}(${this.delegatedListenerCount}), authority:[${this.authorities.join(",")}] }`;
    }

    grantAuthority (namespace: string) {
        this.authorityToNamespaces.add(namespace);
    }

    permission (namespace: string) {
        this.authorityToNamespaces.has(namespace);
    }

    revokeAuthority (namespace: string) {
        this.authorityToNamespaces.delete(namespace);
    }

    on (event: string, listener: (...args: Array<any>) => Promise<void>): Function {
        const wrap = async (...args: Array<any>): Promise<void> => {
            logger.debug(`received:${event} from ${this.label}`);
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
        logger.debug(`sended:${event} to ${this.label}`);
        const args = [event];
        data.forEach(value => {
            // Serialize data you want
            args.push(value);
        });
        this.connection.emit.apply(this.connection, args);
    }
}