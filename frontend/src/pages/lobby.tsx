import { useEffect, useState } from "react";
import { useSocketValue } from "../hooks/socket";
import { useGame } from "../hooks/game";
import { useUserValue } from "../hooks/user";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import Board from "../chessboard/board";

export const INIT_GAME = "init_game"



type Message = { type: "waiting", payload: {} } | { type: "start", payload: { id: string, wUserId: string, bUserId: string } }

function Lobby() {
    const socketState = useSocketValue()
    const [gameState, setGameState] = useGame()
    const [showWaiting, setShowWaiting] = useState(false)
    const user = useUserValue()
    const navigate = useNavigate()


    function play() {
        console.log("clicked")
        const socket = socketState.socket
        if (!socket || !socketState.isConnected) {
            return
        }

        socket.send(JSON.stringify({ type: INIT_GAME }))
    }


    function handleLobbyMessages(message: Message) {
        const payload = message.payload

        switch (message.type) {
            case "waiting": {
                console.log("waiting")
                setShowWaiting(true)
                break;
            }
            case "start": {
                console.log("received succesfully")
                const { id, wUserId, bUserId } = payload as { id: string, wUserId: string, bUserId: string }
                const opponentUserId = user.userId === wUserId ? bUserId : wUserId
                const opponentColor = user.userId === wUserId ? "w" : "b"
                setGameState({ ...gameState, id, opponentColor, opponentUserId })
                setShowWaiting(false)
                navigate(`/game/${id}`)
                break
            }
            default: {
                console.log('default case')

            }
        }

    }

    useEffect(() => {
        const socket = socketState.socket
        if (socket) {
            socket.onmessage = (event) => {
                console.log('yes', event)
                const message = JSON.parse(event.data)
                handleLobbyMessages(message)
            }

        }


    }, [socketState.socket])


    return (
        <>
            <Layout>
                <div className="col-span-4">
                    <Board staticBoard={true} isMultiPlayer={false} isWhitePlayer={true} />
                </div>
                <div className="col-span-2">
                    <p>{showWaiting && "waiting..."}</p>
                    <div onClick={play}>Join a RandomGame</div>
                </div>

            </Layout>


        </>
    )
}

export default Lobby;