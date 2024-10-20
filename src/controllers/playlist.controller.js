import { validationResult } from "express-validator";
import PlayList from "../models/playlist.model.js";
import ApiError from "../utils/apiError.js";
import apiReponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const playlistResult = await PlayList.create({
    title: title,
    description: description,
    userId: req.user._id,
  });

  if (!playlistResult) {
    throw new ApiError(400, "Error while creating playlist");
  }

  res
    .status(200)
    .json(
      new apiReponse(200, playlistResult, "Playlist created Successfully!")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlist_id;
  console.log(playlistId);

  const deleteRecord = await PlayList.deleteOne({
    _id: playlistId,
    userId: req.user._id,
  });
  if (!deleteRecord) {
    throw new ApiError(400, "Error while deleting record");
  }

  if (deleteRecord.deletedCount === 1) {
    res
      .status(200)
      .json(new apiReponse(200, deleteRecord, "Record deleted Successfully"));
  } else {
    res.status(200).json(new apiReponse(200, deleteRecord, "Record not found"));
  }
});

const getAllPlayList = asyncHandler(async (req, res) => {
  const userId = req.params.user_id;
  console.log(userId);

  const playlistRecord = await PlayList.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId), // Match the playlist by userId
      },
    },
    {
      $unwind: {
        path: "$videoId",
        preserveNullAndEmptyArrays: true, // Keep playlists with empty videoId array
      },
    },
    {
      // Convert videoId from string to ObjectId to match _id in videos collection, but only if videoId is not null
      $addFields: {
        videoId: {
          $cond: {
            if: { $ne: ["$videoId", null] }, // Check if videoId is not null
            then: { $toObjectId: "$videoId" }, // Convert to ObjectId if present
            else: null, // Keep as null if no videoId
          },
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId", // Use the converted ObjectId for matching
        foreignField: "_id", // Match with the _id in videos collection
        as: "video",
      },
    },
    {
      $unwind: {
        path: "$video",
        preserveNullAndEmptyArrays: true, // Allow videos to be empty if no match
      },
    },
    {
      $group: {
        _id: "$_id", // Group back the playlist by playlist ID
        title: { $first: "$title" },
        description: { $first: "$description" },
        videoIds: { $push: "$videoId" }, // Push all videoIds back into an array
        videos: { $push: "$video" }, // Collect all videos into an array, even if empty
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $addFields: {
        videoCount: {
          $size: "$videos",
        },
      },
    },
  ]);

  res.send(playlistRecord);
});
const playlistDetail = asyncHandler(async (req, res) => {
  const { user_id, playlist_id } = req.params;

  const playlistRecord = await PlayList.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(user_id),
        _id: new mongoose.Types.ObjectId(playlist_id), // Match the playlist by userId
      },
    },

    {
      $unwind: {
        path: "$videoId",
        preserveNullAndEmptyArrays: true, // Keep playlists with empty videoId array
      },
    },
    {
      // Convert videoId from string to ObjectId to match _id in videos collection, but only if videoId is not null
      $addFields: {
        videoId: {
          $cond: {
            if: { $ne: ["$videoId", null] }, // Check if videoId is not null
            then: { $toObjectId: "$videoId" }, // Convert to ObjectId if present
            else: null, // Keep as null if no videoId
          },
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId", // Use the converted ObjectId for matching
        foreignField: "_id", // Match with the _id in videos collection
        as: "video",
      },
    },
    {
      $unwind: {
        path: "$video",
        preserveNullAndEmptyArrays: true, // Allow videos to be empty if no match
      },
    },
    {
      $group: {
        _id: "$_id", // Group back the playlist by playlist ID
        title: { $first: "$title" },
        userId: { $first: "$userId" },
        description: { $first: "$description" },
        videoIds: { $push: "$videoId" }, // Push all videoIds back into an array
        videos: { $push: "$video" }, // Collect all videos into an array, even if empty
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $addFields: {
        videoCount: {
          $size: "$videos",
        },
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
      $lookup: {
        from: "subscriptions",
        localField: "userId",
        foreignField: "chanel",
        as: "subscriber",
      },
    },
    {
      $addFields: {
        totalSubscriber: {
          $size: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: 0,
      },
    },
  ]);

  res.send(playlistRecord);
});

export { createPlaylist, deletePlaylist, getAllPlayList, playlistDetail };
