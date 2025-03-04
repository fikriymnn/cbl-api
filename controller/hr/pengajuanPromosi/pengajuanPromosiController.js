const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanPromosi = require("../../../model/hr/pengajuanPromosi/pengajuanPromosiModel");
const PengajuanPromosiHistori = require("../../../model/hr/pengajuanPromosi/pengajuanPromosiHistoryModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterJabatan = require("../../../model/masterData/hr/masterJabatanModel");
const MasterGrade = require("../../../model/masterData/hr/masterGradeModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanPromosiController = {
  getPengajuanPromosi: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, status_tiket, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    if (status_tiket) obj.status_tiket = status_tiket;
    if (type) obj.type = type;
    try {
      if (page && limit) {
        const length = await PengajuanPromosi.count({ where: obj });
        const data = await PengajuanPromosi.findAll({
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
                },
              ],
            },

            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
            {
              model: MasterDepartment,
              as: "department_promosi",
            },
            {
              model: MasterDivisi,
              as: "divisi_promosi",
            },
            {
              model: MasterJabatan,
              as: "jabatan_promosi",
            },
            {
              model: MasterGrade,
              as: "grade_promosi",
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
        const data = await PengajuanPromosi.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },

            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
            {
              model: MasterDepartment,
              as: "department_promosi",
            },
            {
              model: MasterDivisi,
              as: "divisi_promosi",
            },
            {
              model: MasterJabatan,
              as: "jabatan_promosi",
            },
            {
              model: MasterGrade,
              as: "grade_promosi",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PengajuanPromosi.findAll({
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
                },
              ],
            },

            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
            {
              model: MasterDepartment,
              as: "department_promosi",
            },
            {
              model: MasterDivisi,
              as: "divisi_promosi",
            },
            {
              model: MasterJabatan,
              as: "jabatan_promosi",
            },
            {
              model: MasterGrade,
              as: "grade_promosi",
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

  createPengajuanPromosi: async (req, res) => {
    const {
      id_karyawan,
      id_pengaju,
      id_department_promosi,
      id_jabatan_promosi,
      id_divisi_promosi,
      id_grade_promosi,
      gaji_promosi,
      masa_kerja,
      alasan_promosi,
      type,
    } = req.body;

    const t = await db.transaction();

    try {
      if (id_department_promosi) {
        const department = await MasterDepartment.findByPk(
          id_department_promosi
        );
        if (!department) {
          return res.status(404).json({
            msg: "department promosi tidak di temukan",
          });
        }
      }

      if (id_divisi_promosi) {
        const Divisi = await MasterDivisi.findByPk(id_divisi_promosi);
        if (!Divisi) {
          return res.status(404).json({
            msg: "Divisi promosi tidak di temukan",
          });
        }
      }

      if (id_jabatan_promosi) {
        const Jabatan = await MasterJabatan.findByPk(id_jabatan_promosi);
        if (!Jabatan) {
          return res.status(404).json({
            msg: "Jabatan promosi tidak di temukan",
          });
        }
      }

      if (id_grade_promosi) {
        const grade = await MasterGrade.findByPk(id_grade_promosi);
        if (!grade) {
          return res.status(404).json({
            msg: "grade promosi tidak di temukan",
          });
        }
      }
      const dataKaryawan = await KaryawanBiodata.findOne({
        include: [
          {
            model: MasterDivisi,
            as: "divisi",
          },
          {
            model: MasterDepartment,
            as: "department",
          },
          {
            model: MasterBagianHr,
            as: "bagian",
          },
          {
            model: MasterJabatan,
            as: "jabatan",
          },
          {
            model: MasterGrade,
            as: "grade",
          },
        ],

        where: { id_karyawan: id_karyawan },
      });

      const dataPengaju = await KaryawanBiodata.findOne({
        include: [
          {
            model: MasterDivisi,
            as: "divisi",
          },
          {
            model: MasterDepartment,
            as: "department",
          },
          {
            model: MasterBagianHr,
            as: "bagian",
          },
          {
            model: MasterJabatan,
            as: "jabatan",
          },
        ],

        where: { id_karyawan: id_pengaju },
      });

      if (!dataKaryawan)
        return res.status(404).json({ msg: "Karyawan Tidak ditemukan" });

      if (!dataPengaju)
        return res.status(404).json({ msg: "Pengaju Tidak ditemukan" });
      const dataPengajuanPromosi = await PengajuanPromosi.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          department_pengaju: dataPengaju.department.nama_department ?? null,
          jabatan_pengaju: dataPengaju.jabatan.nama_jabatan ?? null,
          divisi_pengaju: dataPengaju.divisi.nama_divisi ?? null,
          department_awal: dataKaryawan.department.nama_department ?? null,
          jabatan_awal: dataKaryawan.jabatan.nama_jabatan ?? null,
          divisi_awal: dataKaryawan.divisi.nama_divisi ?? null,
          grade_awal: dataKaryawan.grade.kategori ?? null,
          gaji_awal: dataKaryawan.gaji,
          id_department_promosi,
          id_jabatan_promosi,
          id_divisi_promosi,
          id_grade_promosi,
          gaji_promosi,
          masa_kerja,
          alasan_promosi,
          type,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(200).json({
        data: dataPengajuanPromosi,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanPromosi: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;

    const t = await db.transaction();

    try {
      let departmentPromosi = null;
      let divisiPromosi = null;
      let jabatanPromosi = null;
      let gradePromosi = null;
      let gajiPromosi = null;
      const dataPengajuanPromosi = await PengajuanPromosi.findByPk(_id);

      if (!dataPengajuanPromosi)
        return res.status(404).json({ msg: "data tidak di temukan" });

      if (dataPengajuanPromosi.id_department_promosi) {
        const department = await MasterDepartment.findByPk(
          dataPengajuanPromosi.id_department_promosi
        );
        if (!department) {
          return res.status(404).json({
            msg: "department promosi tidak di temukan",
          });
        }
        departmentPromosi = department.nama_department;
      }

      if (dataPengajuanPromosi.id_divisi_promosi) {
        const Divisi = await MasterDivisi.findByPk(
          dataPengajuanPromosi.id_divisi_promosi
        );
        if (!Divisi) {
          return res.status(404).json({
            msg: "Divisi promosi tidak di temukan",
          });
        }
        divisiPromosi = Divisi.nama_divisi;
      }

      if (dataPengajuanPromosi.id_jabatan_promosi) {
        const Jabatan = await MasterJabatan.findByPk(
          dataPengajuanPromosi.id_jabatan_promosi
        );
        if (!Jabatan) {
          return res.status(404).json({
            msg: "Jabatan promosi tidak di temukan",
          });
        }
        jabatanPromosi = Jabatan.nama_jabatan;
      }

      if (dataPengajuanPromosi.id_grade_promosi) {
        const grade = await MasterGrade.findByPk(
          dataPengajuanPromosi.id_grade_promosi
        );
        if (!grade) {
          return res.status(404).json({
            msg: "grade promosi tidak di temukan",
          });
        }
        gradePromosi = grade.kategori;
      }

      if (dataPengajuanPromosi.gaji_promosi) {
        gajiPromosi = dataPengajuanPromosi.gaji_promosi;
      }
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: dataPengajuanPromosi.id_karyawan },
      });

      let obj = {};
      if (dataPengajuanPromosi.id_department_promosi)
        obj.id_department = dataPengajuanPromosi.id_department_promosi;
      if (dataPengajuanPromosi.id_divisi_promosi)
        obj.id_divisi = dataPengajuanPromosi.id_divisi_promosi;
      if (dataPengajuanPromosi.id_jabatan_promosi)
        obj.id_jabatan = dataPengajuanPromosi.id_jabatan_promosi;
      if (dataPengajuanPromosi.id_grade_promosi)
        obj.id_grade = dataPengajuanPromosi.id_grade_promosi;
      if (dataPengajuanPromosi.gaji_promosi)
        obj.gaji = dataPengajuanPromosi.gaji_promosi;

      await PengajuanPromosi.update(
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

      await KaryawanBiodata.update(obj, {
        where: { id: dataPengajuanPromosi.id_karyawan },
        transaction: t,
      });

      await PengajuanPromosiHistori.create(
        {
          id_karyawan: dataKaryawanBiodata.id_karyawan,
          id_biodata_karyawan: dataKaryawanBiodata.id,
          id_pengajuan_promosi: _id,
          department_awal: dataPengajuanPromosi.department_awal,
          jabatan_awal: dataPengajuanPromosi.jabatan_awal,
          divisi_awal: dataPengajuanPromosi.divisi_awal,
          grade_awal: dataPengajuanPromosi.grade_awal,
          gaji_awal: dataPengajuanPromosi.gaji_awal,
          department_promosi: departmentPromosi,
          jabatan_promosi: jabatanPromosi,
          divisi_promosi: divisiPromosi,
          grade_promosi: gradePromosi,
          gaji_promosi: gajiPromosi,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectPengajuanPromosi: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanPromosi = await PengajuanPromosi.findByPk(_id);
      if (!dataPengajuanPromosi)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanPromosi.update(
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

module.exports = PengajuanPromosiController;
