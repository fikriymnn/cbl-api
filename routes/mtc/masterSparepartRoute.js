const router = require("express").Router();
const {
  getSparepartProblem,
  getSparepartProblemById,
  createSparepartProblem,
  updateSparepartProblem,
  deleteSparepartProblem,
} = require("../../controller/mtc/sparepartProblemController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/master/sparepartProblem", getSparepartProblem);
router.get("/master/sparepartProblem/:id", getSparepartProblemById);
router.post("/master/sparepartProblem", auth, createSparepartProblem);
router.put("/master/sparepartProblem/:id", auth, updateSparepartProblem);
router.delete("/master/sparepartProblem/:id", auth, deleteSparepartProblem);

module.exports = router;
