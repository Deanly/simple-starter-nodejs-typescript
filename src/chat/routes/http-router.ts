import { HttpAPI } from "../../core";

import * as viewPageController from "../controllers/view/page-controller";
import * as roomController from "../controllers/api/room-controller";

export function init (cb: Function) {
    HttpAPI.router
        .get("/", viewPageController.indexHome)
        .get("/api/rooms", roomController.getAllRooms)
    ;

    cb(void 0);
}