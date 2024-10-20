import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path:"./.env"
});

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Project is running on this port : ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`DataBase error `);
  });
