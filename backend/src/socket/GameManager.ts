import { Game } from "./Game";
import { WebSocket } from "ws"
import { INIT_GAME, JOIN_GAME, MOVE } from "./event"
import { Square } from "chess.js";
import { SocketManager } from "./SocketManager";
import { User } from "./User";
import prisma from "../db";
import { Chess } from "chess.js";



export class GameManager {
    pendingGameId: string | null
    gameMapping: Map<string, Game>

    constructor() {
        this.pendingGameId = null
        this.gameMapping = new Map()
    }


    init(ws: WebSocket, userId: string) {
        const user = new User(userId, ws)
        this.handleEvents(ws, user)
    }

    createGame({ gameId, userId }: { gameId: string, userId: string }, socket: WebSocket) {
        if (gameId) {
            if (this.pendingGameId) {
                const game = this.gameMapping.get(this.pendingGameId)
                if (!game) {

                    return
                }

                game.bUserId = userId

                return
            }

        } else {

        }
    }


    async playerJoin(socket: WebSocket, user: User) {

        if (!this.pendingGameId) {
            const game = new Game()
            game.wUserId = user.userId
            this.gameMapping.set(game.id, game)
            this.pendingGameId = game.id
            SocketManager.getStaticInstance().addUser(user, game.id)
            SocketManager.getStaticInstance().broadCast(game.id, JSON.stringify({ type: "waiting", payload: { status: "waiting" } }))
            return
        }

        const game = this.gameMapping.get(this.pendingGameId);
        if (!game) {
            console.log("pending game don't exist")
            return
        }

        if (game.wUserId === user.userId) {
            console.log("same player trying to act black")
            SocketManager.getStaticInstance().broadCast(game.id, JSON.stringify({ type: "game_alert", payload: { message: "waiting" } }))
            return;
        }

        game.bUserId = user.userId
        SocketManager.getStaticInstance().addUser(user, game.id)
        this.pendingGameId = null
        if (game.bUserId && game.wUserId) {
            const { id, bUserId, wUserId } = game
            const newGame = await prisma.game.create({
                data: {
                    id: game.id,
                    wUserId: game.wUserId,
                    bUserId: game.bUserId,
                    pgn: game.chess.pgn(),
                    status: "IN_PROGRESS"
                }
            })
            SocketManager.getStaticInstance().broadCast(game.id, JSON.stringify({ type: "start", payload: { id, wUserId, bUserId } }))
        }
    }

    async makeMove(socket: WebSocket, user: User, payload: { move: { from: Square, to: Square, promotion?: string }, gameId: string }) {
        const { gameId, move } = payload

        const game = this.gameMapping.get(gameId)
        if (!game) {
            console.log("the given game don't exist")
            return
        }

        await game.makeMove(move, user)
        if (game.result) {
            this.gameMapping.delete(game.id)
            SocketManager.getStaticInstance().clearGame(game.id)
            console.log(this.gameMapping)
        }

    }

    async abort(gameId: string, user: User) {
        const game = this.gameMapping.get(gameId)
        if (!game) {
            user.socket.send(JSON.stringify({ type: "notFound" }))
            return
        }
        if (game.chess.history().length > 2) {
            console.log("Abort is not allowed")
            return
        }

        await prisma.game.update({
            where: { id: gameId },
            data: { result: "ABORT" }
        })
        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({ type: "status", status: "abort" }))
        this.gameMapping.delete(gameId)
        SocketManager.getStaticInstance().clearGame(gameId)

    }

    async resign(gameId: string, user: User) {
        const game = this.gameMapping.get(gameId)
        if (!game) {
            user.socket.send(JSON.stringify({ type: "notFound" }))
            return
        }

        await prisma.game.update({
            where: { id: gameId },
            data: { result: "RESIGNATION" }
        })
        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({ type: "status", status: "gameOver", reason: "resign" }))
        this.gameMapping.delete(gameId)
        SocketManager.getStaticInstance().clearGame(gameId)

    }

    offerDraw(gameId: string, user: User) {
        const game = this.gameMapping.get(gameId)
        if (!game) {
            user.socket.send(JSON.stringify({ type: "notFound" }))
            return
        }
        if (game.drawOffer) {
            return
        }
        game.drawOffer = user.userId
        SocketManager.getStaticInstance().broadcastToOthers(user, gameId, JSON.stringify({
            type: "message", payload: {
                userId: user.userId,
                type: "draw"

            }
        }))
    }

    async acceptDraw(gameId: string, user: User) {
        const game = this.gameMapping.get(gameId)
        if (!game) {
            user.socket.send(JSON.stringify({ type: "notFound" }))
            return
        }
        if (!game.drawOffer) {
            return
        }



        await prisma.game.update({
            where: { id: gameId },
            // TODO:
            // @ts-ignore
            data: { result: "DRAW_BY_AGGREMENT" }
        })
        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({
            type: "message", payload: {
                userId: 'system',
                type: 'system',
                text: 'Draw Accepted!',
            }
        }))
        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({ type: "status", status: "acceptDraw" }))
        this.gameMapping.delete(gameId)
        SocketManager.getStaticInstance().clearGame(gameId)
    }


    async rejectDraw(gameId: string, user: User) {
        const game = this.gameMapping.get(gameId)
        if (!game) {
            user.socket.send(JSON.stringify({ type: "notFound" }))
            return
        }
        game.drawOffer = null

        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({
            type: "message", payload: {
                userId: 'system',
                type: 'system',
                text: 'Draw Rejected!',
            }
        }))
        SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({ type: "status", status: "rejectDraw" }))
        this.gameMapping.delete(gameId)
        SocketManager.getStaticInstance().clearGame(gameId)
    }

    async joinGame(gameId: string, user: User) {
        // check in memory then in DB

        // try {
        let game = this.gameMapping.get(gameId)
        if (!game) {
            // check in the database
            let gameDb = await prisma.game.findUnique({ where: { id: gameId } })
            if (!gameDb || gameDb.result) {
                user.socket.send(JSON.stringify({ type: "notFound" }))
                return
            }
            game = new Game()
            game.id = gameDb.id
            game.wUserId = gameDb.wUserId
            game.bUserId = gameDb.bUserId
            game.chess = new Chess()
            game.chess.loadPgn(gameDb.pgn)
            this.gameMapping.set(gameId, game)
        }

        user.socket.send(JSON.stringify({ type: 'join_game', payload: { game: { id: game.id, wUserId: game.wUserId, bUserId: game.bUserId, pgn: game.chess.pgn() } } }))
        SocketManager.getStaticInstance().addUser(user, gameId)

        // } catch (er) {
        //     user.socket.send(JSON.stringify({ type: "status", status: "notFound" }))
        //     return
        // }


    }

    message(gameId: string, user: User, type: string, text: string) {
        if (type && text) {
            SocketManager.getStaticInstance().broadCast(gameId, JSON.stringify({
                type: "message", payload: {
                    userId: user.userId,
                    type,
                    text,
                }
            }))
        }
    }

    handleEvents(socket: WebSocket, user: User) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString())
            const payload = message.payload

            switch (message.type) {
                case INIT_GAME:
                    this.playerJoin(socket, user)
                    break;
                case MOVE:
                    this.makeMove(socket, user, message.payload)
                    break
                case JOIN_GAME:
                    this.joinGame(payload.gameId, user)

            }

        })


    }


}