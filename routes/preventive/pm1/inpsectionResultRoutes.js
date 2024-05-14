const router = require("express").Router();
const {getInspectionResult,updateInspectionResult,deleteInspectionResult, createInspectionResult} = require("../../../controller/preventive/pm1/inspectionResultController")
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/inspectionResult", getInspectionResult);
router.post("/inspectionResult",Auth, createInspectionResult);
router.put("/inspectionResult/:id",Auth, updateInspectionResult);
router.delete("/inspectionResult/:id", Auth, deleteInspectionResult )


module.exports = router;