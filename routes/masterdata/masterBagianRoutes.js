const router = require("express").Router();
const masterBagian = require("../../controller/masterData/masterBagianController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/master/bagian/:id?", masterBagian.getMasterBagian);
router.post("/master/bagian", auth, masterBagian.createMasterBagian);
router.put("/master/bagian/:id", auth, masterBagian.updateMasterBagian);
router.delete("/master/bagian/:id", auth, masterBagian.deleteMasterBagian);

module.exports = router;
