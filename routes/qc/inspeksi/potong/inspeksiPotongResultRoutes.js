const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiPotongResult = require('../../../../controller/qc/inspeksi/potong/inspeksiPotongResultController')

router.put("/qc/cs/inspeksiPotongResult/:id",inspeksiPotongResult.updateInspeksiPotongResult)

module.exports = router