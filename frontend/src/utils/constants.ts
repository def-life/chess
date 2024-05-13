// Chess Move Event Flags
export const NON_CAPTURE = "n";
export const PAWN_PUSH_TWO_SQUARES = "b";
export const EN_PASSANT_CAPTURE = "e";
export const STANDARD_CAPTURE = "c";
export const PROMOTION = "p";
export const CAPTURE_PROMOTION = "cp";
export const NON_CAPTURE_PROMOTION = "np";
export const KING_SIDE_CASTLING = "k";
export const QUEEN_SIDE_CASTLING = "q";



export const GAME_OVER_REASONS = {
    checkmate: "CHECKMATE",
    stalemate: "STALEMATE",
    resignation: "RESIGNATION",
    timeout: "TIMEOUT",
    fiftyMoveRule: "DRAW_BY_FIFTY_MOVE_RULE",
    insufficientMaterial: "DRAW_BY_INSUFFICIENT_MATERIAL",
    threefoldRepetition: "DRAW_BY_THREEFOLD_REPETITION",
    drawByAgreement: "DRAW_BY_AGREEMENT",
    abort: "ABORT"
};

