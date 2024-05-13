import { atom } from "recoil";

export type AccessToken = string | null

const accessTokenState = atom<AccessToken>({
    key: 'accessTokenState ', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
});

export default accessTokenState 