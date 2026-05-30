const router = require("express").Router();
const JobOrderController = require("../../../controller/ppic/jobOrder/jobOrderController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/ppic/jo/:id?", auth, JobOrderController.getJobOrder);
router.get(
  "/ppic/joJumlahData",
  auth,
  JobOrderController.getJobOrderJumlahData,
);
router.post("/ppic/jo", auth, JobOrderController.createJobOrder);
router.post("/ppic/joKanban", auth, JobOrderController.createJobOrderKanban);
router.put("/ppic/jo/:id", auth, JobOrderController.updateJobOrder);
router.put(
  "/ppic/jo/request/:id",
  auth,
  JobOrderController.submitRequestJobOrder,
);
router.put("/ppic/jo/approve/:id", auth, JobOrderController.approveJobOrder);
router.put("/ppic/jo/reject/:id", auth, JobOrderController.rejectJobOrder);
router.put("/ppic/jo/sendJadwal/:id", auth, JobOrderController.sendToJadwal);
router.put(
  "/ppic/jo/openLabel/:id",
  auth,
  JobOrderController.openLabelJobOrder,
);
router.put(
  "/ppic/jo/closeLabel/:id",
  auth,
  JobOrderController.closeLabelJobOrder,
);

module.exports = router;
