const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiPotongResult = require('../../../../controller/qc/inspeksi/potong/inspeksiBahanResultController')

router.get("/qc/cs/inspeksiPotongResult/start/:id",inspeksiPotongResult.startInspeksiPotongResult)
router.put("/qc/cs/inspeksiPotongResult/stop/:id",inspeksiPotongResult.stopInspeksiPotongResult)

module.exports = router