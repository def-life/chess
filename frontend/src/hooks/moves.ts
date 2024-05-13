import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import movesState from "../store/moves";

export function useMoves() {
    return useRecoilState(movesState)

}

export function useSetMoves() {
    return useSetRecoilState(movesState)

}


export function useMovesValue() {
    return useRecoilValue(movesState)
}

