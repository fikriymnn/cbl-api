const router = require("express").Router();
const {
  getMasterPointPm3,
  getMasterPointPm3ById,
  // createMasterPointPm3,
  createMasterTaskPm3,
  updateMasterPointPm3,
  deleteMasterPointPm3,
  deleteMasterTaskPm3,
  createMasterPointPm3,
} = require("../../../../controller/masterData/mtc/preventive/masterPm3Controller");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/pointPm3", getMasterPointPm3);
router.get("/master/pointPm3/:id", getMasterPointPm3ById);
router.post("/master/pointPm3", auth, createMasterPointPm3);
router.post("/master/TaskPm3", auth, createMasterTaskPm3);
router.put("/master/pointPm3/:id", auth, updateMasterPointPm3);
router.delete("/master/pointPm3/:id", auth, deleteMasterPointPm3);
router.delete("/master/taskPm3/:id", auth, deleteMasterTaskPm3);

module.exports = router;
