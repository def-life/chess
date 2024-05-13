import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import gameState from "../store/game";

export function useGame() {
    return useRecoilState(gameState)

}

export function useSetGame() {
    return useSetRecoilState(gameState)

}


export function useGameValue() {
    return useRecoilValue(gameState)
}

