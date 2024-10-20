import express from "express";
import upload from "../middlewares/multer.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import {
  allVideos,
  deleteVideo,
  editVideo,
  myVideos,
  uploadVideo,
  videoDetail,
} from "../controllers/video.controller.js";
const router = express.Router();

router.route("/upload-video").post(
  auth,
  upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnail_image", maxCount: 1 },
  ]),
  uploadVideo
);
router.route("/channel-videos/:channel_id").get(auth, upload.none(), myVideos);
router.route("/edit-video").post(
  auth,
  upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnail_image", maxCount:1 },
  ]),
  editVideo
);
router.route('/get-all-videos').get(upload.none(), allVideos);
router.route('/video-detail/:id').get(auth,upload.none(),videoDetail)
router.route("/delete-video/:id").get(upload.none(),auth,deleteVideo);
export default router;
