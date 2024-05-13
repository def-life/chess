import { useEffect, useState } from "react"
import axiosInstance from "../utils/network";
import { useSetAccessToken } from "../hooks/accessToken";
import { useUser } from "../hooks/user";
import Loader from "./Loader";

function SignInComponent() {
    const [loading, setLoading] = useState(false)
    const setAccessToken = useSetAccessToken()
    const [user, setUser] = useUser()

    async function handleCredentialResponse(response: { credential: string }) {
        setLoading(true)

        console.log("Encoded JWT ID token: " + response.credential);
        try {

            const res = await axiosInstance.post("v1/login", { googleJWT: response.credential })
            // token
            const { accessToken, userId } = res.data;
            setAccessToken(accessToken);
            setUser({ ...user, userId })
            console.log(accessToken, userId, "imp")

        } catch (er) {
            console.log(er)
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        console.log("id client", import.meta.env)

        // TODO: solve ts-ignore issues
        // @ts-ignore

        google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

        // @ts-ignore
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "medium", shape: "pill" }  // customization attributes
        );

        // // @ts-ignore
        // google.accounts.id.prompt(); // also display the One Tap dialog


    }, [])

    // TODO: show a loader

    return (
        <>
            {!loading ? !user.loggedIn && < div id="buttonDiv"></div > : <Loader />}

        </>
    )
}

export default SignInComponent


// show loader