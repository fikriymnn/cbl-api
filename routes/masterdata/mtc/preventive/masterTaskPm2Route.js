const router = require("express").Router();
const {
  getMasterPointPm2,
  getMasterPointPm2ById,
  // createMasterPointPm2,
  createMasterTaskPm2,
  updateMasterPointPm2,
  deleteMasterPointPm2,
  deleteMasterTaskPm2,
  createMasterPointPm2,
} = require("../../../../controller/masterData/mtc/preventive/masterPm2Controller");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/pointPm2", getMasterPointPm2);
router.get("/master/pointPm2/:id", getMasterPointPm2ById);
router.post("/master/pointPm2", auth, createMasterPointPm2);
router.post("/master/TaskPm2", auth, createMasterTaskPm2);
router.put("/master/pointPm2/:id", auth, updateMasterPointPm2);
router.delete("/master/pointPm2/:id", auth, deleteMasterPointPm2);
router.delete("/master/taskPm2/:id", auth, deleteMasterTaskPm2);

module.exports = router;
