const properties = [
    { x: "1", y: "6.0625", white: 8, black: 1 },
    { x: "1", y: "18.1875", white: 7, black: 2 },
    { x: "1", y: "30.3125", white: 6, black: 3 },
    { x: "1", y: "42.4375", white: 5, black: 4 },
    { x: "1", y: "54.5625", white: 4, black: 5 },
    { x: "1", y: "66.6875", white: 3, black: 6 },
    { x: "1", y: "78.8125", white: 2, black: 7 },
    { x: "1", y: "90.9375", white: 1, black: 8 },
    { x: "9.0625", y: "99.5", white: "a", black: "h" },
    { x: "21.1875", y: "99.5", white: "b", black: "g" },
    { x: "33.3125", y: "99.5", white: "c", black: "f" },
    { x: "45.4375", y: "99.5", white: "d", black: "e" },
    { x: "57.5625", y: "99.5", white: "e", black: "d" },
    { x: "69.6875", y: "99.5", white: "f", black: "c" },
    { x: "81.8125", y: "99.5", white: "g", black: "b" },
    { x: "93.9375", y: "99.5", white: "h", black: "a" },
];

type NotationProps = {
    isWhitePlayer: boolean
}


function Notation(props: NotationProps) {
    const { isWhitePlayer } = props
    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 text-[2.5px]">
            {properties.map((property, i) => <text key={i} x={property.x} y={property.y}>{isWhitePlayer ? property.white : property.black}</text>)}
        </svg>
    )
}

export default Notation