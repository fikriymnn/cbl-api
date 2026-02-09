const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanTerlambatUser = require("../../../model/hr/pengajuanTerlambatUser/pengajuanTerlambatuserModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanTerlambatUserUserController = {
  getPengajuanTerlambatUser: async (req, res) => {
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
    if (status) obj.status = status;
    if (id_department) obj.id_department = id_department;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await PengajuanTerlambatUser.count({ where: obj });
        const data = await PengajuanTerlambatUser.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_atasan",
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
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          success: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await PengajuanTerlambatUser.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_atasan",
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
          ],
        });
        return res.status(200).json({
          success: true,
          status_code: 200,
          data: data,
        });
      } else {
        const data = await PengajuanTerlambatUser.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_atasan",
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
          ],
        });
        return res.status(200).json({
          success: true,
          status_code: 200,
          data: data,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },

  createPengajuanTerlambatUser: async (req, res) => {
    const {
      id_karyawan,
      tanggal,
      alasan_terlambat,
      lama_terlambat,
      shift,
      catatan,
      file,
      tipe_user, //untuk mengetahui ini bawahan atau atasan (bawahan, atasan)
    } = req.body;
    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "Karyawan Tidak ditemukan",
        });

      let status = "request atasan";

      if (tipe_user == "atasan") {
        status = "request manajemen";
      }

      const dataPengajuanTerlambatUser = await PengajuanTerlambatUser.create(
        {
          id_karyawan,
          id_department: dataKaryawanBiodata.id_department,
          tanggal,
          alasan_terlambat,
          lama_terlambat,
          shift,
          catatan,
          file,
          status,
        },
        { transaction: t },
      );
      await t.commit();
      res.status(200).json({
        success: true,
        status_code: 200,
        data: dataPengajuanTerlambatUser,
      });
    } catch (error) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },

  approvePengajuanTerlambatUser: async (req, res) => {
    const _id = req.params.id;
    const { catatan_atasan } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanTerlambatUser =
        await PengajuanTerlambatUser.findByPk(_id);
      if (!dataPengajuanTerlambatUser)
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "data tidak di temukan",
        });

      await PengajuanTerlambatUser.update(
        {
          status: "approved",
          status_tiket: "history",
          id_atasan: req.user.id_karyawan,
          catatan_atasan: catatan_atasan,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res
        .status(200)
        .json({ success: true, status_code: 200, msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },

  rejectPengajuanTerlambatUser: async (req, res) => {
    const _id = req.params.id;
    const { catatan_atasan } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanTerlambatUser =
        await PengajuanTerlambatUser.findByPk(_id);
      if (!dataPengajuanTerlambatUser)
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "data tidak di temukan",
        });
      await PengajuanTerlambatUser.update(
        {
          status: "rejected",
          status_tiket: "history",
          id_atasan: req.user.id_karyawan,
          catatan_atasan: catatan_atasan,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();

      res
        .status(200)
        .json({ success: true, status_code: 200, msg: "Reject Successfully" });
    } catch (error) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },
};

module.exports = PengajuanTerlambatUserUserController;
