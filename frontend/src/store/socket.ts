import { atom } from "recoil";

export type Socket = { socket: WebSocket | null, isConnected: boolean }

const socketState = atom<Socket>({
    key: 'socketState ', // unique ID (with respect to other atoms/selectors)
    default: {
        socket: null,
        isConnected: false
    }, // default value (aka initial value)
});

export default socketState 