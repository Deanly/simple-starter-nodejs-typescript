import { user_contexts } from "./user-inbound-controller";
import { UserContext } from "../../../routes/supports/context";

import * as chatService from "../../services/chat-service";
import Message from "../../models/Message";
import User from "../../models/User";

export function broadcastMessage (roomId: string, message: Message) {
    const room = chatService.findRoom(roomId);
    room.getUsers()
        .map(user => user_contexts.get(user.connId))
        .filter(ctx => !!ctx)
        .forEach(ctx => ctx.emit("push:message", message.data));
}

export function broadcastRoom (roomId: string) {
    const room = chatService.findRoom(roomId);
    room.getUsers()
        .map(user => user_contexts.get(user.connId))
        .filter(ctx => !!ctx)
        .forEach(ctx => ctx.emit("push:room", room.serialize));
}

export function sendYou (user: User) {
    const ctx = user_contexts.get(user.connId);
    ctx.emit("push:me", user.data);
}