import express from "express"
import auth from "../middlewares/auth.middleware.js";
import { subscribeChanel, unSubscribeChannel } from "../controllers/subscription.controller.js";
import upload from "../middlewares/multer.middleware.js";
const router =express.Router();





router.route("/subscribe-chanel").post(auth,upload.none(),subscribeChanel)
router.route("/unsubscribe-chanel").post(auth,upload.none(),unSubscribeChannel)

export default router