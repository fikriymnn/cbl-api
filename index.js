const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");
const tc = require("./model/maintenaceTicketModel");
const user = require("./model/userModel");
const master = require("./model/masterData/masterMesinModel");
const master2 = require("./model/masterData/masterSparepart");
const mtc = require("./model/mtc/sparepartProblem");
const mtcAction = require("./model/mtc/userActionMtc");
const stok = require("./model/mtc/stokSparepart");
const reqStok = require("./model/mtc/requestStokSparepart");
const proses = require("./model/mtc/prosesMtc");
const kode = require("./model/masterData/masterKodeAnalisisModel");
const msMonitor = require("./model/masterData/mtc/timeMonitoringModel");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// database sync to table
// (async () => {
//   await db.sync({ alter: true });
// })();

//model sync to table (pancingan)
// (async () => {
//   await tc.sync({ alter: true });
// })();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
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
