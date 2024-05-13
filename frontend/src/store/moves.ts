import { atom } from "recoil";

export type Moves = string[]

const moves = atom<Moves>({
    key: 'movesState ', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)
});

export default moves 