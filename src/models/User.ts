
export default class User {
    connId: string;
    name: string;

    get data () {
        return {
            connId: this.connId,
            name: this.name,
        };
    }
}