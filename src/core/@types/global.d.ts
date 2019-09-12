/**
 * global declares
 */
interface ErrorExtConstructor {
    new (msg: string, sysCode: string, params?: ErrorExportParams, desc?: string, statusCode?: number): ErrorExt;
}

interface ErrorExportParams {
    code?: string;
    cause?: string;
    sample?: string;
    valid?: string;
    sendingAlarm?: boolean;
    unexpected?: boolean;
    handled?: boolean;
    unhandled?: boolean;
    from?: string;
}

interface ErrorExportConstructor {
    new (msg: string, params?: ErrorExportParams): ErrorExt;
}

interface ErrorExportsDefault {
    [key: string]: ErrorExportConstructor;
}

declare interface Array<T> {
    asyncForEach: (callbackfn: (value: T, index: number, array: T[]) => Promise<void>) => Promise<void>;
}

declare namespace NodeJS {
    interface Global {
        ErrorExt: ErrorExtConstructor;
        ErrorExportConstructor: ErrorExportConstructor;
        ErrorExportParams: ErrorExportParams;
        ErrorExportsDefault: ErrorExportsDefault;
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