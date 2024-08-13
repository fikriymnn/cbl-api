const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel")

const inspeksiCoatingAwalResultController = {
    startCoatingAwalResult: async (req, res) => {
        try {
            const {id} = req.params
            const {
                waktu_mulai,
                catatan,
                foto,
                line_clearance,
                permukaan,
                nilai_glossy,
                gramatur,
                hasil_coating,
                spot_uv,
                tes_cracking
            } = req.body
            await InspeksiCoatingResultAwal.update({
                waktu_mulai,
                catatan,
                foto,
                line_clearance,
                permukaan,
                nilai_glossy,
                gramatur,
                hasil_coating,
                spot_uv,
                tes_cracking
            },{id})
            res.status(500).json({ data:"update successfully",msg: 'OK' })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    stopCoatingAwalResult: async (req, res) => {
        try {
            const {id} = req.params
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    }
}
module.exports = inspeksiCoatingAwalResultController