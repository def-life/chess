import type { Response, Request } from "express";
import prisma from "../db";

export async function user(req: Request, res: Response) {
    const userId = req.params.userId
    if (!userId) {
        return res.status(404).json({ message: "missing query param" })
    }


    const user = await prisma.user.findUnique({ where: { id: userId as string }, select: { id: true, email: true, name: true, picture: true } })
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    res.json({ user })
}