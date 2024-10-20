import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/apiError.js";
import uploadFiles from "../utils/cloudinary.js";
import apiReponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
  const { video_file, thumbnail_image } = req.files;
  const { title, description } = req.body;

  if (!video_file || !thumbnail_image) {
    throw new ApiError(400, "Video or thumbnail image missing");
  }
  const uplaodVideo = await uploadFiles(video_file[0].path);
  const thumbNail = await uploadFiles(thumbnail_image[0].path);

  try {
    const newVideo = await Video.create({
      video_file: uplaodVideo.url,
      video_thumbnail: thumbNail.url,
      title,
      description,
      duration: uplaodVideo.duration ?? "",
      owner: req.user._id,
      is_published: true,
    });

    res
      .status(200)
      .json(new ApiResponse(200, newVideo, "Video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});
const editVideo = asyncHandler(async (req, res) => {
  const { video_id, title, description } = req.body;
  const { video_thumbnail, video_file } = req.files;

  if (!video_id) {
    throw ApiError(404, "Event if is required to update event");
  }

  let updatedFieldObject = {};
  if (title) updatedFieldObject.title = title;
  if (description) updatedFieldObject.description = description;
  if (video_thumbnail) {
    const uploadedVideo = await uploadFiles(video_thumbnail[0].path);
    updatedFieldObject.video_thumbnail = uploadedVideo.url;
  }
  if (video_file) {
    const uploadedVideo = await uploadFiles(video_file[0].path);
    updatedFieldObject.video_file = uploadedVideo.url;
  }

  const response = await Video.findByIdAndUpdate(
    { _id: video_id },
    { $set: updatedFieldObject }
  );
});
const myVideos = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  const channel_id=req.params.channel_id
  const userVideos = await Video.find({
    owner: channel_id,
  }).sort({ createdAt: 1 });

  const userDetail=await User.findById({
    _id:channel_id
  }).select("-password -accessToken  -refreshToken -watchHistory")
  if (!userVideos) {
    throw new ApiError(404, "Videos not found");
  }

  res.status(200).json(new apiReponse(200, {videos:userVideos,user:userDetail}, "Video list"));
});

const allVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided
  const skip = (page - 1) * pageSize;

  // Fetch paginated video data
  const videoData = await Video.aggregate([
    {
      $lookup: {
        from: "users", // The name of the User collection in MongoDB
        localField: "owner", // Field in Video collection
        foreignField: "_id", // Field in User collection
        as: "user", // Output array field name
      },
    },

    {
      $unwind: "$user",
    },

    { $skip: skip },

    { $limit: pageSize },

    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        url: 1,
        createdAt: 1,
        description: 1,
        duration: 1,
        is_published: 1,
        updatedAt: 1,
        video_file: 1,
        video_thumbnail: 1,
        view: 1,
        "user.userName": 1,
        "user.email": 1,
        "user.profileImage": 1,
        "user._id": 1,
      },
    },
  ]);

  console.log(videoData);

  // Fetch the total number of records

  const totalRecord = await Video.countDocuments();

  // Handle case where no video data is found
  if (!videoData || videoData.length === 0) {
    throw new ApiError(404, "Data not found");
  }

  // Return the response with paginated data
  res.status(200).json(
    new apiReponse(
      200,
      {
        list: videoData,
        totalRecord: totalRecord,
        page: page,
        pageSize: pageSize,
      },
      "All videos"
    )
  );
});

const videoDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const videoDetailData = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              accessToken: 0, // Exclude the accessToken field
              refreshToken: 0, // Exclude the refreshToken field
              password: 0, // Exclude the password field
            },
          },
        ],
      },
    },
    {
      $unwind: "$user",
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "user._id",
        foreignField: "chanel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id", // Match video _id in the comments collection
        foreignField: "videoId", // Assuming "videoId" is the field in the comments collection
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "userId", // Now you're inside the "comments" context, so reference "userId"
              foreignField: "_id",
              as: "user", // Alias for user details
            },
          },
          {
            $unwind: "$user", // Unwind to get the actual user object instead of an array
          },
          {
            $project: {
              "user.accessToken": 0, // Exclude the accessToken field
              "user.refreshToken": 0, // Exclude the refreshToken field
              "user.password": 0,
              "user.watchHistory": 0,
            },
          },
          {
            $addFields: {
              user: "$user", // Attach the user details to the comment object
            },
          },
          {
            $sort: {
              createdAt: -1, // Sort comments by createdAt (latest first)
            },
          },
        ],
      },
    },


    {
      $project: {
        videoDetails: "$$ROOT",

        // Includes all video details
      },
    },
  ]);

  if (videoDetailData.length === 0) {
    throw ApiError(404, "Video not found ");
  }

  res.status(200).json(new apiReponse(200, videoDetailData[0], "Video detail"));
});
const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
console.log(req.params)
  // Find the video by its ID and owner (the user making the request)
  const video = await Video.findOneAndDelete({
    _id: id,
    owner: req.user._id, // Ensure the video belongs to the current user
  });

  if (!video) {
    // If no video is found, return a 404 error
    throw new ApiError(404,"Video not found or unauthorized")
  }

  // If video is found and deleted, send a success message
  res.status(200).json(
    new ApiResponse(200,video,"Video deleted successfully")
  );
});

export { uploadVideo, myVideos, editVideo, allVideos, videoDetail ,deleteVideo};
