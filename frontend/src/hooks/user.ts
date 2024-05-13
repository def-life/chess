import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import userState from "../store/user";

export function useUser() {
    return useRecoilState(userState)
}

export function useSetUser() {
    return useSetRecoilState(userState)

}


export function useUserValue() {
    return useRecoilValue(userState)

}

