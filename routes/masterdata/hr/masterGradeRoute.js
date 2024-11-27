const router = require("express").Router();
const masterGradeHrHrController = require("../../../controller/masterData/hr/masterGradeController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/hr/grade/:id?", masterGradeHrHrController.getMasterGradeHr);
router.post("/master/hr/grade", masterGradeHrHrController.createMasterGradeHr);
router.put(
  "/master/hr/grade/:id",
  auth,
  masterGradeHrHrController.updateMasterGradeHr
);

module.exports = router;
