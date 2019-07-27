import socket_io from "socket.io";

function routeAgent (conn: socket_io.Socket) {
    const context = {
        _conn_id: conn.id,
        _conn: conn,
        on: function (evt: string, func: Function) {
            // secure
            this._conn.on(evt, func);
            return func;
        },
        off: function (evt: string, func: Function) {
            if (!func) this._conn.removeAllListeners(evt);
            else this._conn.removeListener(evt, func);
        },
        emit: function (evt: string) {
            const params = [];
            params.push(evt);

            this._conn.emit.apply(this._conn, params);
        },
    };

    function delegateEventsToContext () {
        conn.removeAllListeners("close");
        conn.removeAllListeners("disconnect");
        conn.removeAllListeners("error");

        conn.on("close", () => {});

        conn.on("disconnect", () => { });
    }
}


export function init (socket: socket_io.Server, cb: Function) {
    socket.on("connect", (conn) => {
        routeAgent(conn);
    });

    return cb(undefined);
}
