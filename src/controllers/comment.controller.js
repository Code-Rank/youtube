import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiReponse from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

const saveComment = asyncHandler(async (req, res) => {
  const { comment, video_id } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const commentResult = await Comment.create({
    comment: comment,
    videoId: video_id,
    userId: req.user._id,
  });
  if (!commentResult) {
    throw ApiError(500, "womthing is wrong while storing data ");
  }

  res
    .status(200)
    .json(new apiReponse(200, commentResult, "Comment saved successfuly"));
});

const getCommentsByVIdeo = asyncHandler(async (req, res) => {
  const videoId = req.params.video_id;
  console.log(videoId);
  const commentResult = await Comment.aggregate([
    {
      $match: {
        videoId: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        "user.accessToken": 0,
        "user.refreshToken": 0,
        "user.password": 0,
        "user.watchHistory": 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (!commentResult) {
    throw ApiError(404, "Someting wenst wrong while fetching comments");
  }

  if (commentResult.length === 0) {
    res
      .status(200)
      .json(new apiReponse(200, commentResult, "Comment not exist "));
  } else {
    res
      .status(200)
      .json(new apiReponse(200, commentResult, "All comment of this video"));
  }
});

const deleteCommentById = asyncHandler(async (req, res) => {
  const comemntId = req.params.comment_id;

  const findComment = await Comment.findById({
    _id: comemntId,
  });

  if (!findComment) {
    throw new ApiError(404, "Comment not found ");
  }

  if (findComment.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  const commentDeleted = await Comment.findByIdAndDelete({
    _id: comemntId,
  });

  if (!commentDeleted) {
    throw new ApiError(500, "Error while deleting comment from DB .");
  }

  res
    .status(200)
    .json(new apiReponse(200, commentDeleted, "Comment deleted Successfully"));
});
const getAllComment = asyncHandler(async (req, res) => {
  const commentData = await Comment.find();

  if (!commentData) {
    throw ApiError(500, "Getting error while fetching comments from db.");
  }

  res.status(200).json(new apiReponse(200, commentData, "All comments  list."));
});

export { saveComment, getCommentsByVIdeo, deleteCommentById, getAllComment };
