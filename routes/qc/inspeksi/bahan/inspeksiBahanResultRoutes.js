const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiBahanResult = require('../../../../controller/qc/inspeksi/bahan/inspeksiBahanResultController')

router.delete("/qc/cs/inspeksiBahanResult/:id",inspeksiBahanResult.deleteInspeksiBahanResult)
router.put("/qc/cs/inspeksiBahanResult",inspeksiBahanResult.updateInspeksiBahanResult)

module.exports = router