import express from "express";

export function indexHome (req: express.Request, res: express.Response, next?: express.NextFunction) {
    res.sendFile(global.viewFilePath("/index.html"));
}
