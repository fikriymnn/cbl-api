const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../../model/hr/karyawanModel");
const OutstandingKaryawan = require("../../../../model/hr/outstanding/outstandingKaryawan/outstandingKaryawanModel");
const KaryawanBiodata = require("../../../../model/hr/karyawan/karyawanBiodataModel");
const JadwalKaryawan = require("../../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const MasterDepartment = require("../../../../model/masterData/hr/masterDeprtmentModel");
const MasterAbsensi = require("../../../../model/masterData/hr/masterAbsensiModel");
const { getAbsensiFunction } = require("../../../../helper/absenFunction");
const db = require("../../../../config/database");
const {
  converTanggalWithMonthName,
} = require("../../../../helper/tanggalConverterFunction");

const OutstandingKaryawanController = {
  getOutstandingKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, status, id_department, id_karyawan } =
      req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    if (status) obj.status = status;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (id_department) obj.id_department = id_department;
    try {
      if (page && limit) {
        const length = await OutstandingKaryawan.count({ where: obj });
        const data = await OutstandingKaryawan.findAll({
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
              model: MasterDepartment,
              as: "department",
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
        const data = await OutstandingKaryawan.findByPk(_id, {
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
              model: MasterDepartment,
              as: "department",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await OutstandingKaryawan.findAll({
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
              model: MasterDepartment,
              as: "department",
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

  getCronjobOutstandingKaryawan: async (req, res) => {
    const t = await db.transaction();
    let obj = {};
    obj.is_active = true;

    try {
      const masterAbsensi = await MasterAbsensi.findByPk(1);
      // Ambil tanggal hari ini
      const today = new Date();

      // Tambahkan jumlah hari mengambil dari master hari ke tanggal hari ini
      const DaysFromNow = new Date(today);
      DaysFromNow.setDate(
        today.getDate() + masterAbsensi.outstanding_karyawan_hari
      );

      const dataBiodataKaryawan = await KaryawanBiodata.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          is_active: true,
          tgl_keluar: {
            [Op.between]: [today, DaysFromNow],
          },
        },
      });
      console.log(DaysFromNow);

      for (let i = 0; i < dataBiodataKaryawan.length; i++) {
        const data = dataBiodataKaryawan[i];
        const tglKeluar = converTanggalWithMonthName(data.tgl_keluar);

        const checkData = await OutstandingKaryawan.count({
          where: { id_karyawan: data.id_karyawan, status: "incoming" },
        });

        if (checkData == 0) {
          await OutstandingKaryawan.create(
            {
              id_karyawan: data.id_karyawan,
              id_department: data.id_department,
              tanggal: new Date(),
              deskripsi: `kontrak kerja hampir selesai yang dimana berakhir pada tanggal ${tglKeluar}`,
              type: "kontrak kerja",
            },
            { transaction: t }
          );
        }
      }

      await t.commit();
      res.status(200).json({
        msg: "oke",
        data: dataBiodataKaryawan,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  doneOutstandingKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;
    const t = await db.transaction();

    try {
      const dataOutstandingKaryawan = await OutstandingKaryawan.findByPk(_id);
      if (!dataOutstandingKaryawan)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await OutstandingKaryawan.update(
        {
          status: "history",
          id_respon: req.user.id_karyawan,
          catatan: catatan,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({ msg: "Done Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = OutstandingKaryawanController;
