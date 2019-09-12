import BaseContext from "./socket-entry-service/BaseContext";
import { SocketListener, addEvent } from "./socket-entry-service/event-manager";
import * as contextManager from "./socket-entry-service/context-manager";
import { CoreEvents } from "./socket-entry-service/router-socket-entry";

export const SocketAPI = {
    CoreEvents,
    BaseContext,
    regSocketRoute (namespace: string, event: string, listener: SocketListener) {
        addEvent(namespace, event, listener);
    },
    Context: { ...contextManager },
};


import { router } from "./http-entry-service/router-http-entry";

export const HttpAPI = {
    router
};
