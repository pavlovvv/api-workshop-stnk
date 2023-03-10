import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import authRoutes from "./routes/auth-routes.js";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error-middleware.js";

const app = express();
app.use(cookieParser());

dotenv.config();

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.cattalk.net",
      "https://stnkcc-fwfd4elwiq-uc.a.run.app",
    ],
    credentials: true,
  })
);

app.use("/auth", authRoutes);

app.use(errorMiddleware);

const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;

mongoose
  .set("strictQuery", false)
  .connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`)
  .then((res) => console.log("Connected to DB"))
  .catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
