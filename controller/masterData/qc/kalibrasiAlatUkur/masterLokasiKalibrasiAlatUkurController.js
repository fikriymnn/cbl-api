const masterLokasiKalibrasiAlatUkur = require("../../../../model/masterData/qc/kalibrasiAlatUkur/masterLokasiPenyimpananKalibrasiAlatUkurModel");

const masterLokasiKalibrasiAlatUkurController = {
  getMasterLokasiKalibrasiAlatUkur: async (req, res) => {
    const id = req.params.id;

    try {
      if (id) {
        const response = await masterLokasiKalibrasiAlatUkur.findByPk(id);
        res.status(200).json({ data: response });
      } else {
        const response = await masterLokasiKalibrasiAlatUkur.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterLokasiKalibrasiAlatUkur: async (req, res) => {
    const { lokasi } = req.body;
    if (!lokasi) return res.status(404).json({ msg: "lokasi wajib di isi!!" });

    try {
      const response = await masterLokasiKalibrasiAlatUkur.create({
        lokasi,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterLokasiKalibrasiAlatUkur: async (req, res) => {
    const _id = req.params.id;
    const { lokasi } = req.body;

    let obj = {};
    if (lokasi) obj.lokasi = lokasi;

    try {
      await masterLokasiKalibrasiAlatUkur.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterLokasiKalibrasiAlatUkurController;
