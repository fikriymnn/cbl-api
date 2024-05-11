const sparepartProblem = require("../../model/mtc/sparepartProblem")

const sparepartProblemController = {
    getSparepartProblem: async (req, res) => {
        try {
            const response = await sparepartProblem.findAll();
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getSparepartProblemById: async (req, res) => {
        try {
            const response = await sparepartProblem.findByPk(req.params.id);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    createSparepartProblem: async (req, res)=>{
        const { id_tiket,id_ms_sparepart,id_stok_sparepart,nama_sparepart_sebelumnya,
        status_sparepart_sebelumnya,umur_sparepart_sebelumnya,vendor_sparepart_sebelumnya,
        nama_sparepart_baru,umur_sparepart_baru,status_sparepart_baru,vendor_sparepart_baru} = req.body;
        // if(!id_mesin ||!nama_sparepart||!status_sparepart||!umur_sparepart||!tgl_ganti||!vendor)return res.status(404).json({msg:"incomplete data!!"})

        try {
            const response = await sparepartProblem.create({
                id_tiket,id_ms_sparepart,id_stok_sparepart,nama_sparepart_sebelumnya,
        status_sparepart_sebelumnya,umur_sparepart_sebelumnya,vendor_sparepart_sebelumnya,
        nama_sparepart_baru,umur_sparepart_baru,status_sparepart_baru,vendor_sparepart_baru
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    updateSparepartProblem: async (req, res)=>{
        const _id = req.params.id;
        const {id_tiket,id_ms_sparepart,id_stok_sparepart,nama_sparepart_sebelumnya,
            status_sparepart_sebelumnya,umur_sparepart_sebelumnya,vendor_sparepart_sebelumnya,
            nama_sparepart_baru,umur_sparepart_baru,status_sparepart_baru,vendor_sparepart_baru} = req.body;

        let obj = {}
        if(id_tiket)obj.id_tiket = id_tiket;
        if(id_ms_sparepart)obj.id_ms_sparepart = id_ms_sparepart;
        if(id_stok_sparepart)obj.id_stok_sparepart = id_stok_sparepart;
        if(nama_sparepart_sebelumnya)obj.nama_sparepart_sebelumnya = nama_sparepart_sebelumnya;
        if(status_sparepart_sebelumnya)obj.tgstatus_sparepart_sebelumnyal_ganti = status_sparepart_sebelumnya;
        if(umur_sparepart_sebelumnya)obj.umur_sparepart_sebelumnya = umur_sparepart_sebelumnya;
        if(vendor_sparepart_sebelumnya)obj.vendor_sparepart_sebelumnya = vendor_sparepart_sebelumnya;
        if(nama_sparepart_baru)obj.nama_sparepart_baru = nama_sparepart_baru;
        if(umur_sparepart_baru)obj.umur_sparepart_baru = umur_sparepart_baru;
        if(status_sparepart_baru)obj.status_sparepart_baru = status_sparepart_baru;
        if(vendor_sparepart_baru)obj.vendor_sparepart_baru = vendor_sparepart_baru;

        try {
            await sparepartProblem.update(obj,{where: {id:_id}}),
              res.status(201).json({ msg: "Sparepart Problem update Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    },

    deleteSparepartProblem: async (req,res)=>{
        const _id = req.params.id;
        try {
            await sparepartProblem.destroy({where: {id:_id}}),
              res.status(201).json({ msg: "Sparepart Problem delete Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    }
}

module.exports = sparepartProblemController;