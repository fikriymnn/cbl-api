const router = require("express").Router();
const MasterKriteriaKendalaController = require("../../../controller/masterData/kodeProduksi/masterKriteriaKendalaController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/produksi/kriteriaKendala/:id?",
  auth,
  MasterKriteriaKendalaController.getMasterKriteriaKendala
);
router.post(
  "/master/produksi/kriteriaKendala",
  auth,
  MasterKriteriaKendalaController.createMasterKriteriaKendala
);
router.put(
  "/master/produksi/kriteriaKendala/:id",
  auth,
  MasterKriteriaKendalaController.updateMasterKriteriaKendala
);
router.delete(
  "/master/produksi/kriteriaKendala/:id",
  auth,
  MasterKriteriaKendalaController.deleteMasterKriteriaKendala
);

module.exports = router;
