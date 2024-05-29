const router = require("express").Router();
const {
  getInspectionTask,
  updateInspectionTask,
  deleteInspectionTask,
  createInspectionTask,
} = require("../../../controller/preventive/pm1/inspectionTaskController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/inspectionTask", getInspectionTask);
router.post("/inspectionTask", auth, createInspectionTask);
router.put("/inspectionTask/:id", auth, updateInspectionTask);
router.delete("/inspectionTask/:id", auth, deleteInspectionTask);

module.exports = router;
