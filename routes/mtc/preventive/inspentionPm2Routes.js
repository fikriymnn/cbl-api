const router = require("express").Router();
const {
  getPm2,
  getPm2ById,
  createTicketPm2,
  responseTicketPm2,
  createPointPm2,
  updateTaskPm2,
  startTaskPm2,
  stopTaskPm2,
  doneTicketPm2,
} = require("../../../controller/mtc/preventive/pm2Controller");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/pm2", getPm2);
router.get("/pm2/:id", getPm2ById);
router.post("/pm2/create", createTicketPm2);
router.get("/pm2/response/:id", auth, responseTicketPm2);
router.post("/pm2/createPoint", createPointPm2);
router.put("/pm2/task/:id", auth, updateTaskPm2);
router.put("/pm2/taskStart/:id", startTaskPm2);
router.put("/pm2/taskStop/:id", stopTaskPm2);
router.put("/pm2/done/:id", doneTicketPm2);

// router.delete("/inspectionResult/:id", Auth, deleteInspectionResult )

module.exports = router;
