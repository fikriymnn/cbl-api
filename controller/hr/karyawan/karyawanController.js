const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterCuti = require("../../../model/masterData/hr/masterCutiModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
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
      grade,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      jabatan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
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
      const dataBiodata = await KaryawanBiodata.create(
        {
          id_karyawan: dataKaryawan.USERID,
          nik,
          jenis_kelamin,
          id_divisi,
          id_department,
          id_bagian,
          grade,
          tgl_masuk,
          tgl_keluar,
          tipe_penggajian,
          jabatan,
          status_karyawan,
          status_pajak,
          level,
          sub_level,
          sisa_cuti: jumlah_cuti,
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
      grade,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      jabatan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataKaryawan = await Karyawan.update(
        {
          name: nama_karyawan,
        },

        {
          where: {
            USERID: _id,
          },
          transaction: t,
        }
      );
      const dataBiodata = await KaryawanBiodata.update(
        {
          nik,
          jenis_kelamin,
          id_divisi,
          id_department,
          id_bagian,
          grade,
          tgl_masuk,
          tgl_keluar,
          tipe_penggajian,
          jabatan,
          status_karyawan,
          status_pajak,
          level,
          sub_level,
        },
        {
          where: {
            id_karyawan: _id,
          },
          transaction: t,
        }
      );

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
