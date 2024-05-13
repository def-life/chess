import React from "react";
import { DragPieceInfo, boardProperties } from "../utils/chessHelper";

// const lightColor = "#eae9d2"
// const darkColor = "#4b7399"



function SquareComponent(props: ReturnType<typeof boardProperties>[number] & { onMouseDown: (draggedpieceInfo: DragPieceInfo, ev: React.MouseEvent | React.TouchEvent) => void }) {
    const { isLight, piece, id, onMouseDown } = props
    return (
        <div id={id} className={`${isLight ? "bg-[#eae9d2]" : "bg-[#4b7399]"} w-[12.5%]  h-[12.5%] square relative flex items-center justify-center`}>
            {piece && <img id={`${id}-${piece.color}${piece.type}`} onTouchStart={(ev) => {
                onMouseDown({ from: id, piece: piece }, ev)
            }} onMouseDown={(ev) => { onMouseDown({ from: id, piece: piece }, ev) }} className={`h-full w-full select-none piece z-50 cursor-grab piece-${piece.color}`} src={`/images/pieces/${piece.color}${piece.type}.png`} />}
        </div>
    )
}

export default SquareComponent