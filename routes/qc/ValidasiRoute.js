const router = require("express").Router();
const ValidasiController = require("../../controller/qc/validasiController");

router.get("/ValidasiQc", ValidasiController.getTicketValidasi);

module.exports = router;
