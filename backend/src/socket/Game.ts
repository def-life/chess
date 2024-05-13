import { Chess, Square } from "chess.js"
import { v4 as uuidv4 } from 'uuid';
import { SocketManager } from "./SocketManager";
import { User } from "./User";
import { ABORT, CHECKMATE, DRAW_BY_FIFTY_MOVE_RULE, DRAW_BY_INSUFFICIENT_MATERIAL, DRAW_BY_THREEFOLD_REPETITION, ResultType, STALEMATE } from "./event";
import prisma from "../db";

export class Game {
    id: string
    wUserId: string | null
    bUserId: string | null
    chess: Chess
    result: ResultType | null
    drawOffer: string | null

    constructor() {
        this.id = uuidv4()
        this.wUserId = null
        this.bUserId = null
        this.chess = new Chess()
        this.result = null
        this.drawOffer = null
    }

    async makeMove(move: { from: Square, to: Square, promotion?: string }, user: User) {
        if (this.result) {
            console.log('Move not possible, game over long ago')
            return;
        }
        try {
            await prisma.game.update({ where: { id: this.id }, data: { pgn: this.chess.pgn() } })
            console.log("updated db")
            this.chess.move(move)
            SocketManager.getStaticInstance().broadcastToOthers(user, this.id, JSON.stringify({
                type: "move", payload: {
                    move
                }
            }))

            if (this.chess.isGameOver()) {
                let reason: ResultType;
                if (this.chess.isDraw()) {
                    if (this.chess.isInsufficientMaterial()) {
                        reason = DRAW_BY_INSUFFICIENT_MATERIAL
                    } else if (this.chess.isStalemate()) {
                        reason = STALEMATE
                    } else if (this.chess.isThreefoldRepetition()) {
                        reason = DRAW_BY_THREEFOLD_REPETITION
                    } else {
                        reason = DRAW_BY_FIFTY_MOVE_RULE
                    }
                } else {
                    reason = CHECKMATE

                }
                await prisma.game.update({ where: { id: this.id }, data: { result: reason } })
                this.result = reason
                SocketManager.getStaticInstance().broadCast(this.id, JSON.stringify({
                    type: "game_over", payload: {
                        reason
                    }
                }))

            }

        } catch (er) {
            console.log(er)
            console.log("invalid move")
        }
    }

    abort() {
        this.result = ABORT
    }

}