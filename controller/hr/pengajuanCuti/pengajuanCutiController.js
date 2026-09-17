const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanCuti = require("../../../model/hr/pengajuanCuti/pengajuanCutiModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanCutiController = {
  getPengajuanCuti: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status_tiket,
      id_karyawan,
      status,
      id_department,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };

    if (status_tiket) obj.status_tiket = status_tiket;
    if (id_department) obj.id_department = id_department;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (status) obj.status = status;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.dari = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await PengajuanCuti.count({ where: obj });
        const data = await PengajuanCuti.findAll({
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
        const data = await PengajuanCuti.findByPk(_id, {
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
        const data = await PengajuanCuti.findAll({
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

  createPengajuanCuti: async (req, res) => {
    const {
      id_karyawan,
      id_pengaju,
      tipe_cuti,
      dari,
      sampai,
      jumlah_hari,
      alasan_cuti,
      sisa_cuti,
      file,
    } = req.body;

    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
      const dataPengajuanCuti = await PengajuanCuti.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          id_department: dataKaryawanBiodata.id_department,
          tipe_cuti,
          dari,
          sampai,
          jumlah_hari,
          alasan_cuti,
          sisa_cuti,
          file,
        },
        { transaction: t },
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanCuti,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanCuti: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;

    const t = await db.transaction();

    try {
      const dataPengajuanCuti = await PengajuanCuti.findByPk(_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!dataPengajuanCuti) {
        await t.rollback();

        return res.status(404).json({
          msg: "Data tidak ditemukan",
        });
      }

      // Cegah approve 2x
      if (dataPengajuanCuti.status === "approved") {
        await t.rollback();

        return res.status(400).json({
          msg: "Pengajuan cuti sudah di-approve sebelumnya",
        });
      }

      await PengajuanCuti.update(
        {
          status: "approved",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr,
        },
        {
          where: {
            id: _id,
          },
          transaction: t,
        },
      );

      if (dataPengajuanCuti.tipe_cuti?.toLowerCase() === "tahunan") {
        const dataKaryawan = await KaryawanBiodata.findOne({
          where: {
            id_karyawan: dataPengajuanCuti.id_karyawan,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!dataKaryawan) {
          throw new Error("Data biodata karyawan tidak ditemukan");
        }

        const sisaCutiBaru =
          Number(dataKaryawan.sisa_cuti || 0) -
          Number(dataPengajuanCuti.jumlah_hari || 0);

        if (sisaCutiBaru < 0) {
          throw new Error("Sisa cuti tidak mencukupi");
        }

        await dataKaryawan.update(
          {
            sisa_cuti: sisaCutiBaru,
          },
          {
            transaction: t,
          },
        );
      }

      await t.commit();

      return res.status(200).json({
        msg: "Approve Successfully",
      });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }

      return res.status(500).json({
        msg: error.message,
      });
    }
  },

  rejectPengajuanCuti: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanCuti = await PengajuanCuti.findByPk(_id);
      if (!dataPengajuanCuti)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanCuti.update(
        {
          status: "rejected",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();

      res.status(200).json({ msg: "Reject Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PengajuanCutiController;
