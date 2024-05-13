import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import socketState from "../store/socket";

export function useSocket() {
    return useRecoilState(socketState)

}

export function useSetSocket() {
    return useSetRecoilState(socketState)

}


export function useSocketValue() {
    return useRecoilValue(socketState)
}

