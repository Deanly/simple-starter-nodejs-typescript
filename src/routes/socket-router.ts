import socket_io from "socket.io";

import User from "../chat/models/User";
import { UserContext } from "./supports/context";
import * as userInbound from "../chat/controllers/socket/user-inbound-controller";
import * as userOutbound from "../chat/controllers/socket/user-outbound-controller";
import { simple as logger } from "../logger";

let _guest_count = 1;

function errorHandler (error: Error): void {
    logger.error(error);
}

function routeUser (connection: socket_io.Socket) {
    const context = new UserContext(connection, errorHandler);

    const delegateEventsToContext = () => {
        connection.on("disconnect", () => userInbound.leaveServer(context));

        context.on("message:send",
            async (roomId: string, msg: string) =>
                userInbound.receiveMessage(context, roomId, msg));

        context.on("user:name",
            async (name: string) =>
                userInbound.changeUserName(context, name));
    };

    // authorization

    const user = new User();
    user.connId = connection.id;
    user.name = `GUEST-${_guest_count++}`;
    context.user = user;

    delegateEventsToContext();

    userInbound.joinServer(context);
    userInbound.joinRoom(context, "sample_room_id");
}


export function init (socket: socket_io.Server, cb: Function) {
    socket.on("connect", (conn) => {
        routeUser(conn);
    });

    return cb(undefined);
}
