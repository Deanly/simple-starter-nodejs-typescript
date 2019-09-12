import { SocketAPI } from "../../../core";
import { UserContext } from "../../routes/socket-router";

import * as chatService from "../../services/chat-service";
import Message from "../../models/Message";
import User from "../../models/User";

export function broadcastMessage (roomId: string, message: Message) {
    const room = chatService.findRoom(roomId);
    room.getUsers()
        .map(user => SocketAPI.Context.get(user.connId))
        .filter(ctx => !!ctx)
        .forEach(ctx => ctx.emit("push:message", message.data));
}

export function broadcastRoom (roomId: string) {
    const room = chatService.findRoom(roomId);
    room.getUsers()
        .map(user => SocketAPI.Context.get(user.connId))
        .filter(ctx => !!ctx)
        .forEach(ctx => ctx.emit("push:room", room.serialize));
}

export function sendYou (user: User) {
    const ctx = SocketAPI.Context.get(user.connId);
    ctx.emit("push:me", user.data);
}