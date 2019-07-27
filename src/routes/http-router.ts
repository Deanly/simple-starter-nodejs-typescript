import winston from "winston";
import express from "express";
const router = express.Router();

import * as apiServerController from "../controllers/api/server-controller";
router.get("/endpoint", apiServerController.myEndpoint);

import * as viewPageController from "../controllers/view/page-controller";
router.get("/", viewPageController.indexHome);



export function init (cb: (error: Error, router: express.Router) => void) {
    return cb(undefined, router);
}