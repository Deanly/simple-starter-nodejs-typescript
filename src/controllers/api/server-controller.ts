import express from "express";

export function myEndpoint (req: express.Request, res: express.Response) {
    res.status(200).json({
        http: `${global.host}:${global.http_port}`,
        ws: `${global.host}:${global.socket_port}`
    });
}