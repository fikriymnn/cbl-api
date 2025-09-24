const router = require("express").Router();
const IoController = require("../../controller/marketing/io/ioController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/marketing/io/:id?", auth, IoController.getIo);
router.get("/marketing/ioJumlahData", auth, IoController.getIoJumlahData);
router.post("/marketing/io", auth, IoController.createIo);
router.put("/marketing/io/:id", auth, IoController.updateIo);
router.put("/marketing/io/request/:id", auth, IoController.submitRequestIo);
router.put("/marketing/io/approve/:id", auth, IoController.approveIo);
router.put("/marketing/io/reject/:id", auth, IoController.rejectIo);
router.post("/marketing/io/mounting/:id", auth, IoController.createMountingIo);
router.put("/marketing/io/mounting/:id", auth, IoController.updateMountingIo);
router.delete("/marketing/io/:id", auth, IoController.deleteIo);

module.exports = router;
