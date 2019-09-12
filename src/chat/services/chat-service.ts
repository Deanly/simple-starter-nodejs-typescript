import Room from "../models/Room";
import Message from "../models/Message";

import { UserContext } from "../routes/socket-router";

const context_rooms: Map<string, Room> = new Map();
const sample_room_id = "sample_room_id";

export function getAllRooms () {
    return Array.from(context_rooms.values());
}

export function init (cb: Function): void {
    const room = new Room(sample_room_id);
    context_rooms.set(sample_room_id, room);
    cb();
}

export function findRoom (roomId: string): Room {
    return context_rooms.get(roomId);
}

export function receiveNewMessage (roomId: string, msg: string, userId: string): Message {
    const room = context_rooms.get(roomId);
    if (!room) throw new Error(`Not found room: id=${roomId}`);

    const message = new Message();
    message.content = msg;
    message.receivedAt = new Date();
    message.user = room.getUsers().find(user => user.connId === userId);

    room.addMessage(message);

    return message;
}

export function joinToRoom (roomId: string, userCtx: UserContext): Room {
    const room = context_rooms.get(roomId);

    room.addUser(userCtx.user);
    userCtx.rooms.set(room.id, room);

    return room;
}

export function leaveFromRoom (roomId: string, userCtx: UserContext): void {
    const room = context_rooms.get(roomId);

    room.remUser(userCtx.id);
    userCtx.rooms.delete(roomId);
}