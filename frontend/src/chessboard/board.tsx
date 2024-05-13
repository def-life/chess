
import { Chess, Move, PieceSymbol, Square } from "chess.js"
import { useEffect, useRef, useState } from "react"
import { captureAudio, castleAudio, gameStartAudio, moveCheckAudio, moveSelfAudio, promoteAudio } from "../utils/audio"
import { DragPieceInfo, boardProperties, getEventPosition, mapPosToKey } from "../utils/chessHelper"
import SquareComponent from "./Square"
import { CAPTURE_PROMOTION, EN_PASSANT_CAPTURE, KING_SIDE_CASTLING, NON_CAPTURE_PROMOTION, QUEEN_SIDE_CASTLING, STANDARD_CAPTURE } from "../utils/constants"
import PawnPromotionDialogue from "./PawnPromotionDialogue"
import Notation from "./Notation"
import { useSocketValue } from "../hooks/socket"
import { useSetMoves } from "../hooks/moves"
import GameEnd from "../components/GameEnd"
import { useGame } from "../hooks/game"
import { useUserValue } from "../hooks/user"

// TODO: do something about scroll/ loading when on mobile using chessboard
// make prevent default behaviour on image


type BoardProps = {
    isWhitePlayer: boolean,
    isMultiPlayer: boolean,
    gameId?: string,
    staticBoard: boolean
}



