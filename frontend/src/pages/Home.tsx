import { Link, useNavigate } from "react-router-dom"
import { useUserValue } from "../hooks/user"
import Navbar from "../components/navbar"

function Home() {
    const user = useUserValue()
    const navigate = useNavigate()

    const handleClick = () => {
        if (!user.loggedIn) {
            return
        }
        navigate("/lobby")
    }


    return (
        <div>
            <Navbar />
            <div style={{ height: "calc(100vh - 80px)" }} className="flex flex-col md:flex-row justify-center items-center">
                <Link to={"/board"} className="mb-2 md:mb-0 md:mr-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                    Load a chessboard
                </Link>
                {< button onClick={handleClick} className={` ${user.loggedIn ? "bg-green-500 hover:bg-green-600" : "bg-green-200"}  text-white font-semibold py-2 px-4 rounded`} >
                    SignIn for Multiplayer
                </button>}
            </div>

        </div >
    )
}

export default Home