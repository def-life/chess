
import { Chess, Move, PieceSymbol, Square } from "chess.js"
import { useEffect, useRef, useState } from "react"
import { captureAudio, castleAudio, gameStartAudio, moveCheckAudio, moveSelfAudio, promoteAudio } from "../utils/audio"
import { DragPieceInfo, boardProperties, disableScroll, enableScroll, getEventPosition, mapPosToKey } from "../utils/chessHelper"
import SquareComponent from "./Square"
import { CAPTURE_PROMOTION, EN_PASSANT_CAPTURE, KING_SIDE_CASTLING, NON_CAPTURE_PROMOTION, QUEEN_SIDE_CASTLING, STANDARD_CAPTURE } from "../utils/constants"
import PawnPromotionDialogue from "./PawnPromotionDialogue"
import Notation from "./Notation"
import { useSocketValue } from "../hooks/socket"
import { useMoves } from "../hooks/moves"
import { useGame } from "../hooks/game"
import { useUserValue } from "../hooks/user"
import { useChess } from "../hooks/chess"

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
    const [isWhitePlayer, setIsWhitePlayer] = useState(white);
    // const [chess, setChess] = useState<null | Chess>(null)
    const [moves, setMoves] = useMoves()
    const [chess, setChess] = useChess()
    const [board, setBoard] = useState<null | ReturnType<typeof boardProperties>>(null)
    const socketState = useSocketValue()
    const [showPawnPromotionDialogue, setShowPawnPromotionDialogue] = useState(false)
    const [promotionMove, setPromotionMove] = useState<{ from: Square, to: Square } | null>(null)
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const [message, setMessage] = useState('')
    const [, setGame] = useGame()
    const user = useUserValue()


    console.log(chess.ascii())




    useEffect(() => {
        if (chess) {
            const board = boardProperties(chess)
            setBoard(isWhitePlayer ? board : board.reverse())
            return
        }
        // const _chess = new Chess()
        // setChess(_chess)
        const board = boardProperties(chess)
        setBoard(isWhitePlayer ? board : board.reverse())
        gameStartAudio.play()
    }, [isWhitePlayer, chess])


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
                        const game = payload.game;
                        const newChess = new Chess()
                        newChess.loadPgn(game.pgn)
                        const isWhite = user.userId === game.wUserId
                        setChess(newChess)
                        setGame({ ...game, opponentUserId: user.userId === game.wUserId ? game.bUserId : game.wUserId })
                        setIsWhitePlayer(isWhite ? true : false)
                        setBoard(isWhite ? boardProperties(newChess) : boardProperties(newChess).reverse())
                        break

                    case "game_alert":
                        setMessage(payload.message)
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

        const newChess = new Chess(chess.fen())
        const piece = newChess.get(from)
        if (piece.type !== "p") return false
        if (piece.color !== chess.turn()) return false;
        if (!["1", "8"].some((num) => to.endsWith(num))) {
            return false
        }

        return newChess.moves({ square: from, verbose: true }).map((move) => move.to).includes(to)
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
        const newChess = new Chess(chess.fen())

        const allPossibleSquares = newChess.moves({ square: square, verbose: true }).map((_square) => {
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
        if (!chess) return;
        const move: { from: Square, to: Square, promotion?: PieceSymbol } = { from, to }

        if (promotion) {
            move.promotion = promotion
        }

        let moveInfo: Move | null = null
        const newChess = new Chess()
        for (let move of moves) {
            newChess.move(move)
        }


        try {
            moveInfo = newChess.move(move)
            if (isMultiPlayer && !isRemote) {
                socketState.socket && socketState.socket.send(JSON.stringify({ type: "move", payload: { move, gameId } }))
            }

            if (move.promotion) {
                setMoves([...moves, { from: move.from, to: move.to, promotion: move.promotion }])
            } else {
                setMoves([...moves, { from: move.from, to: move.to }])
            }


        } catch (er) {
            return
        }

        setChess(newChess)
        setBoard(isWhitePlayer ? boardProperties(newChess) : boardProperties(newChess).reverse())

        console.log('set the board')
        if (moveInfo) {
            removeHighlightedSquares()
            removeLastMoveHighlight()
            addLastMoveHighlight({ from: move.from, to: move.to })

            const in_check = newChess.isCheck()


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
        if (window.scrollY !== 0 || window.scrollX !== 0) {
            window.scrollTo(0, 0);
        }
        disableScroll()


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

            enableScroll()

            draggedPieceClone.remove()
            draggedPiece?.classList.remove("hidden");

            [...document.querySelectorAll(".inner-border-highlight")].forEach((el) => {
                el.classList.remove("inner-border-highlight")
            })

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
        <div>{message ? message : (<div className="relative overscroll-none min-w-[300px] min-h-[300px] w-[100%] h-[100%]  max-w-[400px] max-h-[400px]  aspect-square  m-auto ">
            <div ref={chessBoardRef} className="flex flex-wrap w-[calc(100%_-_20px)] h-[calc(100%_-_20px)]  min-w-[calc(300px_-_20px)] min-h-[calc(300px_-_20px)]  max-w-[calc(400px-_20px)] max-h-[calc(400px_-_20px)]  absolute top-0 right-0">
                {board && board.map((square) => {
                    return <SquareComponent onMouseDown={handleDrag} key={square.id} {...square} />
                })}
                {chess && showPawnPromotionDialogue && <PawnPromotionDialogue onClick={handlePawnPromotionPieceSelection} isWhitePlayer={chess.turn()} />}

            </div>
            <Notation isWhitePlayer={isWhitePlayer} />
        </div>)}

        </div>
    )
}

export default Board