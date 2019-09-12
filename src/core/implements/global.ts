
class ErrorExt extends Error {
    constructor (
        public msg: string,
        public sysCode: string,
        public params?: ErrorExportParams,
        public desc?: string,
        public statusCode?: number,
    ) { super(`[ErrExt][${sysCode}${params && params.code ? "-" + params.code : ""}]${statusCode ? "[" + statusCode + "]" : "" }["${msg}"]${params ? ":[" + JSON.stringify(params) + "]" : ""}${desc ? "[(" + desc + ")]" : ""}`); }
}

function setTimeoutPromise (fn: Function, ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                fn();
            } catch (e) {
                reject(e);
            }
            resolve();
        }, ms);
    });
}

global.ErrorExt = ErrorExt;
global.setTimeoutPromise = setTimeoutPromise;

Array.prototype.asyncForEach = async function (callbackfn: (value: any, index: number, array: any[]) => Promise<void>): Promise<void> {
    for (let index = 0; index < this.length; index++) {
        await callbackfn(this[index], index, this);
    }
    return;
};