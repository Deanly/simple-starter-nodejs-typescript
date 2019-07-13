import winston from "winston";
import express from "express";
const router = express.Router();



export function init (cb: (error: Error, router: express.Router) => void) {
    return cb(undefined, router);
}