import asyncHandler from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import apiReponse from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from "jsonwebtoken";
import uploadFiles from "../utils/cloudinary.js";
import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import ApiError from "../utils/apiError.js";
const generateAccessAndRefreshToken = async (userId) => {
  let user = await User.findById({ _id: userId });

  let accessToken = user.generateAccessToken();
  let refreshToken = user.genrateRefreshToken();

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
const userRegister = asyncHandler(async (req, res) => {
  let { userName, fullName, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let checkUser = await User.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (checkUser) {
    throw new apiError(200, "This User already exist!");
  }

  let createdUser = await User.create({
    userName: userName,
    fullName: fullName,
    email: email,
    password: password,
  });

  if (createdUser) {
    res
      .status(201)
      .json(new apiReponse(201, createdUser, "User created Succesfully"));
  } else {
    throw new apiError(500, "Error during creating user ");
  }
});

const userLogin = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  // Find the user by email
  let userDetails = await User.findOne({ email: email });

  if (!userDetails) {
    throw new apiError(404, "User not found");
  }

  // Check if the password is correct
  let isValid = await userDetails.isCorrectPassword(password);

  if (!isValid) {
    throw new apiError(412, "Incorrect Password");
  }

  // Generate access and refresh tokens

  let token = await generateAccessAndRefreshToken(userDetails._id);

  // Find the user by ID and select fields to exclude
  let updatedUser = await User.findById({ _id: userDetails._id }).select(
    "-password -refreshToken"
  );

  // Cookie options
  let options = {
    httpOnly: true,
    secure: true,
  };

  // Set cookies and send the response
  res
    .status(200)
    .cookie("accessToken", token?.accessToken, options)
    .cookie("refreshToken", token?.refreshToken, options)
    .json(
      new apiReponse(200, {
        accessToken: token?.accessToken,
        data: updatedUser,
      })
    );
});

const userLogout = asyncHandler(async (req, res) => {
  let user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $unset: {
        refreshToken: "",
        accessToken: "",
      },
    },
    {
      new: true,
    }
  );
  let option = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new apiReponse(200, "", "User logout successfully "));
});

const verifyRefreshToken = asyncHandler(async (req, res) => {
  let userRefreshToken = req.body.refreshToken;

  if (!userRefreshToken) {
    throw new apiError(401, "Unauthorized user");
  }

  const decodedToken = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRET_KEY
  );

  const user = await User.findById({ _id: decodedToken._id });

  if (!user) {
    throw new apiError(401, "Invalid refresh token");
  }

  console.log("user.refreshToken", user.refreshToken);
  console.log("userRefreshToken", userRefreshToken);
  if (user.refreshToken.trim() !== userRefreshToken.trim()) {
    throw new apiError(401, "Invalid refresh token");
  }

  const token = await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("refreshToken", token.refreshToken, options)
    .cookie("accessToken", token.accessToken, options)
    .json(new apiReponse(200, "", "Refresh token  updated"));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file.path;

  if (!profileLocalPath) {
    throw new apiError(400, "profileImage field is required");
  }

  const cloudinaryFileLink = await uploadFiles(profileLocalPath);

  if (!cloudinaryFileLink.url) {
    throw new apiError(500, "Error while uploading file on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        profileImage: cloudinaryFileLink.url,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new apiReponse(200, user, "Profile image updated successfully"));
});
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file.path;

  if (!coverLocalPath) {
    throw new apiError(400, "coverImage  field is required");
  }

  const cloudinaryFileLink = await uploadFiles(coverLocalPath);

  if (!cloudinaryFileLink.url) {
    throw new apiError(500, "Error while uploading file on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        coverImage: cloudinaryFileLink.url,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new apiReponse(200, user, "Cover image updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.body);
  const user = await User.findById({ _id: req.user._id });
  console.log(user);
  const verifyOldPassword = await user.isCorrectPassword(oldPassword);
  console.log(verifyOldPassword);
  if (!verifyOldPassword) {
    throw new apiError(200, "Old password is wrong");
  }
  user.password = newPassword;
  let updateUser = await user.save({ validateBeforeSave: false });

  res.status(200).json(new apiReponse(200, "", "Passord updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  let id = req.params.id;

  if (!id) {
    throw new apiError(400, "user id is required");
  }

  console.log(id, "==", req.user?._id);

  let data = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberTo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "chanel",
        as: "subscriber",
      },
    },
    {
      $addFields: {
        mySubscriber: {
          $size: "$subscriber",
        },

        subscribeByYou: {
          $size: "$subscriberTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, "$subscriber.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  let subscriber = await Subscription.find({ subscriber: id });

  res.send({ data });
});

const updatePersonelInformation = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName) {
    res.status.json({
      status: false,
      message: "First name is required ",
    });
  }
  if (!lastName) {
    res.status.json({
      status: false,
      message: "Last name is required ",
    });
  }
  if (!email) {
    res.status.json({
      status: false,
      message: "email is required ",
    });
  }

  const updateData = await User.findByIdAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
    },
    {
      new: true,
    }
  );
  if (!updateData) {
    throw new apiError(200, "Error while updating the record ");
  }
  res
    .status(200)
    .json(new apiReponse(200, updateData, "Record updated successfully"));
});

const updateChannelInformation = asyncHandler(async (req, res) => {
  const { userName, description } = req.body;

  if (!userName || !description) {
    res.status(400).json({
      message: "Feilds are missings",
    });
  }
  const data = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        userName: userName,
        fullName: userName,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!data) {
    throw new ApiError(500, "Error during record updation");
  }

  res
    .status(200)
    .json(new apiReponse(200, data, "Record updated successfully"));
});

export {
  userRegister,
  userLogin,
  userLogout,
  verifyRefreshToken,
  updateProfileImage,
  changePassword,
  updateCoverImage,
  getUserProfile,
  updatePersonelInformation,
  updateChannelInformation
};
