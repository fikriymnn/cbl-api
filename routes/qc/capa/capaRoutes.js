const router = require("express").Router();
const capa = require("../../../controller/qc/capa/capaTiketController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/capa/:id?", capa.getCapaTicket);
router.post("/capa/submit/:id", capa.submitCapaTicket);
router.put("/capa/verifikasiQa/:id", auth, capa.verifikasiCapaQa);
router.put("/capa/verifikasiMr/:id", auth, capa.verifikasiCapaMr);

module.exports = router;
