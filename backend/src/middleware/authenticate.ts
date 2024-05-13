import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token format

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
        if (!decodedToken || typeof decodedToken !== "object") {
            throw new Error()
        }
        req.userId = decodedToken.userId
        next()


    } catch (er) {
        return res.status(401).json({ message: "invalid access token" })
    }

};
