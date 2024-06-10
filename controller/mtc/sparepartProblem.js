const { Sequelize } = require("sequelize");
const MasalahSparepart = require("../../model/mtc/sparepartProblem");

const MasalahSparepartController = {
  getMasalahSparepart: async (req, res) => {
    try {
      const { id_tiket,
      id_tiket_os3,
      id_proses,
      id_proses_os3,
      id_ms_sparepart,
      id_stok_sparepart,
      nama_sparepart_sebelumnya,
      lokasi_sparepart_sebelumnya,
      grade_sparepart_sebelumnya,
      nama_sparepart_baru,
      lokasi_sparepart_baru,
      grade_sparepart_baru,
      tgl_ganti,page,limit,
      status} = req.query

      let obj = {}
      let offset = (page-1)*limit
      if (id_tiket) obj.id_tiket = id_tiket;
      if (id_tiket_os3) obj.id_tiket_os3 = id_tiket_os3;
      if (id_proses) obj.id_proses = id_proses;
      if (id_proses_os3) obj.id_proses_os3 = id_proses_os3;
      if (id_ms_sparepart) obj.id_ms_sparepart = id_ms_sparepart;
      if (id_stok_sparepart) obj.id_stok_sparepart = id_stok_sparepart;
      if (nama_sparepart_sebelumnya) obj.nama_sparepart_sebelumnya = nama_sparepart_sebelumnya;
      if (lokasi_sparepart_sebelumnya) obj.lokasi_sparepart_sebelumnya = lokasi_sparepart_sebelumnya;
      if (grade_sparepart_sebelumnya) obj.grade_sparepart_sebelumnya = grade_sparepart_sebelumnya;
      if (nama_sparepart_baru) obj.nama_sparepart_baru = nama_sparepart_baru;
      if (lokasi_sparepart_baru) obj.lokasi_sparepart_baru = lokasi_sparepart_baru;
      if (grade_sparepart_baru) obj.grade_sparepart_baru = grade_sparepart_baru;
      if (tgl_ganti) obj.tgl_ganti = tgl_ganti;
      if (status) obj.status = status;

      if(page&limit){
        const length_data = await MasalahSparepart.count({where:obj})
        const response = await MasalahSparepart.findAll({where:obj,limit:parseInt(limit),offset:parseInt(offset)});
        res.status(200).json({data:response,total_page:Math.ceil(length_data/limit)});
      }else{
        const response = await MasalahSparepart.findAll({where:obj});
        res.status(200).json(response);
      }
     
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },


  getMasalahSparepartById: async (req, res) => {
    try {
      const response = await MasalahSparepart.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasalahSparepartByTicket: async (req, res) => {
    try {
      const response = await MasalahSparepart.findAll({where:{id_tiket:req.params.id}});
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasalahSparepart: async (masalah_sparepart) => {
    
    
    
      

    try {
      const response = await MasalahSparepart.bulkCreate(masalah_sparepart);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

//   updateStokSparepart: async (req, res) => {
//     const _id = req.params.id;
//     const {
//       kode,
//       nama_sparepart,
//       nama_mesin,
//       jenis_part,
//       persen,
//       kebutuhan_bulanan,
//       stok,
//       keterangan,
//       umur_sparepart,
//       vendor,
//     } = req.body;

//     let obj = {};
//     if (kode) obj.kode = kode;
//     if (nama_sparepart) obj.nama_sparepart = nama_sparepart;
//     if (nama_mesin) obj.nama_mesin = nama_mesin;
//     if (umur_sparepart) obj.umur_sparepart = umur_sparepart;
//     if (jenis_part) obj.jenis_part = jenis_part;
//     if (persen) obj.persen = persen;
//     if (kebutuhan_bulanan) obj.kebutuhan_bulanan = kebutuhan_bulanan;
//     if (stok) obj.stok = stok;
//     if (keterangan) obj.keterangan = keterangan;
//     if (vendor) obj.vendor = vendor;

//     try {
//       await StokSparepart.update(obj, { where: { id: _id } }),
//         res.status(201).json({ msg: "Sparepart update Successfuly" });
//     } catch (error) {
//       res.status(400).json({ msg: error.message });
//     }
//   },

//   deleteStokSparepart: async (req, res) => {
//     const _id = req.params.id;
//     try {
//       await StokSparepart.destroy({ where: { id: _id } }),
//         res.status(201).json({ msg: "Sparepart delete Successfuly" });
//     } catch (error) {
//       res.status(400).json({ msg: error.message });
//     }
//   },

//   addStokSparepart: async (req, res) => {
//     const _id = req.params.id;
//     const { new_stok } = req.body;

//     if (!new_stok) return res.status(404).json({ msg: "stok required" });

//     try {
//       const sparepart = await StokSparepart.findByPk(_id);
//       const stok_sparepart = sparepart.stok + new_stok;
//       console.log(stok_sparepart);

//       await StokSparepart.update(
//         { stok: stok_sparepart },
//         { where: { id: _id } }
//       ),
//         res.status(201).json({ msg: "Sparepart update Successfuly" });
//     } catch (error) {
//       res.status(400).json({ msg: error.message });
//     }
//   },
};

module.exports = MasalahSparepartController;
