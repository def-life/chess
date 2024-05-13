import { googleJWTSchema } from "../schemas/auth";
import { OAuth2Client } from "google-auth-library";
import type { Response, Request } from "express";
import jwt from "jsonwebtoken"
import prisma from "../db";

const client = new OAuth2Client();

async function verify(token: string) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return payload
}

async function issueAccessToken(refreshToken: string): Promise<{ status: false, msg: string } | { status: true, data: { token: string, expiresIn: number, userId: string } }> {

    // await new Promise((resolve) => setTimeout(resolve, 4 * 1000))
    const decodedRF = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "")
    if (!decodedRF) {
        return { status: false, msg: "Invalid refresh token" }
    }
    if (typeof decodedRF !== "object") return { status: false, msg: "Invalid refresh token" }
    if (!decodedRF.userId) return { status: false, msg: "Invalid refresh token" }
    const user = await prisma.user.findUnique({
        where: {
            id: decodedRF.userId
        }
    })
    if (!user) {
        return { status: false, msg: "User doesnot exist for refresh token" }
    }

    const expiresIn = 500


    return { status: true, data: { token: jwt.sign({ userId: decodedRF.userId }, process.env.ACCESS_TOKEN_SECRET || ""), expiresIn, userId: user.id } }


}


export async function logInUser(req: Request, res: Response) {

    const result = googleJWTSchema.safeParse(req.body)
    if (!result.success) {
        res.status(403).json({ message: "Missing or invalid Id Token" })
        return
    }

    try {
        const payload = await verify(result.data.googleJWT)
        if (!payload) {
            return res.status(400).json({ message: "unauthorized" })
        }

        // add to the database

        // access_token and refresh token as a cookie
        const { sub, email, name, picture } = payload
        if (!(sub && email && name && picture)) {
            return res.status(400).json({ message: "unauthorized" })
        }

        let user = await prisma.user.findUnique({ where: { email: payload.email } })
        if (!user) {
            user = await prisma.user.create({ data: { email, name, picture, socialId: sub, signInPlatform: "google" } })
        }

        if (!user) {
            return res.status(500).json({ message: "something went wrong" })
        }

        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET || "", {
            expiresIn: "7d"
        })
        const response = await issueAccessToken(refreshToken)
        if (response.status === false) {
            return res.status(400).json({ message: "Something went wrong" })
        }
        res.cookie("ck_refresh_token", refreshToken, { maxAge: 604800000, httpOnly: true })

        return res.status(200).json({ accessToken: response.data.token, userId: response.data.userId, expiresIn: response.data.expiresIn })


    } catch (er) {
        console.log(er)
        return res.status(500).json({ message: 'Something went wrong!' });
    }

}

export async function logOutUser(req: Request, res: Response) {
    res.cookie('ck_refresh_token', '', { maxAge: 1, httpOnly: true });
    return res.status(200).json({ message: "successfully logged out" });
}

export function validToken(token: string) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)

    } catch (er) {
        return false
    }
}

export function extractUserId(token: string) {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { userId: string }
    return decoded.userId

}


export async function sendIssueToken(req: Request & { refreshToken?: string }, res: Response) {
    if (!req.refreshToken) {
        return res.status(400).json({ message: "unauthorized" })
    }
    const response = await issueAccessToken(req.refreshToken)

    if (!response.status) {
        return res.status(400).json({ message: response.msg })
    }

    return res.status(200).json({ accessToken: response.data.token, userId: response.data.userId, expiresIn: response.data.expiresIn })
}

// authenticate middleware
// userId -> user
// issueAccessToken
