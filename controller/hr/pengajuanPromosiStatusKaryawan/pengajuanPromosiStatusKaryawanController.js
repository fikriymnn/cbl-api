const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const MasterStatusKaryawan = require("../../../model/masterData/hr/masterStatusKaryawanModel");
const PengajuanStatusKaryawan = require("../../../model/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanModel");
const HistoriPengajuanStatusKaryawan = require("../../../model/hr/pengajuanPromosiStatusKaryawan/hisroryPromosiStatusKaryawanModel");
const PengajuanStatusKaryawanPenilaian = require("../../../model/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanPenilaianModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const db = require("../../../config/database");

const PengajuanStatusKaryawanController = {
  getPengajuanStatusKaryawan: async (req, res) => {
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
        const length = await PengajuanStatusKaryawan.count({ where: obj });
        const data = await PengajuanStatusKaryawan.findAll({
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
              model: PengajuanStatusKaryawanPenilaian,
              as: "penilaian",
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
                    // {
                    //   model: MasterDepartment,
                    //   as: "department",
                    // },
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
        const data = await PengajuanStatusKaryawan.findByPk(_id, {
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
              model: PengajuanStatusKaryawanPenilaian,
              as: "penilaian",
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
        const data = await PengajuanStatusKaryawan.findAll({
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
              model: PengajuanStatusKaryawanPenilaian,
              as: "penilaian",
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

  createPengajuanStatusKaryawan: async (req, res) => {
    const {
      id_karyawan,
      id_pengaju,
      periode_awal,
      periode_akhir,
      jumlah_alpa,
      jumlah_izin,
      jumlah_tanpa_keterangan,
      jumlah_keterlambatan,
      peringatan_ke_1,
      peringatan_ke_2,
      peringatan_ke_3,
      prestasi_kerja,
      prestasi_kerja_point,
      kesan_penilai,
      penilaian,
    } = req.body;

    const t = await db.transaction();

    try {
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
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

        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
      const dataPengajuanStatusKaryawan = await PengajuanStatusKaryawan.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          id_department: dataKaryawanBiodata.id_department,
          id_status_karyawan_awal: dataKaryawanBiodata.id_status_karyawan,
          department: dataKaryawanBiodata.department.nama_department,
          divisi: dataKaryawanBiodata.divisi.nama_divisi,
          jabatan: dataKaryawanBiodata.jabatan,
          tgl_masuk_kerja: dataKaryawanBiodata.tgl_masuk,
          periode_awal,
          periode_akhir,
          jumlah_alpa,
          jumlah_izin,
          jumlah_tanpa_keterangan,
          jumlah_keterlambatan,
          peringatan_ke_1,
          peringatan_ke_2,
          peringatan_ke_3,
          prestasi_kerja,
          prestasi_kerja_point,
          kesan_penilai,
        },
        { transaction: t }
      );

      for (let i = 0; i < penilaian.length; i++) {
        const data = penilaian[i];
        await PengajuanStatusKaryawanPenilaian.create(
          {
            id_pengajuan_promosi_status_karyawan:
              dataPengajuanStatusKaryawan.id,
            nama_point: data.nama_point,
            deskripsi: data.deskripsi,
            keterangan: data.keterangan,
            hasil_penilaian: data.hasil_penilaian,
            point_penilaian: data.point_penilaian,
          },
          { transaction: t }
        );
      }
      await t.commit();
      res.status(200).json({
        data: dataPengajuanStatusKaryawan,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanStatusKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr, id_status_karyawan_pengajuan, tgl_keluar } = req.body;

    const t = await db.transaction();

    try {
      const dataPengajuanStatusKaryawan =
        await PengajuanStatusKaryawan.findByPk(_id);

      if (!dataPengajuanStatusKaryawan)
        return res.status(404).json({ msg: "data tidak di temukan" });
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: dataPengajuanStatusKaryawan.id_karyawan },
      });

      await PengajuanStatusKaryawan.update(
        {
          status: "approved",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
          id_status_karyawan_pengajuan: id_status_karyawan_pengajuan,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      if (dataPengajuanStatusKaryawan.id_status_karyawan_pengajuan == 1) {
        await KaryawanBiodata.update(
          {
            id_status_karyawan: id_status_karyawan_pengajuan,
            tgl_keluar: null,
            sisa_cuti: 12,
          },
          {
            where: { id: dataPengajuanStatusKaryawan.id_karyawan },
            transaction: t,
          }
        );
      } else if (
        dataPengajuanStatusKaryawan.id_status_karyawan_pengajuan == 2
      ) {
        await KaryawanBiodata.update(
          {
            id_status_karyawan: id_status_karyawan_pengajuan,
            is_active: false,
            sisa_cuti: 0,
            status_active: "keluar",
          },
          {
            where: { id: dataPengajuanStatusKaryawan.id_karyawan },
            transaction: t,
          }
        );
      } else {
        await KaryawanBiodata.update(
          {
            id_status_karyawan: id_status_karyawan_pengajuan,
            tgl_keluar: tgl_keluar,
          },
          {
            where: { id: dataPengajuanStatusKaryawan.id_karyawan },
            transaction: t,
          }
        );
      }

      await HistoriPengajuanStatusKaryawan.create(
        {
          id_karyawan: dataPengajuanStatusKaryawan.id_karyawan,
          id_biodata_karyawan: dataKaryawanBiodata.id,
          id_pengajuan_promosi_status_karyawan: dataPengajuanStatusKaryawan.id,
          id_status_karyawan_awal:
            dataPengajuanStatusKaryawan.id_status_karyawan_awal,
          id_status_karyawan_pengajuan: id_status_karyawan_pengajuan,
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

  rejectPengajuanStatusKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanStatusKaryawan =
        await PengajuanStatusKaryawan.findByPk(_id);
      if (!dataPengajuanStatusKaryawan)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanStatusKaryawan.update(
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

module.exports = PengajuanStatusKaryawanController;
