import { Link } from "react-router-dom"
import { useUserValue } from "../hooks/user"
import AvatarWithLogout from "./avatar"
import SignInComponent from "./signinComponent"

function Navbar() {
    const user = useUserValue()
    return (
        <nav className="bg-gray-800 p-4 h-[80px] flex items-center">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <Link to="/" className="text-white text-2xl font-semibold">Play Chess</Link>
                </div>
                <div>
                    {!user.loggedIn ? <SignInComponent /> : <AvatarWithLogout />}
                </div>
            </div>
        </nav>

    )
}

export default Navbar