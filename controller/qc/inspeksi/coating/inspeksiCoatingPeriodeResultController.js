const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel")

const inspeksiCoatingPeriodeResultController = {
    startCoatingPeriodeResult: async (req, res) => {
        try {
            const {id} = req.params
            const timenow = new Date()
            await InspeksiCoatingResultPeriode.update({waktu_mulai: timenow },{id})

            es.status(500).json({ data:"start successfully",msg: 'OK' })

        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    stopCoatingPeriodeResult: async (req, res) => {
        try {
            const {id} = req.params

            const newdate = new Date()

            const {
                lama_pengerjaan,
                foto,
                waktu_sampling,
                inspector,
                numerator,
                nilai_glossy_kiri,
                nilai_glossy_tengah,
                nilai_glossy_kanan,
                jumlah_sampling,
            } = req.body

            await InspeksiCoatingResultPeriode.update({
                lama_pengerjaan,
                waktu_selesai: newdate,
                lama_pengerjaan,
                foto,
                waktu_sampling,
                inspector,
                numerator,
                nilai_glossy_kiri,
                nilai_glossy_tengah,
                nilai_glossy_kanan,
                jumlah_sampling,
            },{id})

            res.status(500).json({ data:"stop successfully",msg: 'OK' })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    }
}
module.exports = inspeksiCoatingPeriodeResultController