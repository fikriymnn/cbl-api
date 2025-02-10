const masterStatusKaryawan = require("../../../model/masterData/hr/masterStatusKaryawanModel");

const masterStatusKaryawanController = {
  getMasterStatusKaryawan: async (req, res) => {
    const _id = req.params.id;

    try {
      if (_id) {
        const response = await masterStatusKaryawan.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterStatusKaryawan.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKaryawan: async (req, res) => {
    const { nama_status, waktu_bulan, type } = req.body;

    if (!nama_status)
      return res.status(404).json({ msg: "nama status wajib di isi" });
    if (!waktu_bulan)
      return res.status(404).json({ msg: "waktu wajib di isi" });
    if (!type) return res.status(404).json({ msg: "type wajib di isi" });

    try {
      const data = await masterStatusKaryawan.create({
        nama_status,
        waktu_bulan,
        type,
      });
      res
        .status(201)
        .json({ msg: "Master Status update Successfuly", data: data });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { nama_status, waktu_bulan, type } = req.body;

    let obj = {};
    if (nama_status) obj.nama_status = nama_status;
    if (waktu_bulan) obj.waktu_bulan = waktu_bulan;
    if (type) obj.type = type;

    try {
      await masterStatusKaryawan.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  deleteMasterKaryawan: async (req, res) => {
    const _id = req.params.id;

    try {
      await masterStatusKaryawan.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterStatusKaryawanController;
