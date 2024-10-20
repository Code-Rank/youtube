import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
},{timestamps:true});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
