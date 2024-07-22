const router = require("express").Router()
const {auth} = require("../../../../middlewares/authMiddlewares")
const inspeksiPotong = require('../../../../controller/qc/inspeksi/potong/inspeksiPotongController')

router.get("/qc/cs/inspeksiPotong/:id?",inspeksiPotong.getInspeksiPotong)
router.post("/qc/cs/inspeksiPotong",inspeksiPotong.createInpeksiPotong)
//update
router.put("/qc/cs/inspeksiPotong/update/:id",inspeksiPotong.updateInspeksiPotong)
// start and stop
router.get("/qc/cs/inspeksiPotong/start/:id",inspeksiPotong.startInspeksiPotong)
router.get("/qc/cs/inspeksiPotong/stop/:id",inspeksiPotong.stopInspeksiPotong)

module.exports = router