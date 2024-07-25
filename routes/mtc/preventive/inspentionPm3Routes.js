const router = require("express").Router();
const {
  getPm3,
  getPm3ById,
  getPm3RequestDate,

  createTicketPm3,
  responseTicketPm3,
  createPointPm3,
  updateTaskPm3,
  startTaskPm3,
  stopTaskPm3,
  doneTicketPm3,
  requestDatePm3,
  submitAllRequestDatePm3,
} = require("../../../controller/mtc/preventive/pm3Controller");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/pm3", getPm3);
router.get("/pm3/requestDate", getPm3RequestDate);

router.get("/pm3/:id", getPm3ById);
router.post("/pm3/create", createTicketPm3);
router.put("/pm3/requestDate/:id", requestDatePm3);
router.get("/pm3/response/:id", auth, responseTicketPm3);
router.post("/pm3/createPoint", createPointPm3);
router.put("/pm3/task/:id", auth, updateTaskPm3);
router.put("/pm3/taskStart/:id", startTaskPm3);
router.put("/pm3/taskStop/:id", stopTaskPm3);
router.put("/pm3/done/:id", doneTicketPm3);
router.post("/pm3/submitDate", submitAllRequestDatePm3);

// router.delete("/inspectionResult/:id", Auth, deleteInspectionResult )

module.exports = router;
