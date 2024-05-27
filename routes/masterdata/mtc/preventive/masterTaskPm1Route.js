const router = require("express").Router();
const {
  getMasterPointPm1,
  getMasterPointPm1ById,
  // createMasterPointPm1,
  createMasterTaskPm1,
  updateMasterPointPm1,
  deleteMasterPointPm1,
  deleteMasterTaskPm1,
  createMasterPointPm1,
} = require("../../../../controller/masterData/mtc/preventive/masterPm1Controller");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/pointPm1", getMasterPointPm1);
router.get("/master/pointPm1/:id", getMasterPointPm1ById);
router.post("/master/pointPm1", auth, createMasterPointPm1);
router.post("/master/TaskPm1", auth, createMasterTaskPm1);
router.put("/master/pointPm1/:id", auth, updateMasterPointPm1);
router.delete("/master/pointPm1/:id", auth, deleteMasterPointPm1);
router.delete("/master/taskPm1/:id", auth, deleteMasterTaskPm1);

module.exports = router;
