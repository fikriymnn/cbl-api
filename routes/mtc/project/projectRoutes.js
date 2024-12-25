const router = require("express").Router();
const {
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../../../controller/mtc/project/project");

router.get("/mtc/projectMtc/:id?", getProject);
router.post("/mtc/projectMtc", createProject);
router.put("/mtc/projectMtc/:id", updateProject);
router.delete("/mtc/projectMtc/:id", deleteProject);

module.exports = router;
