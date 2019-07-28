import User from "./User";


export default class Message {
    user: User;
    content: string;
    receivedAt: Date;

    get data () {
        return {
            user: this.user.data,
            content: this.content,
            receivedAt: this.receivedAt.toISOString(),
        };
    }
}