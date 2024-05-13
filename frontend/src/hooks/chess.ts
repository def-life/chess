import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import chessState from "../store/chess";

export function useChess() {
    return useRecoilState(chessState)

}

export function useSetChess() {
    return useSetRecoilState(chessState)

}


export function useChessValue() {
    return useRecoilValue(chessState)
}

