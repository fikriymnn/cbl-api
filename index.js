const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");
const tc = require("./model/maintenaceTicketModel");
const tcos3 = require("./model/maintenanceTicketOs3Model");
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
const msSkor = require("./model/masterData/mtc/masterSkorJenisPerbaikanModel");
const mstaskm1 = require("./model/masterData/mtc/preventive/inspectionTaskPm1Model");
const mspointm1 = require("./model/masterData/mtc/preventive/inspenctionPoinPm1Model");

const tcpm1 = require("./model/mtc/preventive/pm1/ticketPm1");
const pointpm1 = require("./model/mtc/preventive/pm1/pointPm1");
const taskpm1 = require("./model/mtc/preventive/pm1/taskPm1");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const path = require("path")

const app = express();

// database sync to table
// (async () => {
//   await db.sync({ alter: true });
// })();

//model sync to table (pancingan)
// (async () => {
//   await mstaskm1.sync({ alter: true });
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
app.use("/images",express.static(path.join(__dirname,"./file")))
app.use("/", require("./routes/router"));

app.listen(process.env.APP_PORT, async () => {
  console.log("server up and running on port " + process.env.APP_PORT);
});


// const ip100 = 75
// const ip50from = 74
// const ip50to = 60
// const ip0 = 59
// const actual = 43
// const reverse = true
// var nilai

// if(reverse){
//   if(actual<=ip100){
//     nilai= 100
//   }else if(actual>=ip50from&&actual<=ip50to){
//     nilai= 50
//   }else if(actual>=ip0){
//     nilai = 0
//   }
//   console.log(nilai)
// }else{
//   if(actual>=ip100){
//     nilai= 100
//   }else if(actual<=ip50from&&actual>=ip50to){
//     nilai= 50
//   }else if(actual<=ip0){
//     nilai = 0
//   }
//   console.log(nilai)
// }







app.get("/", (req, res) => {
  db.authenticate()
    .then(() => {
      res.json({ msg: "Connection has been established successfully." });
    })
    .catch((error) => {
      res.json({ msg: error });
    });
});
