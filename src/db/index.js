import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";
const DB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const connectResult = await mongoose.connect(`${DB_URI}/${DB_NAME}`);

    console.log(`Database connected on host :${connectResult.connection.host}`);
  } catch (error) {
    console.log(`${DB_URI}/${DB_NAME}`);
    console.log(`Database connection error : ${error}`);
  }
};

export default connectDB;
