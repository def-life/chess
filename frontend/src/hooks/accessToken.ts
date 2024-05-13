import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import accessTokenState from "../store/accesstoken";

export function useAccessToken() {
    return useRecoilState(accessTokenState)

}

export function useSetAccessToken() {
    return useSetRecoilState(accessTokenState)

}


export function useAccessTokenValue() {
    return useRecoilValue(accessTokenState)
}

