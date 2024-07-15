const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiBahanResult = require('../../../../controller/qc/inspeksi/bahan/inspeksiBahanResultController')

router.delete("/qc/cs/inspeksiBahanResult/:id",inspeksiBahanResult.deleteInspeksiBahanResult)
router.get("/qc/cs/inspeksiBahanResult/start/:id",inspeksiBahanResult.startInspeksiBahanResult)
router.put("/qc/cs/inspeksiBahanResult/stop/:id",inspeksiBahanResult.stopInspeksiBahanResult)

module.exports = router