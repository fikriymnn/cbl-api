const router = require("express").Router();
const {
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require("../../../controller/mtc/project/project");

router.get("/projectMtc/:id?", getProject);
router.post("/projectMtc", createProject);
router.put("/projectMtc/:id", updateProject);
router.delete("/projectMtc/:id", deleteProject);

module.exports = router;