import { useParams } from "react-router-dom";
import { useGameValue } from "../hooks/game";
import Board from "../chessboard/board";
import { useSocketValue } from "../hooks/socket";
import { useUserValue } from "../hooks/user";
import { GAME_OVER_REASONS } from "../utils/constants";
import { useEffect, useState } from "react";
import { useChessValue } from "../hooks/chess";
import { Chess } from "chess.js";
import { useMovesValue } from "../hooks/moves";
import GameEnd from "../components/GameEnd";
import Navbar from "../components/navbar";

function GamePage() {
    const { gameId } = useParams();
    const user = useUserValue()
    const socketState = useSocketValue()
    const game = useGameValue()
    const chess = useChessValue()
    const moves = useMovesValue()

    const [gameOver, setGameOver] = useState("")


    useEffect(() => {
        const newChess = new Chess()
        for (let move of moves) {
            newChess.move(move)
        }

        if (!newChess.isGameOver()) { return }

        if (newChess.isDraw()) {
            console.log("inside isdraw")
            if (newChess.isInsufficientMaterial()) {
                setGameOver(GAME_OVER_REASONS.insufficientMaterial)
            } else {
                setGameOver(GAME_OVER_REASONS.fiftyMoveRule)
            }
        } else if (newChess.isStalemate()) {
            console.log("inside isstatelmeate")
            setGameOver(GAME_OVER_REASONS.stalemate)
        } else if (newChess.isThreefoldRepetition()) {
            console.log("inside three fold")
            setGameOver(GAME_OVER_REASONS.threefoldRepetition)
        }

        else {
            console.log('inside checkmate')
            setGameOver(GAME_OVER_REASONS.checkmate)

        }


    }, [chess])

    if (!gameId) {
        return "NO such game"
    }

    if (!socketState.isConnected) {
        return "Connecting..."
    }

    const isWhitePlayer = game.opponentColor === "b" ? true : false
    return (
        <div>
            <Navbar />
            {game.opponentUserId && <div className="flex items-center space-x-2 justify-center m-4">
                <img referrerPolicy="no-referrer" src={(isWhitePlayer ? game.opponentPicture : user.picture) ?? ""} alt="User Image" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{isWhitePlayer ? game.opponentName : user.name}</span>
            </div>}

            {<Board staticBoard={false} isWhitePlayer={isWhitePlayer} isMultiPlayer={true} gameId={gameId} />}
            {game.opponentUserId && <div className="flex items-center space-x-2 justify-center m-4">
                <img referrerPolicy="no-referrer" src={(isWhitePlayer ? user.picture : game.opponentPicture) ?? ""} alt="User Image" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{isWhitePlayer ? user.name : game.opponentName}</span>
            </div>}
            {gameOver && <GameEnd onClick={() => { setGameOver("") }} reason={gameOver} isWhitePlayer={true} />}
        </div>
    )
}

export default GamePage