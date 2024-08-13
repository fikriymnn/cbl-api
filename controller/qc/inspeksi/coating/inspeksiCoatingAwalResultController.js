const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel")

const inspeksiCoatingAwalResultController = {
    startCoatingAwalResult: async (req, res) => {
        try {
            const {id} = req.params
            const timenow = new Date()
            await InspeksiCoatingResultAwal.update({waktu_mulai: timenow },{id})

            es.status(500).json({ data:"start successfully",msg: 'OK' })

        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    stopCoatingAwalResult: async (req, res) => {
        try {
            const {id} = req.params

            const newdate = new Date()

            const {
                lama_pengerjaan,
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
                lama_pengerjaan,
                waktu_selesai: newdate,
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

            res.status(500).json({ data:"stop successfully",msg: 'OK' })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    }
}
module.exports = inspeksiCoatingAwalResultController