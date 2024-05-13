import express from "express"
import { logInUser, sendIssueToken } from "./controller/auth"
import { logOutUser } from "./controller/auth"
import { authenticate } from "./middleware/authenticate";
import { authenticateByCookie } from "./middleware/authenticateByCookie";
import { user } from "./controller/user";
const router = express.Router()


router.get('/', (req, res) => {
    res.send('Hello from Express!');
});


router.route("/v1/login")
    .post(logInUser)
    .delete(authenticate, logOutUser)

router.route("/v1/access-token").get(authenticateByCookie, sendIssueToken)

router.route("/v1/user/:userId").get(authenticate, user)

export default router