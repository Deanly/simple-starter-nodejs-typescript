import path from "path";
import express from "express";

export function indexHome (req: express.Request, res: express.Response, next?: express.NextFunction) {
    res.sendFile(global.viewFilePath("/index.html"));
}

export function init (cb: Function) {
    cb();
}