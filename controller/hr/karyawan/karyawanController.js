const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterCuti = require("../../../model/masterData/hr/masterCutiModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const PinjamanKaryawan = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const db = require("../../../config/database");

const karyawanController = {
  getKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, id_department } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search)
      obj = {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    try {
      if (page && limit) {
        const length = await Karyawan.count({ where: obj });
        const data = await Karyawan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
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
                  model: MasterGradeHr,
                  as: "grade",
                },
              ],
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
        const data = await Karyawan.findByPk(_id, {
          include: [
            {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
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
                  model: MasterGradeHr,
                  as: "grade",
                },
              ],
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else if (id_department) {
        const data = await KaryawanBiodata.findAll({
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: PinjamanKaryawan,
                  as: "pinjaman_karyawan",
                  where: {
                    status_pinjaman: "belum lunas",
                  },
                  required: false,
                },
              ],
            },
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
              model: MasterGradeHr,
              as: "grade",
            },
          ],
          where: { id_department: id_department },
        });

        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await Karyawan.findAll({
          order: [["createdAt", "DESC"]],

          include: [
            {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
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
                  model: MasterGradeHr,
                  as: "grade",
                },
              ],
            },
          ],

          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createKaryawan: async (req, res) => {
    const {
      nama_karyawan,
      nik,
      jenis_kelamin,
      id_divisi,
      id_department,
      id_bagian,
      id_grade,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      jabatan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
      gaji,
      kontrak_dari,
      kontrak_sampai,
    } = req.body;
    const t = await db.transaction();

    let jumlah_cuti = 0;

    if (status_karyawan == "tetap") {
      const masterCuti = await MasterCuti.findByPk(1);
      jumlah_cuti = masterCuti.jumlah_hari;
    }

    try {
      const dataKaryawan = await Karyawan.create(
        {
          name: nama_karyawan,
        },
        { transaction: t }
      );
      // Setelah entitas dibuat, kita set badgenumber secara manual
      const formattedBadgeNumber = String(dataKaryawan.userid).padStart(9, "0");
      console.log(formattedBadgeNumber);

      // Simpan perubahan
      const dataKaryawanupdate = await Karyawan.update(
        {
          badgenumber: formattedBadgeNumber,
        },
        { where: { userid: dataKaryawan.userid }, transaction: t }
      );
      const dataBiodata = await KaryawanBiodata.create(
        {
          id_karyawan: dataKaryawan.userid,
          nik,
          jenis_kelamin,
          id_divisi,
          id_department,
          id_bagian,
          id_grade,
          tgl_masuk,
          tgl_keluar,
          tipe_penggajian,
          jabatan,
          status_karyawan,
          status_pajak,
          level,
          sub_level,
          sisa_cuti: jumlah_cuti,
          gaji,
          kontrak_dari,
          kontrak_sampai,
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({
        data: dataBiodata,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateKaryawan: async (req, res) => {
    const _id = req.params.id;
    const {
      nama_karyawan,
      nik,
      jenis_kelamin,
      id_divisi,
      id_department,
      id_bagian,
      id_grade,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      jabatan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
      gaji,
    } = req.body;
    const t = await db.transaction();
    let obj = {};

    if (nik) obj.nik = nik;
    if (jenis_kelamin) obj.jenis_kelamin = jenis_kelamin;
    if (id_divisi) obj.id_divisi = id_divisi;
    if (id_department) obj.id_department = id_department;
    if (id_bagian) obj.id_bagian = id_bagian;
    if (id_grade) obj.id_grade = id_grade;
    if (tgl_masuk) obj.tgl_masuk = tgl_masuk;
    if (tgl_keluar) obj.tgl_keluar = tgl_keluar;
    if (tipe_penggajian) obj.tipe_penggajian = tipe_penggajian;
    if (jabatan) obj.jabatan = jabatan;
    if (status_karyawan) obj.status_karyawan = status_karyawan;
    if (status_pajak) obj.status_pajak = status_pajak;
    if (level) obj.level = level;
    if (sub_level) obj.sub_level = sub_level;
    if (gaji) obj.gaji = gaji;

    try {
      const dataKaryawan = await Karyawan.update(
        {
          name: nama_karyawan,
        },

        {
          where: {
            userid: _id,
          },
          transaction: t,
        }
      );
      await KaryawanBiodata.update(obj, {
        where: {
          id_karyawan: _id,
        },
        transaction: t,
      });

      await t.commit();
      res.status(200).json({
        msg: "Update Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = karyawanController;
