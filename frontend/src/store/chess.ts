import { Chess } from "chess.js";
import { atom } from "recoil";


const chessState = atom<Chess>({
    key: 'chessState ', // unique ID (with respect to other atoms/selectors)
    default: new Chess(), // default value (aka initial value)
});

export default chessState 