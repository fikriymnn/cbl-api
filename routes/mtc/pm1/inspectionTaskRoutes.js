const router = require("express").Router();
const {getInspectionTask,updateInspectionTask,deleteInspectionTask, createInspectionTask} = require("../../../controller/preventive/pm1/inspectionTaskController")
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/inspectionTask", getInspectionTask);
router.post("/inspectionTask",Auth, createInspectionTask);
router.put("/inspectionTask/:id",Auth, updateInspectionTask);
router.delete("/inspectionTask/:id", Auth, deleteInspectionTask )


module.exports = router;