const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanKaryawan = require("../../../model/hr/pengajuanKaryawan/pengajuanKaryawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterJabatan = require("../../../model/masterData/hr/masterJabatanModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanKaryawanController = {
  getPengajuanKaryawan: async (req, res) => {
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
        const length = await PengajuanKaryawan.count({ where: obj });
        const data = await PengajuanKaryawan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
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
            {
              model: MasterDepartment,
              as: "department",
            },
            {
              model: MasterJabatan,
              as: "jabatan",
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
        const data = await PengajuanKaryawan.findByPk(_id, {
          include: [
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
            {
              model: MasterDepartment,
              as: "department",
            },
            {
              model: MasterJabatan,
              as: "jabatan",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PengajuanKaryawan.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
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
            {
              model: MasterDepartment,
              as: "department",
            },
            {
              model: MasterJabatan,
              as: "jabatan",
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

  createPengajuanKaryawan: async (req, res) => {
    const {
      id_pengaju,
      untuk_id_department,
      untuk_id_jabatan,
      jumlah_dibutuhkan,
      jenis_kelamin,
      pendidikan,
      usia,
      pengalaman,
      syarat_khusus,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_pengaju },
      });

      if (!dataKaryawanBiodata)
        return res
          .status(404)
          .json({ msg: "Karyawan pengaju Tidak ditemukan" });

      const dataDepartment = await MasterDepartment.findByPk(
        untuk_id_department
      );
      if (!dataDepartment)
        return res.status(404).json({ msg: "Department Tidak ditemukan" });

      const dataJabatan = await MasterDepartment.findByPk(untuk_id_jabatan);
      if (!dataJabatan)
        return res.status(404).json({ msg: "Jabatan Tidak ditemukan" });
      const dataPengajuanKaryawan = await PengajuanKaryawan.create(
        {
          id_pengaju: id_pengaju,
          untuk_id_department,
          untuk_id_jabatan,
          untuk_department: dataDepartment.nama_department,
          untuk_jabatan: dataJabatan.nama_jabatan,
          jumlah_dibutuhkan,
          jenis_kelamin,
          pendidikan,
          usia,
          pengalaman,
          syarat_khusus,
          diajukan_tanggal: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanKaryawan,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanKaryawan = await PengajuanKaryawan.findByPk(_id);
      if (!dataPengajuanKaryawan)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanKaryawan.update(
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

  rejectPengajuanKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanKaryawan = await PengajuanKaryawan.findByPk(_id);
      if (!dataPengajuanKaryawan)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanKaryawan.update(
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

module.exports = PengajuanKaryawanController;
