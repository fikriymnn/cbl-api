const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterCuti = require("../../../model/masterData/hr/masterCutiModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterJabatan = require("../../../model/masterData/hr/masterJabatanModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const DataSP = require("../../../model/hr/pengajuanSP/pengajuanSPModel");
const PinjamanKaryawan = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanPotongan = require("../../../model/hr/karyawan/karyawanPotonganModel");
const KaryawanBagianMesin = require("../../../model/hr/karyawan/karyawanBagianMesinModel");
const MasterStatusKaryawan = require("../../../model/masterData/hr/masterStatusKaryawanModel");
const HistoriPromosiStatusKaryawan = require("../../../model/hr/pengajuanPromosiStatusKaryawan/hisroryPromosiStatusKaryawanModel");
const HistoriPromosi = require("../../../model/hr/pengajuanPromosi/pengajuanPromosiHistoryModel");
const PengajuanCuti = require("../../../model/hr/pengajuanCuti/pengajuanCutiModel");
const PengajuanIzin = require("../../../model/hr/pengajuanIzin/pengajuanIzinModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const PengajuanMangkir = require("../../../model/hr/pengajuanMangkir/pengajuanMangkirModel");
const pengajuanTerlambat = require("../../../model/hr/pengajuanTerlambat/pengajuanTerlambatModel");
const pengajuanDinas = require("../../../model/hr/pengajuanDinas/pengajuanDinasModel");
const PengajuanSakit = require("../../../model/hr/pengajuanSakit/pengajuanSakitModel");
const db = require("../../../config/database");

const karyawanController = {
  getKaryawan: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      search,
      id_department,
      tipe_penggajian,
      is_active,
      is_cutoff,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    let obj2 = {};
    if (is_active && is_active == "true" && is_cutoff && is_cutoff == "true") {
      obj = { [Op.or]: [{ is_active: true }, { status_active: "cut off" }] };
    } else if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    } else if (is_cutoff && is_cutoff == "true") {
      obj.status_active = "cut off";
    }
    if (search)
      obj = {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    if (tipe_penggajian) obj.tipe_penggajian = tipe_penggajian;

    if (id_department) obj2.id_department = id_department;

    try {
      const startToday = new Date().setHours(0, 0, 0, 0);
      const endToday = new Date().setHours(23, 59, 59, 999);

      const karyawanBiodata = await KaryawanBiodata.findAll({
        where: obj,
      });

      const karyawanIds = karyawanBiodata.map((biodata) => biodata.id_karyawan);

      if (page && limit) {
        const length = await Karyawan.count({
          where: {
            userid: {
              [Op.in]: karyawanIds, // Gunakan array id_karyawan
            },
          },
        });
        const data = await Karyawan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
              where: obj2,
              required: true,
              include: [
                {
                  model: MasterDivisi,
                  as: "divisi",
                },
                {
                  model: KaryawanBagianMesin,
                  as: "bagian_mesin_karyawan",
                },
                {
                  model: MasterStatusKaryawan,
                  as: "status",
                },
                {
                  model: MasterDepartment,
                  as: "department",
                },
                {
                  model: MasterJabatan,
                  as: "jabatan",
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
            {
              model: PinjamanKaryawan,
              as: "pinjaman_karyawan",
              where: {
                status_pinjaman: "belum lunas",
              },
              required: false,
            },
            {
              model: DataSP,
              as: "sp_karyawan",
              required: false,
              where: {
                status: "approved",

                [Op.or]: [
                  {
                    dari: {
                      [Op.between]: [startToday, endToday],
                    },
                  }, // `from` berada dalam rentang
                  {
                    sampai: {
                      [Op.between]: [startToday, endToday],
                    },
                  }, // `to` berada dalam rentang
                  {
                    [Op.and]: [
                      {
                        dari: {
                          [Op.lte]: startToday,
                        },
                      }, // Rentang cuti mencakup startDate
                      {
                        sampai: {
                          [Op.gte]: endToday,
                        },
                      }, // Rentang cuti mencakup endDate
                    ],
                  },
                ],
              },
            },
          ],
          offset,
          where: {
            userid: {
              [Op.in]: karyawanIds, // Gunakan array id_karyawan
            },
          },
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
                  model: KaryawanPotongan,
                  as: "potongan_karyawan",
                },

                {
                  model: HistoriPromosiStatusKaryawan,
                  as: "histori_promosi_status_karyawan",
                  include: [
                    {
                      model: MasterStatusKaryawan,
                      as: "status_karyawan_awal",
                    },
                    {
                      model: MasterStatusKaryawan,
                      as: "status_karyawan_pengajuan",
                    },
                  ],
                },
                {
                  model: HistoriPromosi,
                  as: "histori_promosi",
                },
                {
                  model: MasterStatusKaryawan,
                  as: "status",
                },
                {
                  model: KaryawanBagianMesin,
                  as: "bagian_mesin_karyawan",
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
                  model: MasterJabatan,
                  as: "jabatan",
                },
                {
                  model: MasterGradeHr,
                  as: "grade",
                },
              ],
            },
          ],
        });

        const startToday = new Date().setHours(0, 0, 0, 0);
        const endToday = new Date().setHours(23, 59, 59, 999);

        const SpAktif = await DataSP.findAll({
          where: {
            status: "approved",
            id_karyawan: _id,
            [Op.or]: [
              {
                dari: {
                  [Op.between]: [startToday, endToday],
                },
              }, // `from` berada dalam rentang
              {
                sampai: {
                  [Op.between]: [startToday, endToday],
                },
              }, // `to` berada dalam rentang
              {
                [Op.and]: [
                  {
                    dari: {
                      [Op.lte]: startToday,
                    },
                  }, // Rentang cuti mencakup startDate
                  {
                    sampai: {
                      [Op.gte]: endToday,
                    },
                  }, // Rentang cuti mencakup endDate
                ],
              },
            ],
          },
        });

        return res.status(200).json({
          data: data,
          sp_aktif: SpAktif,
        });
      }
      // else if (id_department) {
      //   const data = await KaryawanBiodata.findAll({
      //     include: [
      //       {
      //         model: Karyawan,
      //         as: "karyawan",
      //         include: [
      //           {
      //             model: PinjamanKaryawan,
      //             as: "pinjaman_karyawan",
      //             where: {
      //               status_pinjaman: "belum lunas",
      //             },
      //             required: false,
      //           },
      //         ],
      //       },
      //       {
      //         model: MasterStatusKaryawan,
      //         as: "status",
      //       },
      //       {
      //         model: MasterDivisi,
      //         as: "divisi",
      //       },
      //       {
      //         model: MasterDepartment,
      //         as: "department",
      //       },
      //       {
      //         model: MasterBagianHr,
      //         as: "bagian",
      //       },
      //       {
      //         model: MasterJabatan,
      //         as: "jabatan",
      //       },
      //       {
      //         model: MasterGradeHr,
      //         as: "grade",
      //       },
      //     ],
      //     where: { id_department: id_department },
      //   });

      //   return res.status(200).json({
      //     data: data,
      //   });
      // }
      else {
        const data = await Karyawan.findAll({
          order: [["createdAt", "DESC"]],

          include: [
            {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
              where: obj2,
              required: true,
              include: [
                {
                  model: MasterDivisi,
                  as: "divisi",
                },
                {
                  model: KaryawanBagianMesin,
                  as: "bagian_mesin_karyawan",
                },
                {
                  model: MasterStatusKaryawan,
                  as: "status",
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
                  model: MasterGradeHr,
                  as: "grade",
                },
              ],
            },
            {
              model: PinjamanKaryawan,
              as: "pinjaman_karyawan",
              where: {
                status_pinjaman: "belum lunas",
              },
              required: false,
            },

            {
              model: DataSP,
              as: "sp_karyawan",
              required: false,
              where: {
                status: "approved",

                [Op.or]: [
                  {
                    dari: {
                      [Op.between]: [startToday, endToday],
                    },
                  }, // `from` berada dalam rentang
                  {
                    sampai: {
                      [Op.between]: [startToday, endToday],
                    },
                  }, // `to` berada dalam rentang
                  {
                    [Op.and]: [
                      {
                        dari: {
                          [Op.lte]: startToday,
                        },
                      }, // Rentang cuti mencakup startDate
                      {
                        sampai: {
                          [Op.gte]: endToday,
                        },
                      }, // Rentang cuti mencakup endDate
                    ],
                  },
                ],
              },
            },
          ],
          where: {
            userid: {
              [Op.in]: karyawanIds, // Gunakan array id_karyawan
            },
          },
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getKaryawanRekap: async (req, res) => {
    const _id = req.params.id;
    const { search, id_department, tipe_penggajian, is_active } = req.query;

    let obj = {};

    if (search)
      obj = {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    if (tipe_penggajian) obj.tipe_penggajian = tipe_penggajian;

    if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    }
    if (id_department) obj.id_department = id_department;

    try {
      const karyawanBiodata = await KaryawanBiodata.findAll({
        where: obj,
      });
      const karyawanIds = karyawanBiodata.map((biodata) => biodata.id_karyawan);
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
                model: MasterStatusKaryawan,
                as: "status",
              },
              {
                model: MasterDepartment,
                as: "department",
              },
              {
                model: MasterJabatan,
                as: "jabatan",
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

        where: {
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      const masterDivisi = await MasterDivisi.findAll();
      const masterDepartment = await MasterDepartment.findAll({
        where: { is_active: true },
      });
      const masterJabatan = await MasterJabatan.findAll();
      const mastergrade = await MasterGradeHr.findAll();
      const MasterStatus = await MasterStatusKaryawan.findAll();

      let rekap = {
        //divisi
        divisi: masterDivisi.map((divisi) => {
          return {
            id: divisi.id,
            nama: divisi.nama_divisi,
            jumlah: karyawanBiodata.filter((d) => d.id_divisi === divisi.id)
              .length,
          };
        }),
        //department
        department: masterDepartment.map((department) => {
          return {
            id: department.id,
            nama: department.nama_department,
            jumlah: karyawanBiodata.filter(
              (d) => d.id_department === department.id
            ).length,
          };
        }),
        //jabatan
        jabatan: masterJabatan.map((jabatan) => {
          return {
            id: jabatan.id,
            nama: jabatan.nama_jabatan,
            jumlah: karyawanBiodata.filter((d) => d.id_jabatan === jabatan.id)
              .length,
          };
        }),
        //grade
        status_karyawan: MasterStatus.map((status) => {
          return {
            id: status.id,
            nama: status.nama_status,
            jumlah: karyawanBiodata.filter(
              (d) => d.id_status_karyawan === status.id
            ).length,
          };
        }),
        //
        grade: mastergrade.map((grade) => {
          return {
            id: grade.id,
            nama: grade.kategori,
            jumlah: karyawanBiodata.filter((d) => d.id_grade === grade.id)
              .length,
          };
        }),
        //jenis karyawan
        tipe_karyawan: [
          {
            nama: "Staff",
            jumlah: karyawanBiodata.filter((d) => d.tipe_karyawan === "staff")
              .length,
          },
          {
            nama: "produksi",
            jumlah: karyawanBiodata.filter(
              (d) => d.tipe_karyawan === "produksi"
            ).length,
          },
        ],
        //tipe penggajian
        tipe_penggajian: [
          {
            nama: "Bulanan",
            jumlah: karyawanBiodata.filter(
              (d) => d.tipe_penggajian === "bulanan"
            ).length,
          },
          {
            nama: "Mingguan",
            jumlah: karyawanBiodata.filter(
              (d) => d.tipe_penggajian === "mingguan"
            ).length,
          },
        ],
        //tipe penggajian
        jenis_kelamin: [
          {
            nama: "Laki - Laki",
            jumlah: karyawanBiodata.filter(
              (d) => d.jenis_kelamin === "Laki-Laki"
            ).length,
          },
          {
            nama: "Perempuan",
            jumlah: karyawanBiodata.filter(
              (d) => d.jenis_kelamin === "Perempuan"
            ).length,
          },
        ],
      };

      return res.status(200).json({
        rekap: rekap,
        data: data,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getKaryawanPresensi: async (req, res) => {
    const { id_karyawan, start_date, end_date } = req.query;
    try {
      if (!id_karyawan)
        return res.status(404).json({ msg: "id_karyawan required" });
      if (!start_date)
        return res.status(404).json({ msg: "start_date required" });
      if (!end_date) return res.status(404).json({ msg: "end_date required" });

      const whereCalauseCutiTahunan = {
        id_karyawan: id_karyawan,
        status_tiket: "history",
        status: "approved",
        tipe_cuti: "tahunan",
        [Op.or]: [
          {
            dari: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `from` berada dalam rentang
          {
            sampai: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `to` berada dalam rentang
          {
            [Op.and]: [
              {
                dari: {
                  [Op.lte]: new Date(start_date).setHours(0, 0, 0, 0),
                },
              }, // Rentang cuti mencakup startDate
              {
                sampai: {
                  [Op.gte]: new Date(end_date).setHours(23, 59, 59, 999),
                },
              }, // Rentang cuti mencakup endDate
            ],
          },
        ],
      };
      const whereCalauseCutiKhusus = {
        id_karyawan: id_karyawan,
        status_tiket: "history",
        status: "approved",
        tipe_cuti: "khusus",
        [Op.or]: [
          {
            dari: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `from` berada dalam rentang
          {
            sampai: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `to` berada dalam rentang
          {
            [Op.and]: [
              {
                dari: {
                  [Op.lte]: new Date(start_date).setHours(0, 0, 0, 0),
                },
              }, // Rentang cuti mencakup startDate
              {
                sampai: {
                  [Op.gte]: new Date(end_date).setHours(23, 59, 59, 999),
                },
              }, // Rentang cuti mencakup endDate
            ],
          },
        ],
      };
      const lengthCutiTahunanHari = await PengajuanCuti.sum("jumlah_hari", {
        where: whereCalauseCutiTahunan,
      });
      const lengthCutiTahunanTiket = await PengajuanCuti.count({
        where: whereCalauseCutiTahunan,
      });
      const lengthCutiKhususHari = await PengajuanCuti.sum("jumlah_hari", {
        where: whereCalauseCutiKhusus,
      });
      const lengthCutiKhususTiket = await PengajuanCuti.count({
        where: whereCalauseCutiKhusus,
      });

      const whereCalauseIzin = {
        id_karyawan: id_karyawan,
        status_tiket: "history",
        status: "approved",
        [Op.or]: [
          {
            dari: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `from` berada dalam rentang
          {
            sampai: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `to` berada dalam rentang
          {
            [Op.and]: [
              {
                dari: {
                  [Op.lte]: new Date(start_date).setHours(0, 0, 0, 0),
                },
              }, // Rentang cuti mencakup startDate
              {
                sampai: {
                  [Op.gte]: new Date(end_date).setHours(23, 59, 59, 999),
                },
              }, // Rentang cuti mencakup endDate
            ],
          },
        ],
      };
      const lengthIzinHari = await PengajuanIzin.sum("jumlah_hari", {
        where: whereCalauseIzin,
      });
      const lengthIzinTiket = await PengajuanIzin.count({
        where: whereCalauseIzin,
      });

      const whereCalauseSakit = {
        id_karyawan: id_karyawan,
        status_tiket: "history",
        status: "approved",
        [Op.or]: [
          {
            dari: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `from` berada dalam rentang
          {
            sampai: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `to` berada dalam rentang
          {
            [Op.and]: [
              {
                dari: {
                  [Op.lte]: new Date(start_date).setHours(0, 0, 0, 0),
                },
              }, // Rentang cuti mencakup startDate
              {
                sampai: {
                  [Op.gte]: new Date(end_date).setHours(23, 59, 59, 999),
                },
              }, // Rentang cuti mencakup endDate
            ],
          },
        ],
      };
      const lengthSakitHari = await PengajuanSakit.sum("jumlah_hari", {
        where: whereCalauseSakit,
      });
      const lengthSakitTiket = await PengajuanSakit.count({
        where: whereCalauseSakit,
      });

      const whereCalauseDinas = {
        id_karyawan: id_karyawan,
        status_tiket: "history",
        status: "approved",
        [Op.or]: [
          {
            dari: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `from` berada dalam rentang
          {
            sampai: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          }, // `to` berada dalam rentang
          {
            [Op.and]: [
              {
                dari: {
                  [Op.lte]: new Date(start_date).setHours(0, 0, 0, 0),
                },
              }, // Rentang cuti mencakup startDate
              {
                sampai: {
                  [Op.gte]: new Date(end_date).setHours(23, 59, 59, 999),
                },
              }, // Rentang cuti mencakup endDate
            ],
          },
        ],
      };

      const lengthDinasHari = await pengajuanDinas.sum("jumlah_hari", {
        where: whereCalauseDinas,
      });
      const lengthDinasTiket = await pengajuanDinas.count({
        where: whereCalauseDinas,
      });

      const lengthMangkir = await PengajuanMangkir.count({
        where: {
          id_karyawan: id_karyawan,
          status_tiket: "history",
          status: "approved",
          tanggal: {
            [Op.between]: [
              new Date(start_date).setHours(0, 0, 0, 0),
              new Date(end_date).setHours(23, 59, 59, 999),
            ],
          },
        },
      });

      res.status(200).json({
        cuti_tahunan_hari: lengthCutiTahunanHari || 0,
        cuti_tahunan_tiket: lengthCutiTahunanTiket,
        cuti_khusus_hari: lengthCutiKhususHari || 0,
        cuti_khusus_tiket: lengthCutiKhususTiket,
        izin_hari: lengthIzinHari || 0,
        izin_tiket: lengthIzinTiket,
        sakit_hari: lengthSakitHari || 0,
        sakit_tiket: lengthSakitTiket,
        dinas_hari: lengthDinasHari || 0,
        dinas_tiket: lengthDinasTiket,
        mangkir_hari: lengthMangkir,
        mangkir_tiket: lengthMangkir,
      });
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
      id_jabatan,
      id_grade,
      id_status_karyawan,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      tipe_karyawan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
      gaji,
      kontrak_dari,
      kontrak_sampai,
      bagian_mesin,
    } = req.body;
    const t = await db.transaction();

    let jumlah_cuti = 0;

    if (id_status_karyawan == 1) {
      const masterCuti = await MasterCuti.findByPk(1);
      jumlah_cuti = masterCuti.jumlah_hari;
    }

    try {
      const dataJabatan = await MasterJabatan.findByPk(id_jabatan);
      if (!dataJabatan)
        return res.status(404).json({ msg: "data jabatan tidak di temukan" });
      const dataKaryawan = await Karyawan.create(
        {
          name: nama_karyawan,
        },
        { transaction: t }
      );
      // Setelah entitas dibuat, kita set badgenumber secara manual
      const formattedBadgeNumber = String(dataKaryawan.userid).padStart(9, "0");
      //console.log(formattedBadgeNumber);

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
          id_jabatan,
          id_grade,
          id_status_karyawan,
          tgl_masuk,
          tgl_keluar,
          tipe_penggajian,
          tipe_karyawan,
          nama_jabatan: dataJabatan.nama_jabatan,
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

      for (let i = 0; i < bagian_mesin.length; i++) {
        const data = bagian_mesin[i];
        await KaryawanBagianMesin.create(
          {
            id_karyawan: dataKaryawan.userid,
            id_biodata_karyawan: dataBiodata.id,
            id_bagian_mesin: data.id_bagian_mesin,
            nama_bagian_mesin: data.nama_bagian_mesin,
          },
          { transaction: t }
        );
      }

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
      id_jabatan,
      id_grade,
      id_status_karyawan,
      tgl_masuk,
      tgl_keluar,
      tipe_penggajian,
      tipe_karyawan,
      status_karyawan,
      status_pajak,
      level,
      sub_level,
      gaji,
      bagian_mesin,
    } = req.body;
    const t = await db.transaction();
    //console.log(_id);

    try {
      let obj = {};
      if (nik) obj.nik = nik;
      if (jenis_kelamin) obj.jenis_kelamin = jenis_kelamin;
      if (id_divisi) obj.id_divisi = id_divisi;
      if (id_department) obj.id_department = id_department;
      if (id_bagian) obj.id_bagian = id_bagian;
      if (id_grade) obj.id_grade = id_grade;
      if (id_status_karyawan) obj.id_status_karyawan = id_status_karyawan;
      if (tgl_masuk) obj.tgl_masuk = tgl_masuk;
      if (tgl_keluar) obj.tgl_keluar = tgl_keluar;
      if (tipe_penggajian) obj.tipe_penggajian = tipe_penggajian;
      if (tipe_karyawan) obj.tipe_karyawan = tipe_karyawan;
      if (status_karyawan) obj.status_karyawan = status_karyawan;
      if (status_pajak) obj.status_pajak = status_pajak;
      if (level) obj.level = level;
      if (sub_level) obj.sub_level = sub_level;
      if (gaji) obj.gaji = gaji;
      if (id_jabatan) {
        const dataJabatan = await MasterJabatan.findByPk(id_jabatan);
        if (!dataJabatan)
          return res.status(404).json({ msg: "data jabatan tidak di temukan" });

        obj.id_jabatan = id_jabatan;
        obj.nama_jabatan = dataJabatan.nama_jabatan;
      }
      await Karyawan.update(
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

      if (bagian_mesin) {
        for (let i = 0; i < bagian_mesin.length; i++) {
          const data = bagian_mesin[i];
          await KaryawanBagianMesin.update(
            {
              id_bagian_mesin: data.id_bagian_mesin,
              nama_bagian_mesin: data.nama_bagian_mesin,
            },
            { where: { id: data.id }, transaction: t }
          );
        }
      }

      await t.commit();
      res.status(200).json({
        msg: "Update Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  cutOffKaryawan: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      await KaryawanBiodata.update(
        {
          is_active: false,
          status_active: "cut off",
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
        msg: "Delete Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  deleteKaryawan: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      await KaryawanBiodata.update(
        {
          is_active: false,
          status_active: "non active",
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
        msg: "Delete Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = karyawanController;
