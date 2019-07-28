import User from "./User";
import Message from "./Message";
import { sequelize } from "./data/sequelize";

let orm;

export default class Room {

    static init(cb: Function) {
        orm = sequelize.define("room", {
            /* orm definitions.. */
        });
        // Do something you want within initialize server (bootstrap)
        cb();
    }

    constructor (public id: string) { }

    private _users: Array<User> = [];
    private _messages: Array<Message> = [];

    get data () {
        return {
            id: this.id,
            users: this._users.map(user => user.data),
            messages: this._messages.map(message => message.data),
        };
    }

    async persistence () {
        /* orm persistence code */
        // await orm.save();
    }

    addUser (user: User): void {
        this._users.push(user);
    }

    remUser (userId: string): void {
        this._users.splice(this._users.map(user => user.connId).indexOf(userId), 1);
    }

    getUsers (): Array<User> {
        return this._users;
    }

    addMessage (message: Message): void {
        this._messages.push(message);
    }

    getMessages (): Array<Message> {
        return this._messages;
    }

}
