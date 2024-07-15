const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiBahan = require('../../../../controller/qc/inspeksi/bahan/inspeksiBahanController')

router.get("/qc/cs/inspeksiBahan/:id?",inspeksiBahan.getInspeksiBahan)
router.post("/qc/cs/inspeksiBahan",inspeksiBahan.createInspeksiBahan)
router.delete("/qc/cs/inspeksiBahan/:id",inspeksiBahan.deleteInspeksiBahan)
//update
router.put("/qc/cs/inspeksiBahan/update/:id",inspeksiBahan.updateInspeksiBahan)

module.exports = router