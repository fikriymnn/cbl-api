const InspeksiPotong = require("../../../../model/qc/inspeksi/potong/inspeksiPotongModel")
const InspeksiPotongResult = require('../../../../model/qc/inspeksi/potong/inspeksiPotongResultModel')

const inspeksiPotongController = {
    getInspeksiPotong: async (req, res) => {
        try {
            const { status, jenis_potong, page, limit } = req.query
            const { id } = req.params
            const offset = (parseInt(page) - 1) * parseInt(limit)
            let obj = {}
            if (page && limit && (status || jenis_potong)) {
                if (status) obj.status = status
                if (jenis_potong) obj.jenis_potong = jenis_potong
                const data = await InspeksiPotong.findAll({order: [['createdAt', 'DESC']], limit: parseInt(limit), offset, where: obj })
                const length = await InspeksiPotong.count({ where: obj })
                return res.status(200).json({
                    data, total_page: Math.ceil(length / parseInt(limit))
                })
            } else if (page && limit) {
                const data = await InspeksiPotong.findAll({order: [['createdAt', 'DESC']], offset, limit: parseInt(limit) })
                const length = await InspeksiPotong.count()
                return res.status(200).json({
                    data, total_page: Math.ceil(length / parseInt(limit))
                })
            }
            else if (status || jenis_potong) {
                if (status) obj.status = status
                if (jenis_potong) obj.jenis_potong = jenis_potong
                const data = await InspeksiPotong.findAll({order: [['createdAt', 'DESC']], where: obj })
                const length = await InspeksiPotong.count({ where: obj })
                return res.status(200).json({
                    data, total_page: Math.ceil(length / parseInt(limit))
                })
            } else if (id) {
                const data = await InspeksiPotong.findByPk(id, { include: { model: InspeksiPotongResult, as: "inspeksi_potong_result" } })
                if (array.length == 9) {
                    data.inspeksi_bahan_result = array;
                }
                return res.status(200).json({ data })
            } else {
                const data = await InspeksiPotong.findAll({order: [['createdAt', 'DESC']]})
                return res.status(200).json({ data })
            }
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    createInpeksiPotong: async (req, res) => {
        try {
            const { jenis_potong, tanggal, no_io, no_jo, mesin, operator, shift, jam, item, inspector } = req.body

            if (!jenis_potong)
                return res.status(400).json({ msg: "Field jenis potong kosong!" })
            if (!tanggal)
                return res.status(400).json({ msg: "Field tanggal kosong!" })
            if (!no_io)
                return res.status(400).json({ msg: "Field no_io kosong!" })
            if (!no_jo)
                return res.status(400).json({ msg: "Field no_jo kosong!" })
            if (!mesin)
                return res.status(400).json({ msg: "Field mesin kosong!" })
            if (!operator)
                return res.status(400).json({ msg: "Field operator kosong!" })
            if (!shift)
                return res.status(400).json({ msg: "Field shift kosong!" })
            if (!jam)
                return res.status(400).json({ msg: "Field jam kosong!" })
            if (!item)
                return res.status(400).json({ msg: "Field item kosong!" })
            if (!inspector)
                return res.status(400).json({ msg: "Field inspector kosong!" })

            const data_exist = await InspeksiPotong.findAll({order: [['createdAt', 'DESC']],limit:1})
            console.log(data_exist)
            if(data_exist){
                await InspeksiPotong.update({status:'history'},{where: {id: data_exist[0].id}})
            }
            const data = await InspeksiPotong({ jenis_potong, tanggal, no_io, no_jo, mesin, operator, shift, jam, item, inspector })

            

            if (data) {
                let array = [];
                master_data_fix.forEach((value) => {
                    value.id_inspeksi_potong = data.id
                    array.push(value)
                })
                if (array.length == 4) {
                    await InspeksiPotongResult.bulkCreate(array)
                }
            }
            res.status(200).json({ data, msg: 'OK' })
        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    },
    updateInspeksiPotong: async (req, res) => {
        try {
            const { id } = req.params
            const { mesin, foto,lama_pengerjaan } = req.body
            let obj = {
                status: "history"
            }

            if (mesin)
                obj.mesin = mesin
            if (foto)
                obj.foto = foto
            if(lama_pengerjaan)
                obj.lama_pengerjaan = lama_pengerjaan
            
            await InspeksiPotong.update(obj, {
                where: { id: id }
            })
            return res.status(200).json({ msg: "Update successfully!" })
        } catch (err) {
            res.status(400).json({ msg: err.message })
        }
    },   
    startInspeksiPotong: async (req,res)=>{
        const id = req.params.id;
        const date = new Date()
        try {
            await InspeksiPotong.update({waktu_mulai : date},{ where: { id: id } }),
                res.status(200).json({ msg: "start successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        } 
    },
    stopInspeksiPotong: async (req,res)=>{
        const id = req.params.id;
        const lama_pengerjaan = req.body.lama_pengerjaan
        const date = new Date()
        try {
            await InspeksiPotong.update({waktu_mulai : date,lama_pengerjaan},{ where: { id: id } }),
                res.status(200).json({ msg: "stop successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        } 
    }

}

const master_data_fix = [
    {
        no: 1,
        point_check: "Jenis Kertas"
    },
    {
        no: 2,
        point_check: "Gramatur"
    },
    {
        no: 3,
        point_check: "Ukuran Potong"
    },
    {
        no: 4,
        point_check: "Arah Serat",
        standar: "Mounting di BOM"
    }
]

module.exports = inspeksiPotongController