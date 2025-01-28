const router = require("express").Router();
const {
  getSubProject,
  updateSubProject,
  deleteSubProject,
  createSubProject,
} = require("../../../controller/mtc/project/subproject");

router.get("/mtc/subProjectMtc/:id", getSubProject);
router.post("/mtc/subProjectMtc", createSubProject);
router.put("/mtc/subProjectMtc/:id", updateSubProject);
router.delete("/mtc/subProjectMtc/:id", deleteSubProject);

module.exports = router;
