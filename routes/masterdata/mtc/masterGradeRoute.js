const router = require("express").Router();
const masterGradeController = require("../../../controller/masterData/mtc/gradeController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/grade/:id?", masterGradeController.getMasterGrade);
router.post("/master/grade", auth, masterGradeController.createMasterGrade);
router.put("/master/grade/:id", auth, masterGradeController.updateMasterGrade);

module.exports = router;
