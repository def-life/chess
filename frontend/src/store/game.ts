import { atom } from "recoil";

export type Game = { id: string | null, opponentUserId: string | null, opponentColor: string | null, opponentName: string | null, opponentPicture: string | null }

const gameState = atom<Game>({
    key: 'gameState ', // unique ID (with respect to other atoms/selectors)
    default: {
        id: null,
        opponentColor: null,
        opponentUserId: null,
        opponentName: null,
        opponentPicture: null
    },
});

export default gameState 