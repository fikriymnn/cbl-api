const router = require("express").Router();
const {
  getMasterPointPm1,
  getMasterPointPm1ById,
  createMasterPointPm1,
  createMasterTaskPm1,
  updateMasterPointPm1,
  deleteMasterPointPm1,
  deleteMasterTaskPm1,
} = require("../../../../controller/masterData/mtc/preventive/masterPm1Controller");
const { Auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/pointPm1", getMasterPointPm1);
router.get("/master/pointPm1/:id", getMasterPointPm1ById);
router.post("/master/pointPm1", Auth, createMasterPointPm1);
router.post("/master/TaskPm1", Auth, createMasterTaskPm1);
router.put("/master/pointPm1/:id", Auth, updateMasterPointPm1);
router.delete("/master/pointPm1/:id", Auth, deleteMasterPointPm1);
router.delete("/master/taskPm1/:id", Auth, deleteMasterTaskPm1);

module.exports = router;
