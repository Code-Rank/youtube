import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import {
  deleteCommentById,
  getAllComment,
  getCommentsByVIdeo,
  saveComment,
} from "../controllers/comment.controller.js";
const router = express.Router();

const commentData = () => [
  body("comment").notEmpty().withMessage("Comment field is required"),
  body("video_id").notEmpty().withMessage("Video Id is required field"),
];
router
  .route("/save-comment")
  .post(upload.none(), commentData(), auth, saveComment);
router
  .route("/video-comment/:video_id")
  .get(upload.none(), auth, getCommentsByVIdeo);
router
  .route("/delete-comment/:comment_id")
  .get(upload.none(), auth, deleteCommentById);
router.route("/get-all-comment").get(upload.none(), auth, getAllComment);

export default router;
