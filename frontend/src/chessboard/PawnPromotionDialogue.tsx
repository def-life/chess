import { PieceSymbol } from "chess.js";

const promotionPieces: PieceSymbol[] = ["q", "r", "b", "n"];

type PawnPromotionDialogueProps = {
    isWhitePlayer: "w" | "b",
    onClick: (piece: PieceSymbol) => void
}

function PawnPromotionDialogue(props: PawnPromotionDialogueProps) {
    const { isWhitePlayer, onClick } = props
    const color = isWhitePlayer
    return (
        <div style={{ width: "calc(50% + 42px)" }} className="absolute z-50 rounded-xl flex bg-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2  h-[12.5%] ">
            {promotionPieces.map((piece) => {
                return <img key={piece} onClick={() => onClick(piece)} className="h-full hover:bg-[#a5c9ca] grow-0 w-1/4 select-none" src={`/images/pieces/${color}${piece}.png`} />
            })}
            <div className="bg-[#395b64] w-[22px] h-full rounded-r-lg flex justify-center items-center"><img className="w-[70%]" src={`/icons/close-icon-${color == "b" ? "w" : "b"}.svg`} /></div>
        </div>
    )
}

export default PawnPromotionDialogue