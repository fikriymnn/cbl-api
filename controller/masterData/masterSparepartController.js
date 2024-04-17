const masterSparepart = require("../../model/masterData/masterSparepart")

const masterSparepartController = {
    getMasterSparepart: async (req, res) => {
        try {
            const response = await masterSparepart.findAll();
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getMasterSparepartById: async (req, res) => {
        try {
            const response = await masterSparepart.findByPk(req.params.id);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    createMasterSparepart: async (req, res)=>{
        const {id_mesin ,nama_sparepart,status_sparepart,umur_sparepart,tgl_ganti} = req.body;
        if(!id_mesin ||!nama_sparepart||!status_sparepart||!umur_sparepart||!tgl_ganti)return res.status(404).json({msg:"incomplete data!!"})

        try {
            const response = await masterSparepart.create({
                id_mesin ,nama_sparepart,status_sparepart,umur_sparepart,tgl_ganti
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    updateMasterSparepart: async (req, res)=>{
        const _id = req.params.id;
        const {id_mesin ,nama_sparepart,status_sparepart,umur_sparepart,tgl_ganti} = req.body;

        let obj = {}
        if(id_mesin)obj.id_mesin = id_mesin;
        if(nama_sparepart)obj.nama_sparepart = nama_sparepart;
        if(status_sparepart)obj.status_sparepart = status_sparepart;
        if(umur_sparepart)obj.umur_sparepart = umur_sparepart;
        if(tgl_ganti)obj.tgl_ganti = tgl_ganti;

        try {
            await masterSparepart.update(obj,{where: {id:_id}}),
              res.status(201).json({ msg: "Sparepart update Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    },

    deleteMasterSparepart: async (req,res)=>{
        const _id = req.params.id;
        try {
            await masterSparepart.destroy({where: {id:_id}}),
              res.status(201).json({ msg: "Sparepart delete Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    }
}

module.exports = masterSparepartController;