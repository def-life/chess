import { useUser } from "../hooks/user"
import axiosInstance from "../utils/network"

function UserAvatar() {
    return <svg className="fill-white w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" /></svg>


}

function AvatarWithLogout() {
    const [user, setUser] = useUser()

    async function logout() {
        try {
            await axiosInstance.delete("/v1/login");
            setUser({ email: null, loggedIn: false, name: null, picture: null, userId: null })
        } catch (er) {
            console.log(er)
        }
    }

    return (
        <div className="flex items-center">
            {user.picture ? <img referrerPolicy="no-referrer" src={user.picture} alt="Avatar" className="w-10 h-10 rounded-full" /> : <UserAvatar />}
            <div className="ml-3 text-gray-400 text-base">
                <p >{user.name}</p>
                <p className="cursor-pointer" onClick={logout}>LogOut</p>
            </div>
        </div>

    )
}

export default AvatarWithLogout