import mongoose from "mongoose";

const playListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    videoId:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const PlayList = mongoose.model("PlayList", playListSchema);
export default PlayList;
