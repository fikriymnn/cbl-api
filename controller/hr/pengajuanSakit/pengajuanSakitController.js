const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanSakit = require("../../../model/hr/pengajuanSakit/pengajuanSakitModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanSakitController = {
  getPengajuanSakit: async (req, res) => {
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
        const length = await PengajuanSakit.count({ where: obj });
        const data = await PengajuanSakit.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
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
              as: "karyawan_pengaju",
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
        const data = await PengajuanSakit.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
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
        const data = await PengajuanSakit.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
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
              as: "karyawan_pengaju",
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

  createPengajuanSakit: async (req, res) => {
    const { id_karyawan, id_pengaju, dari, sampai, jumlah_hari, lampiran } =
      req.body;
    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
      const dataPengajuanSakit = await PengajuanSakit.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          id_department: dataKaryawanBiodata.id_department,
          dari,
          sampai,
          jumlah_hari,
          lampiran,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanSakit,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanSakit: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanSakit = await PengajuanSakit.findByPk(_id);
      if (!dataPengajuanSakit)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanSakit.update(
        {
          status: "approved",
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
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectPengajuanSakit: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanSakit = await PengajuanSakit.findByPk(_id);
      if (!dataPengajuanSakit)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanSakit.update(
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

module.exports = PengajuanSakitController;
