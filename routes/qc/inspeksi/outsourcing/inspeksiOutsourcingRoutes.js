const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const OutsourcingController = require("../../../../controller/qc/inspeksi/outsourcing/inspeksiOutsourcingController");

//get data outsourcing
router.get("/qc/cs/inspeksiOutsoucing/:id?", auth, OutsourcingController.getInspeksiOutsourcing);

//create data outsourcing
router.post("/qc/cs/inspeksiOutsourcing", OutsourcingController.createInspeksiOutsourcing);

module.exports = router;