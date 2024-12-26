const router = require("express").Router();
const {
  getSubProject,
  updateSubProject,
  deleteSubProject
} = require("../../../controller/mtc/project/subproject");

router.get("/subProjectMtc/:id", getSubProject);
router.put("/subProjectMtc/:id", updateSubProject);
router.delete("/subProjectMtc/:id", deleteSubProject);

module.exports = router;