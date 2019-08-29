/**
 * global declares
 */

interface ErrorExt extends Error {
    name: string;
    code: string | number;
    message: string;
    stack?: string;
}

declare interface ErrorExtConstructor {
    new(message: string, code: string | number): ErrorExt;
    readonly prototype: ErrorExt;
}

declare interface Array<T> {
    asyncForEach: (callbackfn: (value: T, index: number, array: T[]) => Promise<void>) => Promise<void>;
}

declare namespace NodeJS {
    interface Global {
        ErrorExt: ErrorExtConstructor;
        setTimeoutPromise: (fn: Function, ms: number) => Promise<void>;
        handleError: (e: Error | ErrorExt) => void;

        host: string;
        http_port: number;
        socket_port: number;
        debug: boolean;

        VIEWS_HTML_PATH: string;
        viewFilePath: (view: string) => string;
    }
}