function Board(props: BoardProps) {

    const { isWhitePlayer: white, isMultiPlayer, gameId, staticBoard } = props
    const setMoves = useSetMoves()
    const [isWhitePlayer, setIsWhitePlayer] = useState(white);
    const [chess, setChess] = useState<null | Chess>(null)
    const [board, setBoard] = useState<null | ReturnType<typeof boardProperties>>(null)
    const socketState = useSocketValue()
    const [showPawnPromotionDialogue, setShowPawnPromotionDialogue] = useState(false)
    const [promotionMove, setPromotionMove] = useState<{ from: Square, to: Square } | null>(null)
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const [gameOver, setGameOver] = useState(false)
    const [reason] = useState("")
    const [message, setMessage] = useState('')
    const [, setGame] = useGame()
    const user = useUserValue()





    useEffect(() => {
        if (chess) {
            const board = boardProperties(chess)
            setBoard(isWhitePlayer ? board : board.reverse())
            return
        }
        const _chess = new Chess()
        setChess(_chess)
        const board = boardProperties(_chess)
        setBoard(isWhitePlayer ? board : board.reverse())
        gameStartAudio.play()
    }, [isWhitePlayer])

    console.log(chess?.ascii())


    useEffect(() => {
        if (chess && chess.isGameOver()) {
            setGameOver(true)
        }
    }, [chess])

    useEffect(() => {
        if (gameId && socketState.socket) {
            socketState.socket.send(JSON.stringify({ type: "join_game", payload: { gameId } }))
        }
    }, [])

    useEffect(() => {
        const socket = socketState.socket;
        if (socket && isMultiPlayer) {
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data)
                const payload = message.payload
                switch (message.type) {
                    case "move":
                        makeMove(payload.move, true)
                        break;
                    case "notFound":
                        setMessage("Game Not found")
                        break;

                    case "join_game":
                        console.log('received', payload.game)
                        const game = payload.game;
                        const newChess = new Chess()
                        newChess.loadPgn(game.pgn)
                        const isWhite = user.userId === game.wUserId
                        setChess(newChess)
                        setGame({ ...game, opponentUserId: user.userId === game.wUserId ? game.bUserId : game.wUserId })
                        setIsWhitePlayer(isWhite ? true : false)
                        setBoard(isWhite ? boardProperties(newChess) : boardProperties(newChess).reverse())
                        break

                }
            }
        }

    }, [socketState.socket, chess])


    if (message) {
        return <p>{message}</p>
    }

    function isPromotion({ from, to }: { from: Square, to: Square }) {
        if (!chess) {
            return
        }
        const piece = chess.get(from)
        if (piece.type !== "p") return false
        if (piece.color !== chess.turn()) return false;
        if (!["1", "8"].some((num) => to.endsWith(num))) {
            return false
        }

        return chess.moves({ square: from, verbose: true }).map((move) => move.to).includes(to)
    }

    function removeHighlightedSquares() {

        [...document.querySelectorAll('.valid-square-to-move'), ...document.querySelectorAll(".valid-square-to-move-capture")]
            .map((element) => {
                element.classList.remove("valid-square-to-move")
                element.classList.remove("valid-square-to-move-capture")
            })
    }




    function showPossibleMoves({ square }: { square: Square }) {
        if (!chess) {
            return;
        }

        removeHighlightedSquares()

        const allPossibleSquares = chess.moves({ square: square, verbose: true }).map((_square) => {
            return { to: _square.to, flags: _square.flags }
        })



        allPossibleSquares.forEach((_square) => {
            const ele = document.getElementById(_square.to)
            if (!ele) { return }
            ele.classList.add(
                ['c', 'cp'].includes(_square.flags) ? "valid-square-to-move-capture" : "valid-square-to-move"
            )
        })

    }

    function handlePawnPromotionPieceSelection(piece: PieceSymbol) {
        if (!promotionMove) {
            return
        }
        const { from, to } = promotionMove

        const move = { from, to, promotion: piece }

        makeMove(move)
        setShowPawnPromotionDialogue(false)
        setPromotionMove(null)
    }

    function addLastMoveHighlight({ from, to }: { from: Square, to: Square }) {
        [document.getElementById(from), document.getElementById(to)].forEach((el) => {
            if (!el) return
            el.classList.add("highlight-last-move")
        })
    }

    function removeLastMoveHighlight() {
        [...document.querySelectorAll(".highlight-last-move")].forEach((el) => {
            el.classList.remove("highlight-last-move")
        })
    }

    function makeMove({ from, to, promotion }: { from: Square, to: Square, promotion?: PieceSymbol }, isRemote?: boolean) {
        console.log(from, to)
        if (!chess) return;
        const move: { from: Square, to: Square, promotion?: PieceSymbol } = { from, to }

        if (promotion) {
            move.promotion = promotion
        }

        let moveInfo: Move | null = null

        try {
            moveInfo = chess.move(move)
            if (isMultiPlayer && !isRemote) {
                socketState.socket && socketState.socket.send(JSON.stringify({ type: "move", payload: { move, gameId } }))
            }
            setMoves((moves) => {
                return [...moves, move.to]
            })

        } catch (er) {
            return
        }

        const newChess = new Chess()
        newChess.loadPgn(chess.pgn())
        setChess(newChess)
        setBoard(isWhitePlayer ? boardProperties(newChess) : boardProperties(newChess).reverse())

        if (moveInfo) {
            removeHighlightedSquares()
            removeLastMoveHighlight()
            addLastMoveHighlight({ from: move.from, to: move.to })

            const in_check = chess.isCheck()


            switch (moveInfo.flags) {
                case STANDARD_CAPTURE:
                    in_check ? moveCheckAudio.play() : captureAudio.play()
                    break;
                case KING_SIDE_CASTLING:
                    in_check ? moveCheckAudio.play() : castleAudio.play()
                    break;
                case QUEEN_SIDE_CASTLING:
                    in_check ? moveCheckAudio.play() : castleAudio.play()
                    break;
                case NON_CAPTURE_PROMOTION:
                    in_check ? moveCheckAudio.play() : promoteAudio.play()
                    break;

                case CAPTURE_PROMOTION:
                    in_check ? moveCheckAudio.play() : promoteAudio.play()
                    break;

                case EN_PASSANT_CAPTURE:
                    in_check ? moveCheckAudio.play() : captureAudio.play()
                    break;
                default:
                    in_check ? moveCheckAudio.play() : moveSelfAudio.play()





            }
        }










    }

    function handleDrag({ from }: DragPieceInfo, ev: React.MouseEvent | React.TouchEvent) {
        ev.preventDefault();
        if (staticBoard) return;
        // @ts-ignore
        let lastTouchPosition: [number, number] | null = getEventPosition(ev)
        if (!chess) {
            return
        }


        // @ts-ignore
        const draggedPiece = document.getElementById(ev.target.id)
        if (!draggedPiece) {
            return
        }
        const isWhiteDraggedPiece = draggedPiece.classList.contains("piece-w")
        if (isMultiPlayer && (isWhitePlayer && !isWhiteDraggedPiece) || (!isWhitePlayer && isWhiteDraggedPiece)) {
            return
        }

        if (!chessBoardRef.current) return;


        showPossibleMoves({ square: from })


        const boardDomRect = chessBoardRef.current.getBoundingClientRect()
        const left = boardDomRect.left
        const top = boardDomRect.top
        const right = boardDomRect.right
        const bottom = boardDomRect.bottom
        const width = boardDomRect.width
        const height = boardDomRect.height


        const draggedPieceClone = draggedPiece.cloneNode() as HTMLImageElement
        draggedPiece.classList.add("hidden");

        draggedPieceClone.classList.add('absolute')
        draggedPieceClone.classList.add('z-50')
        draggedPieceClone.style.width = `${width / 8}px`
        draggedPieceClone.style.height = `${height / 8}px`



        document.body.appendChild(draggedPieceClone)



        function moveAT({ clientX, clientY }: { clientX: number, clientY: number }) {
            let calculatedX = clientX
            let calculatedY = clientY

            if ((calculatedX < left)) {
                calculatedX = left
            }
            if ((calculatedX > right)) {
                calculatedX = right
            }

            if (calculatedY < top) {
                calculatedY = top
            }

            if (calculatedY > bottom) {
                calculatedY = bottom
            }


            draggedPieceClone.style.left = `${calculatedX - (draggedPieceClone.offsetWidth / 2)}px`
            draggedPieceClone.style.top = `${calculatedY - (draggedPieceClone.offsetHeight / 2)}px`

        }

        // @ts-ignore
        const [clientX, clientY] = getEventPosition(ev)

        moveAT({ clientX: clientX, clientY: clientY })
        let lastHighlightedSquareId: Square | null = null

        function addOrRemoveHighlightedSquare({ clientX, clientY }: { clientX: number, clientY: number }) {
            const squareId = mapPosToKey({ pos: { x: clientX, y: clientY }, isWhitePlayer, rect: boardDomRect })
            if (!squareId) {
                return
            }
            const ele = document.getElementById(squareId)
            if (!ele) return

            if (ele.firstElementChild && ele.firstElementChild.classList.contains(`${isWhitePlayer ? "piece-w" : "piece-b"}`)) {
                return
            }

            if (lastHighlightedSquareId && lastHighlightedSquareId !== squareId) {
                document.querySelectorAll(".inner-border-highlight").forEach((highlightedEle) => {
                    highlightedEle.classList.remove("inner-border-highlight");
                })
            }

            if (ele) {
                ele.classList.add("inner-border-highlight")
                lastHighlightedSquareId = squareId
            }

        }

        function handleMove(ev: Event) {

            // @ts-ignore
            const [clientX, clientY] = getEventPosition(ev)

            lastTouchPosition = [clientX, clientY]

            moveAT({ clientX: clientX, clientY: clientY })
            addOrRemoveHighlightedSquare({ clientX: clientX, clientY: clientY })
        }

        function handleMoveEnd(ev: Event) {
            document.removeEventListener("mousemove", handleMove)
            document.removeEventListener("mouseup", handleMoveEnd)
            document.removeEventListener("touchmove", handleMove)
            document.removeEventListener("touchend", handleMoveEnd)

            draggedPieceClone.remove()
            draggedPiece?.classList.remove("hidden");

            [...document.querySelectorAll(".inner-border-highlight")].forEach((el) => {
                el.classList.remove("inner-border-highlight")
            })

            // @ts-ignore
            console.log(getEventPosition(ev), lastTouchPosition)
            // @ts-ignore
            const [clientX, clientY] = getEventPosition(ev) || lastTouchPosition
            const to = mapPosToKey({ pos: { x: clientX, y: clientY }, isWhitePlayer, rect: boardDomRect })
            if (!to || !from) return

            const isPromotionMove = isPromotion({ from, to })
            if (isPromotionMove) {
                // show promotion diaglog, select promotion piece and make move

                // makeMove through dialog box
                // for testig
                setShowPawnPromotionDialogue(true)
                setPromotionMove({ from, to })
                return


            }
            makeMove({ from, to })
            removeHighlightedSquares()



        }



        document.addEventListener("mousemove", handleMove)
        document.addEventListener("touchmove", handleMove)
        document.addEventListener('mouseup', handleMoveEnd)
        document.addEventListener('touchend', handleMoveEnd)









    }




    return (
        <div>

            <div className="relative w-[316px] h-[310px] sm:w-[400px] aspect-square sm:h-[400px] m-auto">
                <div ref={chessBoardRef} className="flex flex-wrap w-[300px] h-[300px] sm:w-96 sm:h-96  absolute top-0 right-0">
                    {board && board.map((square) => {
                        return <SquareComponent onMouseDown={handleDrag} key={square.id} {...square} />
                    })}
                    {chess && showPawnPromotionDialogue && <PawnPromotionDialogue onClick={handlePawnPromotionPieceSelection} isWhitePlayer={chess.turn()} />}

                </div>
                <Notation isWhitePlayer={isWhitePlayer} />
            </div>
            {gameOver && chess && <GameEnd chess={chess} onClick={() => { setGameOver(false) }} reason={reason} isWhitePlayer={isWhitePlayer} />}
        </div>
    )
}

export default Board