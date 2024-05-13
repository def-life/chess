import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    userId?: string,
    refreshToken?: string
}

export const authenticateByCookie = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { ck_refresh_token: refreshToken } = req.cookies
    if (!refreshToken) {
        return res.status(400).json({ message: "unauthorized" })
    }
    try {

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string)
        if (!decodedToken || typeof decodedToken !== "object") {
            throw new Error()
        }
        req.userId = decodedToken.userId
        req.refreshToken = refreshToken
        next()

    } catch (er) {
        return res.status(401).json({ message: "invalid access token" })
    }

};
