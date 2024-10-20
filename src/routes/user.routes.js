import { Router } from "express";

import {
  userRegister,
  userLogin,
  userLogout,
  verifyRefreshToken,
  updateProfileImage,
  changePassword,
  updateCoverImage,
  getUserProfile,
  updatePersonelInformation,
  updateChannelInformation,
} from "../controllers/user.controller.js";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

const validateRegister = () => [
  body("userName").notEmpty().withMessage("Username is required"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
const validateLogin = () => [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.route("/register").post(upload.none(), validateRegister(), userRegister);
router.route("/login").post(upload.none(), validateLogin(), userLogin);
router.route("/logout").post(upload.none(), auth, userLogout);
router.route("/refresh-token").post(upload.none(), auth, verifyRefreshToken);
router
  .route("/update-profile-image")
  .post(auth, upload.single("profileImage"), updateProfileImage);
router
  .route("/update-cover-image")
  .post(auth, upload.single("coverImage"), updateCoverImage);
router.route("/update-password").post(upload.none(), auth, changePassword);
router.route("/user-profile/:id").get(auth,getUserProfile);
router.route("/update-personel-information").post(upload.none(),auth,updatePersonelInformation);
router.route("/update-channel-information").post(upload.none(),auth,updateChannelInformation);





export default router;
