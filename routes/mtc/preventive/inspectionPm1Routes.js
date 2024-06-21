const router = require("express").Router();
const {
  getPm1,
  getPm1ById,
  createTicketPm1,
  responseTicketPm1,
  createPointPm1,
  updateTaskPm1,
  startTaskPm1,
  stopTaskPm1,
  doneTicketPm1,
} = require("../../../controller/mtc/preventive/pm1Controller");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/pm1", getPm1);
router.get("/pm1/:id", getPm1ById);
router.post("/pm1/create", createTicketPm1);
router.get("/pm1/response/:id", auth, responseTicketPm1);
router.post("/pm1/createPoint", createPointPm1);
router.put("/pm1/task/:id", auth, updateTaskPm1);
router.put("/pm1/taskStart/:id", startTaskPm1);
router.put("/pm1/taskStop/:id", stopTaskPm1);
router.put("/pm1/done/:id", doneTicketPm1);

// router.delete("/inspectionResult/:id", Auth, deleteInspectionResult )

module.exports = router;
