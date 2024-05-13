import { Link } from "react-router-dom"
import { useUserValue } from "../hooks/user"
import Avatar from "./avatar"
import SignInComponent from "./signinComponent"

function Navbar() {
    const user = useUserValue()
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <Link to="/" className="text-white text-lg font-semibold">Play Chess</Link>
                </div>
                <div>
                    {!user.loggedIn ? <SignInComponent /> : <Avatar />}
                </div>
            </div>
        </nav>

    )
}

export default Navbar