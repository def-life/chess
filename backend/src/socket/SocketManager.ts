import { Game } from "./Game"
import { User } from "./User"

export class SocketManager {
    interestedSockets: Map<string, User[]> // gameId -> User 
    userIdToGameId: Map<string, string>
    private static instance: SocketManager

    private constructor() {
        this.interestedSockets = new Map()
        this.userIdToGameId = new Map()
    }

    static getStaticInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance
    }

    addUser(user: User, gameId: string) {

        this.interestedSockets.set(gameId, [
            ...(this.interestedSockets.get(gameId) || []),
            user,
        ]);
        this.userIdToGameId.set(user.userId, gameId);
    }

    broadcastToOthers(sender: User, gameId: string, message: string) {
        const users = this.interestedSockets.get(gameId);
        if (!users) {
            console.log(`No users interested in game ${gameId}`);
            return;
        }

        users.forEach(user => {
            if (user !== sender) {
                user.socket.send(message);
            }
        });
    }

    broadCast(gameId: string, message: string) {
        const users = this.interestedSockets.get(gameId)
        if (!users) {
            return
        }

        users.forEach((user) => {
            console.log("Broadcasting to ", user.userId)
            user.socket.send(message)
        })
    }

    clearGame(gameId: string) {
        const users = this.interestedSockets.get(gameId)
        if (!users) {
            console.log("no user associated with it")
            return
        }

        users.forEach((user) => {
            SocketManager.getStaticInstance().removeUser(user)
        })
    }




    removeUser(user: User) {
        const gameId = this.userIdToGameId.get(user.userId)
        if (!gameId) {
            console.log('user was not intereseted in any game')
            return
        }
        const users = this.interestedSockets.get(gameId) || []
        const remainingUser = users.filter((_user) => _user.userId !== user.userId)
        this.interestedSockets.set(gameId, remainingUser)

        if (remainingUser.length === 0) {
            this.interestedSockets.delete(gameId)
        }
        this.userIdToGameId.delete(user.userId)
    }

}