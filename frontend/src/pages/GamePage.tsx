import { useParams } from "react-router-dom";
import { useGameValue } from "../hooks/game";
import Board from "../chessboard/board";
import { useSocketValue } from "../hooks/socket";
import { useUserValue } from "../hooks/user";

function GamePage() {
    const { gameId } = useParams();
    const user = useUserValue()
    const socketState = useSocketValue()
    const game = useGameValue()
    if (!gameId) {
        return "NO such game"
    }

    if (!socketState.isConnected) {
        return "Connecting..."
    }

    const isWhitePlayer = game.opponentColor === "b" ? true : false
    return (
        <div>
            <div className="flex items-center space-x-2 justify-center m-4">
                <img src={(isWhitePlayer ? game.opponentPicture : user.picture) ?? ""} alt="User Image" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{isWhitePlayer ? game.opponentName : user.name}</span>
            </div>

            <Board staticBoard={false} isWhitePlayer={isWhitePlayer} isMultiPlayer={true} gameId={gameId} />
            <div className="flex items-center space-x-2 justify-center m-4">
                <img src={(isWhitePlayer ? user.picture : game.opponentPicture) ?? ""} alt="User Image" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{isWhitePlayer ? user.name : game.opponentName}</span>
            </div>
        </div>
    )
}

export default GamePage