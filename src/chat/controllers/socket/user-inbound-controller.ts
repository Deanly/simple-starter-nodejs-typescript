import { UserContext } from "../../routes/socket-router";
import * as outbound from "./user-outbound-controller";
import * as chatService from "../../services/chat-service";

import { simple as logger } from "../../../logger";

import { SocketAPI } from "../../../core";

import {
    broadcastMessage,
    broadcastRoom,
} from "./user-outbound-controller";

export function joinServer (ctx: UserContext): void {
    outbound.sendYou(ctx.user);

    logger.info(`Join User ${ctx.user.connId}`);
}

export function leaveServer (ctx: UserContext): void {
    ctx.rooms.forEach(room => chatService.leaveFromRoom(room.id, ctx));

    logger.info(`Leave User ${ctx.user.connId}`);
}

export function joinRoom (ctx: UserContext, roomId: string): void {
    const room = chatService.joinToRoom(roomId, ctx);
    ctx.rooms.set(room.id, room);
    broadcastRoom(roomId);
}

export function leaveRoom (ctx: UserContext, roomId: string): void {
    chatService.leaveFromRoom(roomId, ctx);
    ctx.rooms.delete(roomId);
    broadcastRoom(roomId);
}

export function receiveMessage (ctx: UserContext, roomId: string, msg: string) {
    const message = chatService.receiveNewMessage(roomId, msg, ctx.user.connId);
    broadcastMessage(roomId, message);
}

export function changeUserName (ctx: UserContext, name: string) {
    if (ctx.user.name === name) return;

    ctx.user.name = name;
    outbound.sendYou(ctx.user);
    ctx.rooms.forEach(room => {
        broadcastRoom(room.id);
    });
}
