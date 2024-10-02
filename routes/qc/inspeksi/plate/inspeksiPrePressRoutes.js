const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPrePress = require("../../../../controller/qc/inspeksi/plate/inspeksiPrePressController");

router.get(
  "/qc/cs/inspeksiPrePress/:id?",
  auth,
  inspeksiPrePress.getInspeksiPrePress
);
router.get(
  "/qc/cs/inspeksiPrePressMesin",
  auth,
  inspeksiPrePress.getInspeksiPrePressMesin
);

//done potong
router.put(
  "/qc/cs/inspeksiPrePress/check/:id",
  auth,
  inspeksiPrePress.checkInspeksiPrePress
);

module.exports = router;
