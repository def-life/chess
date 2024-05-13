export const INIT_GAME = "init_game"
export const MOVE = "move"
export const JOIN_GAME = "join_game"


export const DRAW_BY_THREEFOLD_REPETITION = "DRAW_BY_THREEFOLD_REPETITION"
export const DRAW_BY_FIFTY_MOVE_RULE = "DRAW_BY_FIFTY_MOVE_RULE"
export const DRAW_BY_INSUFFICIENT_MATERIAL = "DRAW_BY_INSUFFICIENT_MATERIAL"
export const STALEMATE = "STALEMATE"
export const CHECKMATE = "CHECKMATE"
export const RESIGNATION = "RESIGNATION"
export const TIMEOUT = "TIMEOUT"
export const ABORT = "ABORT"

export type ResultType = typeof DRAW_BY_THREEFOLD_REPETITION | typeof DRAW_BY_FIFTY_MOVE_RULE | typeof DRAW_BY_INSUFFICIENT_MATERIAL | typeof STALEMATE | typeof CHECKMATE | typeof RESIGNATION | typeof TIMEOUT | typeof ABORT 