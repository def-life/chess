import { atom } from "recoil";

export type User = {
    name: string | null,
    email: string | null,
    picture: string | null,
    userId: string | null,
    loggedIn: boolean
}

const userState = atom<User>({
    key: 'userState', // unique ID (with respect to other atoms/selectors)
    default: {
        name: null,
        email: null,
        picture: null,
        userId: null,
        loggedIn: false
    }, // default value (aka initial value)
});

export default userState 