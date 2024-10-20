import express from "express";
import upload from "../middlewares/multer.middleware.js";
import {
  createPlaylist,
  deletePlaylist,
  getAllPlayList,
  playlistDetail,
} from "../controllers/playlist.controller.js";
import { body } from "express-validator";
import auth from "../middlewares/auth.middleware.js";
const router = express.Router();

const validateCreatePlayListData = () => {
  return [
    body("title").notEmpty().withMessage("Title is required field"),
    body("description").notEmpty().withMessage("Description is required field"),
  ];
};
router
  .route("/create-playlist")
  .post(upload.none(), auth, validateCreatePlayListData(), createPlaylist);
router
  .route("/delete-playlist/:playlist_id")
  .get(upload.none(), auth, deletePlaylist);
router
  .route("/get-all-playlists/:user_id")
  .get( auth, getAllPlayList);
router
  .route("/playlist-detail/:user_id/:playlist_id")
  .get( auth, playlistDetail);

export default router;
