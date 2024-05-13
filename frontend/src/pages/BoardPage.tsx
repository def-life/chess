import Layout from "../components/layout"
import Board from "../chessboard/board"
import Moves from "../components/Moves"
import Navbar from "../components/navbar"
import { useChessValue } from "../hooks/chess"
import { useEffect, useState } from "react"
import { Chess } from "chess.js"
import { useMovesValue } from "../hooks/moves"
import GameEnd from "../components/GameEnd"
import { GAME_OVER_REASONS } from "../utils/constants"

function Page() {
    const moves = useMovesValue()
    const chess = useChessValue()
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
    return (
        <div className="relative">
            <Navbar />
            <Layout>
                <div className="col-span-4">

                    <Board staticBoard={false} isMultiPlayer={false} isWhitePlayer={true} />
                </div>
                <div className="col-span-2 border-2 mt-4 max-w-[500px] m-auto max-h-[300px] overflow-auto">

                    <Moves />
                </div>

            </Layout>
            {gameOver && <GameEnd onClick={() => { setGameOver("") }} reason={gameOver} isWhitePlayer={true} />}
        </div>
    )
}

export default Page