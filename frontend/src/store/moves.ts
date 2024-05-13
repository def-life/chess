import { Square } from "chess.js";
import { atom } from "recoil";

type Move = {
    from: Square,
    to: Square,
    promotion?: string
}

export type Moves = Move[]

const moves = atom<Moves>({
    key: 'movesState ', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)
});

export default moves 