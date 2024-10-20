
import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.route.js"
import playlistRouter from "./routes/playlist.route.js"
import cors from "cors"
import bodyParser from "body-parser";
import multer from "multer";
const app = express();

app.use(bodyParser.urlencoded({extended: true }))
app.use(bodyParser.json())

app.use(express.static("public"))
app.use(cookieParser())
app.use(cors("*"))

// Middleware to log request details
/*  app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Method: ${req.method}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    next();
}); */ 

// Initialize Multer middleware
/* const upload = multer(); */

app.use("/api/v1/user", userRouter);
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/file",videoRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/playlist",playlistRouter)

export { app };
