const masterPerusahaanModel = require("../../../model/masterData/hr/masterPerusahaanModel");

const masterPerusahaanController = {
  getMasterPerusahaan: async (req, res) => {
    try {
      const response = await masterPerusahaanModel.findOne({
        where: { id: 1 },
      });
      res.status(200).json({ data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterPerusahaan: async (req, res) => {
    const {
      nama,
      alamat,
      kelurahan,
      kecamatan,
      no_tlp,
      kota,
      kode_pos,
      negara,
      email,
    } = req.body;

    let obj = {};
    if (nama) obj.nama = nama;
    if (alamat) obj.alamat = alamat;
    if (kelurahan) obj.kelurahan = kelurahan;
    if (kecamatan) obj.kecamatan = kecamatan;
    if (no_tlp) obj.no_tlp = no_tlp;
    if (kota) obj.kota = kota;
    if (kode_pos) obj.kode_pos = kode_pos;
    if (negara) obj.negara = negara;
    if (email) obj.email = email;

    try {
      await masterPerusahaanModel.update(obj, { where: { id: 1 } }),
        res.status(201).json({ msg: "Perusahaan update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterPerusahaanController;
