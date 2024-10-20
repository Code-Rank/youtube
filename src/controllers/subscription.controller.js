import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiReponse from "../utils/ApiResponse.js";
const subscribeChanel = asyncHandler(async (req, res) => {
  const chanelId = req.body.chanelId;

  const subscription = await Subscription.insertMany({
    subscriber: req.user._id,
    chanel: chanelId,
  });

  if (!subscription) {
    throw new ApiError(501, "Error during creating subscription");
  }

  res
    .status(200)
    .json(
      new apiReponse(200, {}, "You have subscribe the cannel successfully ")
    );
});

const unSubscribeChannel = asyncHandler(async (req, res) => {
  let { channelId } = req.body;

  if (!channelId) {
    throw new ApiError(499, "Channel id is required Field");
  }

  let deleteRecord = await Subscription.deleteOne({
    subscriber: req.user._id,
    chanel: new mongoose.Types.ObjectId(channelId),
  });

  if (!deleteRecord) {
    throw new ApiError(500, "Error during unsubscribe the cannel ");
  }

  res
    .status(200)
    .json(
      new apiReponse(200, { deleteRecord }, "Channel unsubscribe successfully")
    );
});



export { subscribeChanel, unSubscribeChannel };
