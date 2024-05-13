import { WebSocket } from "ws"

export class User {
    userId: string
    socket: WebSocket


    constructor(userId: string, socket: WebSocket) {
        this.socket = socket
        this.userId = userId
    }
}