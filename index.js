const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

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
app.use("/", require("./routes/router"));

app.listen(process.env.APP_PORT, async () => {
  console.log("server up and running on port " + process.env.APP_PORT);
});

app.get("/", (req, res) => {
  db.authenticate()
    .then(() => {
      res.json({ msg: "Connection has been established successfully." });
    })
    .catch((error) => {
      res.json({ msg: error });
    });
});
