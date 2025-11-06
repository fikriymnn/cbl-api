const router = require("express").Router();
const ProduksiLkhController = require("../../controller/produksi/produksiLkhController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/produksi/lkh/:id?", auth, ProduksiLkhController.getProduksiLkh);

module.exports = router;
