import BaseContext from "./BaseContext";

const base_contexts: Map<string, BaseContext> = new Map();

export function get<T extends BaseContext> (id: string): T {
    return base_contexts.get(id) as T;
}

export function set (id: string, ctx: BaseContext) {
    base_contexts.set(id, ctx);
}

export function del (id: string) {
    base_contexts.delete(id);
}

export function getValues<T extends BaseContext> () {
    return Array.from(base_contexts.values()) as T[];
}

export function getKeys () {
    return Array.from(base_contexts.keys());
}

export function has (id: string) {
    return base_contexts.has(id);
}

export function getSize () {
    return base_contexts.size;
}
