const router = require("express").Router();
const masterJenisTinta = require("../../controller/masterData/masterJenisTintaController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/master/jenisTinta/:id?", masterJenisTinta.getMasterJenisTinta);
router.post(
  "/master/jenisTinta",
  auth,
  masterJenisTinta.createMasterJenisTinta
);
router.put(
  "/master/jenisTinta/:id",
  auth,
  masterJenisTinta.updateMasterJenisTinta
);
router.delete(
  "/master/jenisTinta/:id",
  auth,
  masterJenisTinta.deleteMasterJenisTinta
);

module.exports = router;
