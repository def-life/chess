import Layout from "../components/layout"
import Board from "../chessboard/board"
import Moves from "../components/Moves"
import Navbar from "../components/navbar"

function Page() {
    return (
        <div className="relative">
            <Navbar />
            <Layout>
                <div className="col-span-4">

                    <Board staticBoard={false} isMultiPlayer={false} isWhitePlayer={true} />
                </div>
                <div className="col-span-2 border-2">

                    <Moves />
                </div>

            </Layout>
        </div>
    )
}

export default Page