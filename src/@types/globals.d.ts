
declare namespace NodeJS {
    interface Global {
        host: string;
        http_port: number;
        socket_port: number;
        debug: boolean;

        VIEWS_HTML_PATH: string;
        viewFilePath: (view: string) => string;
    }
}