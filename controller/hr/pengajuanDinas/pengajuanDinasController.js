const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanDinas = require("../../../model/hr/pengajuanDinas/pengajuanDinasModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanDinasController = {
  getPengajuanDinas: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      id_karyawan,
      status,
      status_tiket,

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
        const length = await PengajuanDinas.count({ where: obj });
        const data = await PengajuanDinas.findAll({
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
        const data = await PengajuanDinas.findByPk(_id, {
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
        const data = await PengajuanDinas.findAll({
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

  createPengajuanDinas: async (req, res) => {
    const { id_karyawan, id_pengaju, dari, sampai, jumlah_hari, alasan_dinas } =
      req.body;
    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
      const dataPengajuanDinas = await PengajuanDinas.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          id_department: dataKaryawanBiodata.id_department,
          dari,
          sampai,
          jumlah_hari,
          alasan_dinas,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanDinas,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanDinas: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanDinas = await PengajuanDinas.findByPk(_id);
      if (!dataPengajuanDinas)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanDinas.update(
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

  rejectPengajuanDinas: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanDinas = await PengajuanDinas.findByPk(_id);
      if (!dataPengajuanDinas)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanDinas.update(
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

module.exports = PengajuanDinasController;
