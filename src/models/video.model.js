import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    video_file: {
      type: String,
      required: true,
    },
    video_thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
    },
    view: {
      type: Number,
    },
    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate)
const Video = mongoose.model("Video", videoSchema);
export default Video;
