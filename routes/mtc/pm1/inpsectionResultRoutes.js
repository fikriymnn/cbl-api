const router = require("express").Router();
const {
  getInspectionResult,
  updateInspectionResult,
  deleteInspectionResult,
  createInspectionResult,
} = require("../../../controller/preventive/pm1/inspectionResultController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/inspectionResult", getInspectionResult);
router.post("/inspectionResult", auth, createInspectionResult);
router.put("/inspectionResult/:id", auth, updateInspectionResult);
router.delete("/inspectionResult/:id", auth, deleteInspectionResult);

module.exports = router;
