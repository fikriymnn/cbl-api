const router = require("express").Router();
const {
  getMasterSkorPerbaikan,
  getMasterSkorPerbaikanId,
  createSkorPerbaikan,
  updateSkorPerbaikan,
  deleteSkorPerbaikan,
} = require("../../../controller/masterData/mtc/skorPerbaikan.Controller");
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/skorMtc", getMasterSkorPerbaikan);
router.get("/master/skorMtc/:id", getMasterSkorPerbaikanId);
router.post("/master/skorMtc", Auth, createSkorPerbaikan);
router.put("/master/skorMtc/:id", Auth, updateSkorPerbaikan);
router.delete("/master/skorMtc/:id", Auth, deleteSkorPerbaikan);

module.exports = router;
