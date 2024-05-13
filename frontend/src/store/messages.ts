import { atom } from "recoil";

export type Message = { type: string, userId: string, text?: string }

const messageState = atom<Message[]>({
    key: 'messageState ', // unique ID (with respect to other atoms/selectors)
    default: [], // default value (aka initial value)
});

export default messageState 