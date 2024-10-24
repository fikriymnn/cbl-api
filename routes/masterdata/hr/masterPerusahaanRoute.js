const router = require("express").Router();
const masterPerusahaan = require("../../../controller/masterData/hr/masterPerudahaanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/perusahaan", masterPerusahaan.getMasterPerusahaan);
router.put("/master/perusahaan", auth, masterPerusahaan.updateMasterPerusahaan);

module.exports = router;
