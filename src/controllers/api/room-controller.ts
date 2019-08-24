import * as chatService from "../../services/chat-service";
import express from "express";
import Room from "../../models/Room";

export function getAllRooms (req: express.Request, res: express.Response) {
    res.status(200).json(chatService.getAllRooms()
        .map((room) => room.serialize));

}