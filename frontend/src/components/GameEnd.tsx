import { Chess } from "chess.js"
import { GAME_OVER_REASONS } from "../utils/constants"
import { useUserValue } from "../hooks/user"
import { useChessValue } from "../hooks/chess"


type GameEndProps = {
    reason: string,
    isWhitePlayer: boolean,
    onClick: () => void,
}

function GameEnd(props: GameEndProps,) {
    const { reason, isWhitePlayer, onClick } = props
    const chess = useChessValue()
    const user = useUserValue()


    const getResult = (reason: string) => {
        switch (reason) {
            case GAME_OVER_REASONS.checkmate:
                return "Checkmate";
            case GAME_OVER_REASONS.stalemate:
                return "Stalemate";
            case GAME_OVER_REASONS.resignation:
                return "Resignation";
            case GAME_OVER_REASONS.timeout:
                return "Timeout";
            case GAME_OVER_REASONS.fiftyMoveRule:
                return "Fifty Move Rule";
            case GAME_OVER_REASONS.insufficientMaterial:
                return "Insufficient Material";
            case GAME_OVER_REASONS.threefoldRepetition:
                return "Threefold Repetition";
            case GAME_OVER_REASONS.drawByAgreement:
                return "Agreement";
            case GAME_OVER_REASONS.abort:
                return "Abort"
            default:
                return "Error";
        }
    };


    const getGameEndResult = (reason: string) => {
        const isDraw = [GAME_OVER_REASONS.drawByAgreement, GAME_OVER_REASONS.fiftyMoveRule, GAME_OVER_REASONS.insufficientMaterial, GAME_OVER_REASONS.threefoldRepetition, GAME_OVER_REASONS.stalemate].includes(reason)

        const winner = new Chess(chess.fen()).turn() === "b" ? "White" : "Black"
        const title = isDraw
            ? "DRAW"
            : isWhitePlayer && winner === "White"
                ? "WIN"
                : "LOSS";

        const result = getResult(reason)

        const message = isDraw ? `Draw by ${result}` : `${winner} won by ${result}`;

        return { title, message }
    }



    // const result = getGameEndResult(reason === "" ? getReason() : reason)
    const result = getGameEndResult(reason)


    return (
        <div className="shadow-lg absolute left-1/2 top-1/2 z-50 bg-white min-w-72 max-w-80  -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden">
            <div className="relative cursor-pointer">
                <img onClick={onClick} className="h-6 w-6 absolute left-5 top-5" src="/icons/close-icon-w.svg" />
            </div>
            <div className="h-44 bg-[#359B9B] text-white flex justify-center items-center text-3xl">
                <h2>{result.title}</h2>
            </div>
            <div className="flex justify-center -mt-12 ">
                <img className="rounded-full h-24 w-24" src={user.picture ?? "/images/avatar/default.jpg"} />
            </div>
            <div className="text-center py-5">
                <p>{result.message}</p>
            </div>

        </div>
    )
}

export default GameEnd;