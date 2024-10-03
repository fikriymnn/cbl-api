const router = require("express").Router();
const masterRole = require("../../controller/masterData/masterRoleController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/master/role/:id?", masterRole.getMasterRole);
router.post("/master/role", auth, masterRole.createMasterRole);
router.put("/master/role/:id", auth, masterRole.updateMasterRole);
router.delete("/master/role/:id", auth, masterRole.deleteMasterRole);

module.exports = router;
