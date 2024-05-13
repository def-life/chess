require('dotenv').config()
import express, { Request, Response, NextFunction } from "express";
import cors from "cors"
import router from "./router";
import cookieParser from "cookie-parser"
import { WebSocketServer } from "ws";
import { extractUserId, validToken } from "./controller/auth";
import { GameManager } from "./socket/GameManager";
import { Chess } from "chess.js";

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

app.use("/", router)

app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// webSocketServer

const wss = new WebSocketServer({ noServer: true });
function onSocketError(err: Error) {
    console.error(err);
}



server.on('upgrade', function upgrade(req, socket, head) {
    socket.on('error', onSocketError);

    // for advance use case refer https://github.com/covalence-io/ws-auth/blob/main/sockets/index.ts
    let path = "/socket"

    if (!req.url) {
        socket.destroy()
        return;
    }

    const url = new URL(req.url, `ws://${req.headers.host}`);
    const token = url.searchParams.get("token")

    if (token && validToken(token) && url.pathname === path) {
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketError);
            wss.emit('connection', ws, req);
        });
        return
    }

    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();

});


const gameManager = new GameManager()


wss.on('connection', function connection(ws, req) {
    ws.on('error', console.error);
    console.log("connection established succesfully")

    const url = new URL(req.url as string, `ws://${req.headers.host}`);
    const userId = extractUserId(url.searchParams.get("token") as string)
    gameManager.init(ws, userId)
});


/**
 * 2 solutions to try to work with chess instance with recoil for 
 * use moves array for creating new instance
 * use chess.pgn() if it doesn't mutate the instance(low chances )
 */
