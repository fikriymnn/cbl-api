const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanSP = require("../../../model/hr/pengajuanSP/pengajuanSPModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanSPController = {
  getPengajuanSP: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, status_tiket, id_department } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    if (status_tiket) obj.status_tiket = status_tiket;
    if (id_department) obj.id_department = id_department;
    try {
      if (page && limit) {
        const length = await PengajuanSP.count({ where: obj });
        const data = await PengajuanSP.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await PengajuanSP.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PengajuanSP.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPengajuanSP: async (req, res) => {
    const { id_karyawan, id_pengaju, alasan, nama_sp_teguran, masa_berlaku } =
      req.body;
    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });

      const dataPengajuanSP = await PengajuanSP.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          id_department: dataKaryawanBiodata.id_department,
          alasan,
          nama_sp_teguran,
          masa_berlaku,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanSP,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanSP: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanSP = await PengajuanSP.findByPk(_id);
      if (!dataPengajuanSP)
        return res.status(404).json({ msg: "data tidak di temukan" });

      if (!req.user.id_karyawan)
        return res.status(404).json({ msg: "id_karyawan hr tidak di temukan" });

      const dariTanggal = new Date();
      const sampaiTanggalObj = new Date(dariTanggal); // Salin objek tanggal
      sampaiTanggalObj.setDate(
        sampaiTanggalObj.getDate() + dataPengajuanSP.masa_berlaku
      ); // Tambah jumlah hari hari

      const tahun = sampaiTanggalObj.getFullYear();
      const bulan = (sampaiTanggalObj.getMonth() + 1)
        .toString()
        .padStart(2, "0"); // Format dua digit
      const tanggal = sampaiTanggalObj.getDate().toString().padStart(2, "0"); // Format dua digit

      const sampaiTanggal = new Date(`${tahun}-${bulan}-${tanggal}`);

      await PengajuanSP.update(
        {
          status: "approved",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
          dari: dariTanggal,
          sampai: sampaiTanggal,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectPengajuanSP: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanSP = await PengajuanSP.findByPk(_id);
      if (!dataPengajuanSP)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanSP.update(
        {
          status: "rejected",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();

      res.status(200).json({ msg: "Reject Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PengajuanSPController;
