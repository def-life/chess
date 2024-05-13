import type { Chess, Square, Piece } from "chess.js";

export type DragPieceInfo = { from: Square, piece: Piece }

export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

export const allKeys: Square[] = Array.prototype.concat(...files.map((f) => {
    return ranks.map((r) => "".concat(f, r))
}))

export const posToKey = (pos: [number, number]): Square => allKeys[(8 * pos[0]) + pos[1]]

export const mapPosToKey = ({ pos: { x, y }, rect, isWhitePlayer }: { pos: { x: number, y: number }, rect: DOMRect, isWhitePlayer: boolean }) => {
    let file = Math.floor(((x - rect.left) / rect.width) * 8)
    if (!isWhitePlayer) {
        file = 7 - file
    }

    let rank = 7 - Math.floor(((y - rect.top) / rect.height) * 8)
    if (!isWhitePlayer) {
        rank = 7 - rank
    }


    return (file >= 0 && rank >= 0 && file <= 7 && rank <= 7) ? posToKey([file, rank]) : null

}

// TODO: handle types here

export const getEventPosition = (e: any) => {
    console.log(e)
    if (e.clientX || e.clientX === 0) {
        return [e.clientX, e.clientY];
    }
    if (e.targetTouches?.[0]) {
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    }
    return; // touchend has no position!
};

export function boardProperties(chess: Chess) {
    const squares = []


    for (let rank of ranks.slice().reverse()) {
        for (let file of files) {
            const square = ''.concat(file, rank)
            const isLight = ((file.charCodeAt(0) + Number(rank)) % 2) == 0
            const piece = chess.get(square as Square)

            squares.push({
                id: square as Square,
                isLight,
                piece: piece ? piece : null
            })
        }
    }
    return squares


}