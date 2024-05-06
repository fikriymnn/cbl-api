const router = require("express").Router();
const {getSparepartProblem, getSparepartProblemById, createSparepartProblem, updateSparepartProblem, deleteSparepartProblem} = require("../../controller/mtc/sparepartProblemController")
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/master/sparepartProblem", getSparepartProblem);
router.get("/master/sparepartProblem/:id", getSparepartProblemById);
router.post("/master/sparepartProblem",Auth, createSparepartProblem);
router.put("/master/sparepartProblem/:id",Auth, updateSparepartProblem);
router.delete("/master/sparepartProblem/:id", Auth, deleteSparepartProblem )


module.exports = router;