import { useMovesValue } from "../hooks/moves"

function Moves() {
    const moves = useMovesValue()
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        pairs.push(moves.slice(i, i + 2));
    }
    return (
        <div className="">
            {pairs.map((pair, index) => (
                <div key={index}>
                    <div className="flex flex-row gap-4 justify-left p-2">
                        <div className="px-4 py-1 text-white bg-blue-600 rounded-lg">{index + 1}.</div>
                        {pair.map((move, moveIndex) => (
                            <div key={moveIndex} className="px-6 py-1 bg-gray-200 rounded-lg mr-2">
                                {move.to}
                            </div>
                        ))}
                    </div>
                </div>

            ))}
        </div>
    )
}

export default Moves