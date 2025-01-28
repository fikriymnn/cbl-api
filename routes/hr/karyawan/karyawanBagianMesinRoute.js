const router = require("express").Router();
const karyawanBagianMesinController = require("../../../controller/hr/karyawan/karyawanBagianMesinController");

//utama

router.post(
  "/hr/karyawanBagianMesin",
  karyawanBagianMesinController.createKaryawanBagianMesin
);
router.put(
  "/hr/karyawanBagianMesin/:id",
  karyawanBagianMesinController.updateKaryawanBagianMesin
);

router.delete(
  "/hr/karyawanBagianMesin/:id",
  karyawanBagianMesinController.deleteKaryawanBagianMesin
);

module.exports = router;
