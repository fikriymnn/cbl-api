const router = require("express").Router();
const {
  getMasterSkorPerbaikan,
  getMasterSkorPerbaikanId,
  createSkorPerbaikan,
  updateSkorPerbaikan,
  deleteSkorPerbaikan,
} = require("../../../controller/masterData/mtc/skorPerbaikan.Controller");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/skorMtc", getMasterSkorPerbaikan);
router.get("/master/skorMtc/:id", getMasterSkorPerbaikanId);
router.post("/master/skorMtc", auth, createSkorPerbaikan);
router.put("/master/skorMtc/:id", auth, updateSkorPerbaikan);
router.delete("/master/skorMtc/:id", auth, deleteSkorPerbaikan);

module.exports = router;
