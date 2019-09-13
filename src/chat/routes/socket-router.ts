import { simple as logger } from "../../logger";
import { SocketAPI } from "../../core";

import User from "../models/User";
import Room from "../models/Room";

import * as userInbound from "../controllers/socket/user-inbound-controller";
import * as userOutbound from "../controllers/socket/user-outbound-controller";

let _guest_count = 1;

function errorHandler (error: Error): void {
    logger.error(error);
}

export class UserContext extends SocketAPI.BaseContext {
    user: User;
    rooms: Map<string, Room>;
}

export function init (cb: Function) {
    SocketAPI.regSocketRoute("chat", SocketAPI.CoreEvents.Connect, async (ctx: UserContext) => {
        const user = new User();
        user.connId = ctx.id;
        user.name = `GUEST-${_guest_count++}`;
        ctx.user = user;

        ctx.rooms = new Map();

        userInbound.joinServer(ctx);
        userInbound.joinRoom(ctx, "sample_room_id");
    });

    SocketAPI.regSocketRoute("chat", SocketAPI.CoreEvents.Disconnect,
        async (ctx: UserContext) => {
            userInbound.leaveRoom(ctx, "sample_room_id");
            userInbound.leaveServer(ctx);
        });

    SocketAPI.regSocketRoute("chat", "message:send",
        async (ctx: UserContext, roomId: string, msg: string) =>
            userInbound.receiveMessage(ctx, roomId, msg));

    SocketAPI.regSocketRoute("chat", "user:name",
        async (ctx: UserContext, name: string) =>
            userInbound.changeUserName(ctx, name));

    return cb(void 0);
}
