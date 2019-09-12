
class BootstrapErrorException extends ErrorExt {
    constructor (msg: string, params?: ErrorExportParams) {
        super(msg, "C-BE", params, "Bootstrap error exception", 500);
    }
}

interface BootErrors extends ErrorExportsDefault {
    BootstrapErrorException: ErrorExportConstructor;
}

const error_default = {
    BootstrapErrorException,
};

export default error_default as BootErrors;