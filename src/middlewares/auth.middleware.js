import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const auth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");


  if (!token) {
    throw new apiError(400, "Unauthorizeed user");
  }
  let userDecodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);


  let userInfo = await User.findById({ _id: userDecodedData._id });

  if (!userInfo) {
    throw new apiError(404, "User not found");
  }

  req.user = userInfo;

  next();
});

export default auth;
