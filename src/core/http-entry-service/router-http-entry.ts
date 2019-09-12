import winston from "winston";
import express from "express";

export const router = express.Router();

import * as serverController from "./server-controller";
router.get("/endpoint", serverController.myEndpoint);


export function initHttpRouter (cb: (error: Error, router: express.Router) => void) {
    return cb(undefined, router);
}