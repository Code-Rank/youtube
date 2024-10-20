import { promises as fs } from "fs";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadFiles = async (file) => {

  try {
    if (!file) {
      return false;
    }

    let response = await cloudinary.v2.uploader.upload(file, {
      resource_type: "auto",
    });

    try {
      await fs.unlink(file);
    } catch (unlinkError) {
      console.log("Error deleting file:", unlinkError);
    }
    return response;
  } catch (error) {
    console.log("Error during upload:", error);

    try {
      await fs.unlink(file);
    } catch (unlinkError) {
      console.log("Error deleting file:", unlinkError);
    }

    return false;
  }
};

export default uploadFiles;
