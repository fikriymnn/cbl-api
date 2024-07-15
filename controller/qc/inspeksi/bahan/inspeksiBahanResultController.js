const InspeksiBahanResult = require("../../../../model/qc/inspeksi/bahan/inspeksiBahanResultModel");

const inspeksiBahanResultController = {
    deleteInspeksiBahanResult: async (req, res) => {
        const id = req.params.id;
        try {
            await InspeksiBahanResult.destroy({ where: { id: id } })
            return res.status(200).json({ data: "delete successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    startInspeksiBahanResult: async (req, res) => {
        try {
            const { id } = req.params
            await InspeksiBahanResult.update({ waktu_mulai: new Date() }, {
                where: { id: id }
            })
            return res.status(200).json({ data: "Start successfully!" })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    stopInspeksiBahanResult: async (req, res) => {
        try {
            const { id } = req.params
            const { hasil,
                hasil_kiri,
                hasil_tengah,
                hasil_kanan,
                rata_rata,
                keterangan_hasil,
                foto } = req.body

            let obj = {
                waktu_selesai: new Date()
            }
            if (hasil)
                obj.hasil = hasil
            if (hasil_kiri)
                obj.hasil_kiri = hasil_kiri
            if (hasil_tengah)
                obj.hasil_tengah = hasil_tengah
            if (hasil_kanan)
                obj.hasil_kanan = hasil_kanan
            if (rata_rata)
                obj.rata_rata = rata_rata
            if (keterangan_hasil)
                obj.keterangan_hasil = keterangan_hasil
            if (foto)
                obj.foto = foto

            await InspeksiBahanResult.update(obj, {
                where: { id: id }
            })
            return res.status(200).json({ data: "Stop successfully!" })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = inspeksiBahanResultController