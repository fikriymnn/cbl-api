const router = require("express").Router();
const {
  getPm1,
  getPm1ById,
  createTicketPm1,
  createPointPm1,
  updateTaskPm1,
  startTaskPm1,
  doneTaskPm1,
} = require("../../../controller/mtc/preventive/pm1Controller");
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/pm1", getPm1);
router.get("/pm1/:id", getPm1ById);
router.post("/pm1/create", createTicketPm1);
router.post("/pm1/createPoint", createPointPm1);
router.put("/pm1/task/:id", Auth, updateTaskPm1);
router.put("/pm1/taskStart/:id", Auth, startTaskPm1);
router.put("/pm1/taskDone/:id", Auth, doneTaskPm1);

// router.delete("/inspectionResult/:id", Auth, deleteInspectionResult )

module.exports = router;
