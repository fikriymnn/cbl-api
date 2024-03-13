import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// (async () => {
//   await Users.sync();
// })();

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//routes
app.use(userRoutes);
app.use(authRoutes);

app.listen(process.env.APP_PORT, async () => {
  console.log("server up and running on port " + process.env.APP_PORT);
});
