import BaseContext from "./BaseContext";

export type SocketListener = (context: BaseContext, ...args: any[]) => Promise<void>;

const event_contexts: Map<string, Map<string, Array<SocketListener>>> = new Map();

export function getNamespace (namespace: string) {
    if (event_contexts.has(namespace)) {
        return event_contexts.get(namespace);
    } else {
        event_contexts.set(namespace, new Map());
        return event_contexts.get(namespace);
    }
}

export function clearNamespace (namespace: string) {
    event_contexts.delete(namespace);
}

export function addEvent (namespace: string, event: string, listener: SocketListener) {
    const events = getNamespace(namespace);

    if (events.has(event)) {
        events.get(event).push(listener);
    } else {
        const arr = [];
        arr.push(listener);
        events.set(event, arr);
    }
}

export function delEvent (namespace: string, event: string) {
    getNamespace(namespace).delete(event);
}

export function getListeners (namespace: string, event: string): Array<SocketListener> {
    return getNamespace(namespace).get(event) || [];
}

export function getAllListeners (event: string): Array<SocketListener> {
    return Array.from(event_contexts.values())
        .reduce((arr, events) => {
            arr.push(...Array.from(events.has(event) ? events.get(event).values() : []));
            return arr;
        }, []);
}

export function getAllEvents () {
    return Array.from(
        Array.from(event_contexts.values())
        .reduce((sets, events) => {
            Array.from(events.keys())
                .forEach(event => sets.add(event));
            return sets;
        }, new Set<string>())
        .values());
}
