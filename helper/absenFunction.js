const dbFinger = require("../config/databaseFinger");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../model/hr/absenModel");
const Karyawan = require("../model/hr/karyawanModel");
const KaryawanBiodata = require("../model/hr/karyawan/karyawanBiodataModel");
const masterShift = require("../model/masterData/hr/masterShift/masterShiftModel");
const MasterDepartment = require("../model/masterData/hr/masterDeprtmentModel");
const MasterDivisi = require("../model/masterData/hr/masterDivisiModel");
const MasterAbsensi = require("../model/masterData/hr/masterAbsensiModel");
const DataCuti = require("../model/hr/pengajuanCuti/pengajuanCutiModel");
const DataIzin = require("../model/hr/pengajuanIzin/pengajuanIzinModel");
const DataDinas = require("../model/hr/pengajuanDinas/pengajuanDinasModel");
const DataSakit = require("../model/hr/pengajuanSakit/pengajuanSakitModel");
const DataMangkir = require("../model/hr/pengajuanMangkir/pengajuanMangkirModel");
const DataTerlambat = require("../model/hr/pengajuanTerlambat/pengajuanTerlambatModel");
const DataPulangCepat = require("../model/hr/pengajuanPulangCepat/pengajuanPulangCepatModel");
const DataLembur = require("../model/hr/pengajuanLembur/pengajuanLemburModel");
const JadwalKaryawan = require("../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const masterIstirahat = require("../model/masterData/hr/masterShift/masterIstirahatModel");

const absenFunction = {
  getAbsensiFunction: async (startDate, endDate, obj, isLibur) => {
    // 1. Fetch master data and karyawan biodata in parallel
    const [
      masterAbsensi,
      masterDepartment,
      masterDivisi,
      karyawanBiodata,
      dataJadwalKaryawan,
    ] = await Promise.all([
      MasterAbsensi.findByPk(1),
      MasterDepartment.findAll(),
      MasterDivisi.findAll(),
      KaryawanBiodata.findAll({ where: obj }),
      JadwalKaryawan.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          tanggal: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      }),
    ]);

    const karyawanIds = karyawanBiodata.map((b) => b.id_karyawan);

    // 2. Fetch karyawan in parallel
    const karyawan = await Karyawan.findAll({
      where: { userid: { [Op.in]: karyawanIds } },
    });

    // let absensiMasuk = [];
    // let absensiKeluar = [];
    // let dataCuti = [];
    // let dataIzin = [];
    // let dataDinas = [];
    // let dataSakit = [];
    // let dataMangkir = [];
    // let dataTerlambat = [];
    // let dataPulangCepat = [];
    // let dataLembur = [];

    // buat tanggal sesuai format
    const resultJadwalKaryawan = dataJadwalKaryawan.map((jadwal) => {
      const dateJadwal = new Date(jadwal.tanggal);
      const day = dateJadwal.getDate();
      const month = getMonthName((dateJadwal.getMonth() + 1).toString());
      const year = dateJadwal.getFullYear();

      return {
        tanggal_libur: `${day}-${month}-${year}`,
        ...jadwal.toJSON(),
      };
    });

    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ msg: "start date atau end date wajib di isi" });

    const fromDateUTC = new Date(`${startDate}T00:00:00.000Z`); // Awal hari UTC
    const toDateMasukUTC = new Date(`${endDate}T23:59:59.999Z`);
    const dateKeluar = new Date(endDate);
    dateKeluar.setDate(dateKeluar.getDate() + 1);
    const nextDay = dateKeluar.toISOString().split("T")[0];
    const toDateKeluarUTC = new Date(`${nextDay}T23:59:59.999Z`);
    const endTargetDate = new Date(endDate);
    endTargetDate.setDate(endTargetDate.getDate() + 1); // tambah 1 hari
    endTargetDate.setHours(10, 0, 0, 0); // set jam 10:00:00.000

    const [
      absensiMasuk,
      absensiKeluar,
      dataCuti,
      dataIzin,
      dataDinas,
      dataSakit,
      dataMangkir,
      dataTerlambat,
      dataPulangCepat,
      dataLembur,
    ] = await Promise.all([
      absensi.findAll({
        where: {
          checktype: "0",
          is_active: true,
          checktime: { [Op.between]: [fromDateUTC, toDateMasukUTC] },
          userid: { [Op.in]: karyawanIds },
        },
      }),
      absensi.findAll({
        where: {
          checktype: "1",
          is_active: true,
          checktime: { [Op.between]: [fromDateUTC, toDateKeluarUTC] },
          userid: { [Op.in]: karyawanIds },
        },
      }),
      DataCuti.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          [Op.or]: [
            {
              dari: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `from` berada dalam rentang
            {
              sampai: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `to` berada dalam rentang
            {
              [Op.and]: [
                {
                  dari: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                  },
                }, // Rentang cuti mencakup startDate
                {
                  sampai: {
                    [Op.gte]: new Date(endDate).setHours(23, 59, 59, 999),
                  },
                }, // Rentang cuti mencakup endDate
              ],
            },
          ],
        },
      }),
      DataIzin.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          [Op.or]: [
            {
              dari: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `from` berada dalam rentang
            {
              sampai: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `to` berada dalam rentang
            {
              [Op.and]: [
                {
                  dari: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                  },
                }, // Rentang cuti mencakup startDate
                {
                  sampai: {
                    [Op.gte]: new Date(endDate).setHours(23, 59, 59, 999),
                  },
                }, // Rentang cuti mencakup endDate
              ],
            },
          ],
        },
      }),
      DataDinas.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          [Op.or]: [
            {
              dari: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `from` berada dalam rentang
            {
              sampai: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `to` berada dalam rentang
            {
              [Op.and]: [
                {
                  dari: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                  },
                }, // Rentang cuti mencakup startDate
                {
                  sampai: {
                    [Op.gte]: new Date(endDate).setHours(23, 59, 59, 999),
                  },
                }, // Rentang cuti mencakup endDate
              ],
            },
          ],
        },
      }),
      DataSakit.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          [Op.or]: [
            {
              dari: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `from` berada dalam rentang
            {
              sampai: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  new Date(endDate).setHours(23, 59, 59, 999),
                ],
              },
            }, // `to` berada dalam rentang
            {
              [Op.and]: [
                {
                  dari: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                  },
                }, // Rentang cuti mencakup startDate
                {
                  sampai: {
                    [Op.gte]: new Date(endDate).setHours(23, 59, 59, 999),
                  },
                }, // Rentang cuti mencakup endDate
              ],
            },
          ],
        },
      }),
      DataMangkir.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          tanggal: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      }),
      DataTerlambat.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          tanggal: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      }),
      DataPulangCepat.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          tanggal: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      }),
      DataLembur.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
          [Op.or]: [
            {
              dari: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  endTargetDate,
                ],
              },
            }, // `from` berada dalam rentang
            {
              sampai: {
                [Op.between]: [
                  new Date(startDate).setHours(0, 0, 0, 0),
                  endTargetDate,
                ],
              },
            }, // `to` berada dalam rentang
            {
              [Op.and]: [
                {
                  dari: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                  },
                }, // Rentang cuti mencakup startDate
                {
                  sampai: {
                    [Op.gte]: endTargetDate,
                  },
                }, // Rentang cuti mencakup endDate
              ],
            },
          ],
        },
      }),
    ]);

    //console.log(absensiMasuk);

    // dataLembur = await DataLembur.findAll({
    //   where: {
    //     status: "approved",
    //     id_karyawan: {
    //       [Op.in]: karyawanIds, // Gunakan array id_karyawan
    //     },
    //   },
    // });

    //console.log(resultJadwalKaryawan);

    // Memecah cuti menjadi entri harian
    let cutiEntries = [];
    dataCuti.forEach((cuti) => {
      cutiEntries = [
        ...cutiEntries,
        ...generateDailyCuti(
          cuti,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan,
          startDate,
          endDate
        ),
      ];
    });

    // Memecah izin menjadi entri harian
    let izinEntries = [];
    dataIzin.forEach((izin) => {
      izinEntries = [
        ...izinEntries,
        ...generateDailyIzin(
          izin,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    // Memecah dinas menjadi entri harian
    let dinasEntries = [];
    dataDinas.forEach((dinas) => {
      dinasEntries = [
        ...dinasEntries,
        ...generateDailyDinas(
          dinas,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    // Memecah sakit menjadi entri harian
    let sakitEntries = [];
    dataSakit.forEach((sakit) => {
      sakitEntries = [
        ...sakitEntries,
        ...generateDailySakit(
          sakit,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan,
          startDate,
          endDate
        ),
      ];
    });

    // Memecah mangkir menjadi entri harian
    let mangkirEntries = [];
    dataMangkir.forEach((mangkir) => {
      mangkirEntries = [
        ...mangkirEntries,
        ...generateDailyMangkir(
          mangkir,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    // Memecah terlamabt menjadi entri harian
    let terlambatEntries = [];
    dataTerlambat.forEach((terlambat) => {
      terlambatEntries = [
        ...terlambatEntries,
        ...generateDailyTerlambat(
          terlambat,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    // Memecah terlamabt menjadi entri harian
    let pulangCepatEntries = [];
    dataPulangCepat.forEach((pulangCepat) => {
      pulangCepatEntries = [
        ...pulangCepatEntries,
        ...generateDailyPulangCepat(
          pulangCepat,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    let lemburEntries = [];
    dataLembur.forEach((lembur) => {
      lemburEntries = [
        ...lemburEntries,
        ...generateDailyLembur(
          lembur,
          karyawan,
          karyawanBiodata,
          masterDepartment,
          masterDivisi,
          resultJadwalKaryawan
        ),
      ];
    });

    //console.log(4);

    // Ambil shift untuk semua hari
    const shifts = await masterShift.findAll({
      include: [
        {
          model: masterIstirahat,
          as: "istirahat",
        },
      ],
    });
    // Group absensiKeluar by userid for fast lookup
    const absensiKeluarMap = new Map();
    for (const keluar of absensiKeluar) {
      if (!absensiKeluarMap.has(keluar.userid))
        absensiKeluarMap.set(keluar.userid, []);
      absensiKeluarMap.get(keluar.userid).push(keluar);
    }
    // Proses data untuk menghitung keterlambatan dan lembur
    const results = absensiMasuk.map((masuk) => {
      // Fast keluar lookup: only check for this userid
      const keluarList = absensiKeluarMap.get(masuk.userid) || [];
      const masukTime = new Date(masuk.checktime);
      const keluar = keluarList
        .filter((k) => {
          const keluarTime = new Date(k.checktime);
          const isAfterMasuk = keluarTime > masukTime;
          const duration = keluarTime - masukTime;
          return (
            isAfterMasuk &&
            duration >= 1 * 60 * 60 * 1000 && // minimal 1 jam
            duration <= 16 * 60 * 60 * 1000 // maksimal 16 jam
          );
        })
        .sort((a, b) => new Date(a.checktime) - new Date(b.checktime))[0];

      // Konversi waktu ke UTC untuk perbandingan
      const waktuMasuk = new Date(masuk.checktime);
      const waktuKeluar = !keluar ? null : new Date(keluar.checktime);

      // Dapatkan tanggal berdasarkan tanggal absensi masuk
      const tglMasukUtc = new Date(
        Date.UTC(
          waktuMasuk.getUTCFullYear(),
          waktuMasuk.getUTCMonth(),
          waktuMasuk.getUTCDate()
        )
      );
      const hariIni = tglMasukUtc.getDate();
      const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
      const tahunIni = tglMasukUtc.getFullYear();
      const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

      let jenisHariMasuk = "Biasa";
      // Dapatkan shift berdasarkan tanggal absensi masuk
      let dayName = new Date(
        Date.UTC(
          waktuMasuk.getUTCFullYear(),
          waktuMasuk.getUTCMonth(),
          waktuMasuk.getUTCDate()
        )
      ).toLocaleDateString("id-ID", {
        weekday: "long",
      });

      // Cari data biodata berdasarkan id_karyawan
      const resultFindBiodata = karyawanBiodata.find(
        (data) => data.id_karyawan === masuk.userid
      );

      const filterJadwalKaryawan = resultJadwalKaryawan.filter(
        (data) => data.jenis_karyawan == resultFindBiodata?.tipe_karyawan
      );

      // Cek apakah tanggal hari ini ada di data lembur
      const isTodayOvertime = filterJadwalKaryawan.some(
        (data) => data.tanggal_libur == tglHariini
      );
      if (isTodayOvertime == true) {
        jenisHariMasuk = "Libur";
        dayName = "Libur";
      }
      const dayName2 = new Date(
        Date.UTC(
          waktuMasuk.getUTCFullYear(),
          waktuMasuk.getUTCMonth(),
          waktuMasuk.getUTCDate()
        )
      ).toLocaleDateString("id-ID", {
        weekday: "long",
      });

      const shiftHariIni = shifts.find((shift) => shift.hari === dayName);

      //get data karyawan
      const dataKaryawan = karyawan.find(
        (data) => data.userid === masuk.userid
      );
      //get data karyawan biodata
      const dataKaryawanBiodata = karyawanBiodata.find(
        (data) => data.id_karyawan === masuk.userid
      );
      //get data master department
      const dataMasterDepartment = masterDepartment.find(
        (data) => data.id === dataKaryawanBiodata?.id_department
      );

      //get data master divisi
      const dataMasterDivisi = masterDivisi.find(
        (data) => data.id === dataKaryawanBiodata?.id_divisi
      );

      const namaKaryawan = dataKaryawan?.name;
      const typeKaryawan = dataKaryawanBiodata?.tipe_karyawan;
      const tipePenggajian = dataKaryawanBiodata?.tipe_penggajian;
      const idDepartmentKaryawan = dataKaryawanBiodata?.id_department;
      const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
      const idDivisi = dataKaryawanBiodata?.id_divisi;
      const namaDivisi = dataMasterDivisi?.nama_divisi;

      // Ambil jam shift
      const shiftMasuk1 = shiftHariIni.shift_1_masuk; // Jam masuk shift 1
      const shiftKeluar1 = shiftHariIni.shift_1_keluar; // Jam keluar shift 1
      const shiftMasuk2 = shiftHariIni.shift_2_masuk; // Jam masuk shift 2
      const shiftKeluar2 = shiftHariIni.shift_2_keluar; // Jam keluar shift 2

      let menitTerlambat = 0;
      let menitPulangCepat = 0;
      let jamLembur = 0;
      let statusMasuk = "Tepat Waktu";
      let statusKeluar = "Tepat Waktu";
      let statusLembur = "Tidak Lembur";
      let shift = "";

      // Tentukan shift berdasarkan waktu absensi masuk
      let shiftMasukTime, shiftKeluarTime;

      if (keluar) {
        // waktu masuk absen
        const waktuMasukUTC = new Date(
          Date.UTC(
            waktuMasuk.getUTCFullYear(),
            waktuMasuk.getUTCMonth(),
            waktuMasuk.getUTCDate(),
            waktuMasuk.getUTCHours(),
            waktuMasuk.getUTCMinutes(),
            waktuMasuk.getUTCSeconds()
          )
        );

        //waktu keluar absen
        const waktuKeluarUTC = new Date(
          Date.UTC(
            waktuKeluar.getUTCFullYear(),
            waktuKeluar.getUTCMonth(),
            waktuKeluar.getUTCDate(),
            waktuKeluar.getUTCHours(),
            waktuKeluar.getUTCMinutes(),
            waktuKeluar.getUTCSeconds()
          )
        );

        //waktu masuk shift 1
        const waktuMasukShift1UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftMasuk1.split(":")[0],
            shiftMasuk1.split(":")[1]
          )
        ).getTime();

        //waktu keluar shift 1
        const waktuKeluarShift1UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftKeluar1.split(":")[0],
            shiftKeluar1.split(":")[1]
          )
        ).getTime();

        //waktu masuk shift 2
        const waktuMasukShift2UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftMasuk2.split(":")[0],
            shiftMasuk2.split(":")[1]
          )
        ).getTime();

        //waktu keluar shift 2
        const waktuKeluarShift2UTC = new Date(
          Date.UTC(
            waktuKeluarUTC.getUTCFullYear(),
            waktuKeluarUTC.getUTCMonth(),
            waktuKeluarUTC.getUTCDate(),
            shiftKeluar2.split(":")[0],
            shiftKeluar2.split(":")[1]
          )
        ).getTime();

        // Tentukan shift berdasarkan waktu absensi masuk
        // Shift 1
        if (
          (waktuMasukUTC >= waktuMasukShift1UTC ||
            waktuMasukUTC - 60 * 60 * 1000 <= waktuMasukShift1UTC) &&
          waktuMasukUTC < waktuKeluarShift1UTC
        ) {
          shift = "Shift 1";
          shiftMasukTime = waktuMasukShift1UTC;
          shiftKeluarTime = waktuKeluarShift1UTC;
        }
        // Shift 2
        else if (
          waktuMasukUTC >= waktuKeluarShift1UTC ||
          waktuMasukUTC - 60 * 60 * 1000 <= waktuKeluarShift1UTC
        ) {
          shift = "Shift 2";
          shiftMasukTime = waktuMasukShift2UTC;
          shiftKeluarTime = waktuKeluarShift2UTC;
        }

        //untuk mengecek jika hari sabtu dan shift 2 maka di hitung lembur
        if (shift == "Shift 2" && dayName2 == "Sabtu") {
          jenisHariMasuk = "Libur";
        }

        // Hitung keterlambatan
        const toleransi = masterAbsensi.toleransi_kedatangan_menit * 60 * 1000; // Toleransi 15 menit dalam milidetik
        if (
          waktuMasukUTC.getTime() > shiftMasukTime + toleransi &&
          jenisHariMasuk == "Biasa"
        ) {
          const Terlambat = Math.floor(
            (waktuMasukUTC.getTime() - shiftMasukTime) / 60000
          ); // Hitung selisih dalam menit

          //ubah ke bentuk jam
          let hours = Terlambat / 60;
          menitTerlambat = Math.ceil(hours * 2) / 2;

          statusMasuk = "Terlambat";
        }

        // Hitung pulang cepat
        const toleransiKeluar =
          masterAbsensi.toleransi_pulang_menit * 60 * 1000; // Toleransi 5 menit dalam milidetik

        if (
          waktuKeluarUTC.getTime() < shiftKeluarTime - toleransiKeluar &&
          jenisHariMasuk == "Biasa"
        ) {
          const Pulang = Math.floor(
            (shiftKeluarTime - waktuKeluarUTC.getTime()) / 60000
          ); // Hitung selisih dalam menit

          //ubah ke bentuk jam
          let hours = Pulang / 60;
          menitPulangCepat = Math.ceil(hours * 2) / 2; // Hitung  dalam jam
          statusKeluar = "Pulang Cepat";
        } else {
          statusKeluar = "Keluar";
        }

        // Hitung lembur hari biasa (kode 30 * 60 * 1000 berarti tabahan setengah jam)
        // diambil dari master absensi untuk minimal jam lembur
        if (keluar && jenisHariMasuk == "Biasa") {
          //lembur setelah pulang
          if (
            shift === "Shift 1" &&
            waktuKeluarUTC >
              waktuKeluarShift1UTC +
                masterAbsensi.terhitung_lembur_menit * 60 * 1000
          ) {
            const jamLemburMentah =
              (waktuKeluarUTC.getTime() - waktuKeluarShift1UTC) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur += Math.floor(jamLemburMentah * 2) / 2;
            statusLembur = "Lembur";
          } else if (
            shift === "Shift 2" &&
            waktuKeluarUTC >
              waktuKeluarShift2UTC +
                masterAbsensi.terhitung_lembur_menit * 60 * 1000
          ) {
            const jamLemburMentah =
              (waktuKeluarUTC.getTime() - waktuKeluarShift2UTC) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur += Math.floor(jamLemburMentah * 2) / 2;

            statusLembur = "Lembur";
          }

          //lembur sebelum masuk
          if (
            shift === "Shift 1" &&
            waktuMasukUTC <
              waktuMasukShift1UTC -
                masterAbsensi.terhitung_lembur_menit * 60 * 1000
          ) {
            const jamLemburMentah =
              (waktuMasukShift1UTC - waktuMasukUTC.getTime()) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur += Math.floor(jamLemburMentah * 2) / 2;
            statusLembur = "Lembur";
          } else if (
            shift === "Shift 2" &&
            waktuMasukUTC <
              waktuMasukShift2UTC -
                masterAbsensi.terhitung_lembur_menit * 60 * 1000
          ) {
            const jamLemburMentah =
              (waktuMasukShift2UTC - waktuMasukUTC.getTime()) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur += Math.floor(jamLemburMentah * 2) / 2;

            statusLembur = "Lembur";
          }
        }

        // Hitung lembur hari biasa (kode 30 * 60 * 1000 berarti tabahan setengah jam)
        if (keluar && jenisHariMasuk == "Libur") {
          if (shift === "Shift 1") {
            const jamLemburMentah =
              (waktuKeluarUTC - waktuMasukUTC.getTime()) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur = Math.floor(jamLemburMentah * 2) / 2;
            // console.log(jamLembur);
            statusLembur = "Lembur Libur";
          } else if (shift === "Shift 2") {
            const jamLemburMentah =
              (waktuKeluarUTC - waktuMasukUTC.getTime()) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur = Math.floor(jamLemburMentah * 2) / 2;

            statusLembur = "Lembur Libur";
          }
        }

        //untuk shift 2 jika masuk di hari sabtu
        if (keluar && shift === "Shift 2" && dayName == "Sabtu") {
          const jamLemburMentah =
            (waktuKeluarUTC - waktuMasukUTC.getTime()) / 3600000;

          // Pembulatan ke bawah ke kelipatan 0.5
          jamLembur = Math.floor(jamLemburMentah * 2) / 2;

          statusLembur = "Lembur Libur";
        }

        const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
        const monthKeluar = getMonthName(waktuKeluar.getUTCMonth() + 1);

        const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
        const tglKeluar = `${waktuKeluar.getUTCDate()}-${monthKeluar}-${waktuKeluar.getFullYear()}`;
        const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;
        const jamKeluar = `${waktuKeluar.getUTCHours()}:${waktuKeluar.getUTCMinutes()}:${waktuKeluar.getUTCSeconds()}`;

        const jamMasukShift = shift == "Shift 1" ? shiftMasuk1 : shiftMasuk2;
        const jamKeluarShift = shift == "Shift 1" ? shiftKeluar1 : shiftKeluar2;

        //pencocokan pengajuan terlambat dengan absen
        let statusTerlambat = "";
        const terlambatFind = terlambatEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );
        if (terlambatFind) {
          statusTerlambat = terlambatFind.status_masuk;
        }

        const pulangCepatFind = pulangCepatEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );
        if (pulangCepatFind) {
          menitPulangCepat = 0;
          statusKeluar = `Pulang Cepat ${pulangCepatFind.status_keluar}`;
        }

        //pencocokan pengajuan lembur dengan absen
        let statusLemburSPL = "tidak dengan SPL";
        let jamLemburSPL = 0;
        let id_pengajuan_lembur = null;
        let statusKetidaksesuaian = null;

        const bulanMap = {
          Januari: 0,
          Februari: 1,
          Maret: 2,
          April: 3,
          Mei: 4,
          Juni: 5,
          Juli: 6,
          Agustus: 7,
          September: 8,
          Oktober: 9,
          November: 10,
          Desember: 11,
        };

        function parseTanggalIndo(str, toleransiMenit = 0) {
          // Contoh input: "18-Juni-2025 04:00:00"
          const [tanggalBagian, jamBagian] = str.split(" ");
          const [hari, namaBulan, tahun] = tanggalBagian.split("-");

          const date = new Date(
            parseInt(tahun),
            bulanMap[namaBulan],
            parseInt(hari)
          );

          const [jam, menit, detik] = jamBagian.split(":").map(Number);
          date.setHours(jam, menit, detik, 0);

          // Kurangi toleransi dalam menit
          if (toleransiMenit !== 0) {
            date.setMinutes(date.getMinutes() - toleransiMenit);
          }

          return date;
        }

        const lemburFind = lemburEntries.find(
          (entry) =>
            entry.userid === masuk.userid &&
            (entry.tgl_masuk === tglMasuk || entry.tgl_masuk === tglKeluar) &&
            parseTanggalIndo(entry.jam_mulai_lembur) >=
              parseTanggalIndo(`${tglMasuk} ${jamMasuk}`, 60)
        );

        // const lemburFind = lemburEntries.find(
        //   (entry) =>
        //     entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        // );

        // console.log(lemburEntries, tglMasuk);

        if (lemburFind) {
          if (lemburFind.status_ketidaksesuaian === "approved") {
            jamLembur = lemburFind.jam_lembur;
          }
          statusLemburSPL = "dengan SPL";
          jamLemburSPL = lemburFind.jam_lembur;
          id_pengajuan_lembur = lemburFind.id_pengajuan_lembur;
          statusKetidaksesuaian = lemburFind.status_ketidaksesuaian;
        } else {
          statusLembur = "Tidak Lembur";
          jamLembur = 0;
        }

        //untuk istirahat saat lembur
        let jamIstirahatLembur = 0;
        const istirahatList = shiftHariIni.istirahat;
        if (statusLembur === "Lembur Libur") {
          const jam_shift = jamMasuk;
          const jam_keluar = jamKeluar;

          function toSeconds(timeStr) {
            const [h, m, s] = timeStr.split(":").map(Number);
            return h * 3600 + m * 60 + s;
          }

          function getOverlap(start1, end1, start2, end2) {
            const start = Math.max(start1, start2);
            const end = Math.min(end1, end2);
            return end > start ? end - start : 0;
          }

          let totalSeconds = 0;

          const shiftStart = toSeconds(jam_shift);
          const shiftEnd = toSeconds(jam_keluar);

          const SECONDS_IN_DAY = 86400;

          for (const { dari, sampai } of istirahatList) {
            const breakStart = toSeconds(dari);
            const breakEnd = toSeconds(sampai);

            if (shiftEnd >= shiftStart) {
              // Normal shift dalam satu hari
              totalSeconds += getOverlap(
                shiftStart,
                shiftEnd,
                breakStart,
                breakEnd
              );
            } else {
              // Shift lintas hari: pecah jadi dua bagian
              // 1. bagian pertama: jam_shift -> 86400
              totalSeconds += getOverlap(
                shiftStart,
                SECONDS_IN_DAY,
                breakStart,
                breakEnd
              );
              // 2. bagian kedua: 0 -> jam_keluar
              totalSeconds += getOverlap(0, shiftEnd, breakStart, breakEnd);
            }
          }

          jamIstirahatLembur = totalSeconds / 3600;
          jamIstirahatLembur = Math.round(jamIstirahatLembur * 2) / 2; // bulatkan ke 0.5
          //jamLembur = absen.jam_lembur - jamIstirahat;
        } else if (statusLembur === "Lembur") {
          let jam_shift = null;
          let jam_keluar = null;
          if (shift == "Shift 1") {
            jam_shift = shiftHariIni.shift_1_keluar;
            jam_keluar = jamKeluar;
          } else {
            jam_shift = shiftHariIni.shift_2_keluar;
            jam_keluar = jamKeluar;
          }

          // Ubah "HH:mm:ss" ke detik
          function toSeconds(timeStr) {
            const [h, m, s] = timeStr.split(":").map(Number);
            return h * 3600 + m * 60 + s;
          }

          // Hitung irisan waktu
          function getOverlap(start1, end1, start2, end2) {
            const start = Math.max(start1, start2);
            const end = Math.min(end1, end2);
            return end > start ? end - start : 0;
          }

          const shiftStart = toSeconds(jam_shift);
          const shiftEnd = toSeconds(jam_keluar);

          let totalSeconds = 0;

          for (const { dari, sampai } of istirahatList) {
            const start = toSeconds(dari);
            const end = toSeconds(sampai);
            totalSeconds += getOverlap(shiftStart, shiftEnd, start, end);
          }

          // Konversi detik ke jam desimal
          jamIstirahatLembur = totalSeconds / 3600;

          // Bulatkan ke kelipatan 0.5 terdekat
          jamIstirahatLembur = Math.round(jamIstirahatLembur * 2) / 2;

          // jamLembur = absen.jam_lembur - jamIstirahat;
        }

        return {
          id_pengajuan_lembur: id_pengajuan_lembur,
          tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
          userid: masuk.userid,
          waktu_masuk: masuk.checktime,
          waktu_keluar: keluar ? keluar.checktime : null,
          tgl_masuk: tglMasuk,
          tgl_keluar: tglKeluar,
          jam_masuk: jamMasuk,
          jam_keluar: jamKeluar,
          menit_terlambat: menitTerlambat,
          jam_lembur: jamLembur,
          jam_lembur_spl: jamLemburSPL,
          jam_istirahat_lembur: jamIstirahatLembur,
          status_lembur: statusLembur,
          status_lembur_spl: statusLemburSPL,
          status_masuk: `${statusMasuk} ${statusTerlambat}`,
          status_ketidaksesuaian: statusKetidaksesuaian,
          name: namaKaryawan,
          status_keluar: statusKeluar,
          menit_pulang_cepat: menitPulangCepat,
          shift, // Menampilkan shift
          status_absen: "masuk",
          id_department: idDepartmentKaryawan,
          nama_department: namaDepartmentKaryawan,
          id_divisi: idDivisi,
          nama_divisi: namaDivisi,
          jam_masuk_shift: jamMasukShift,
          jam_keluar_shift: jamKeluarShift,
          hari: dayName2,
          jenis_hari_masuk: jenisHariMasuk,
          tipe_karyawan: typeKaryawan,
          tipe_penggajian: tipePenggajian,
        };
      } else {
        // waktu masuk absen
        const waktuMasukUTC = new Date(
          Date.UTC(
            waktuMasuk.getUTCFullYear(),
            waktuMasuk.getUTCMonth(),
            waktuMasuk.getUTCDate(),
            waktuMasuk.getUTCHours(),
            waktuMasuk.getUTCMinutes(),
            waktuMasuk.getUTCSeconds()
          )
        );

        //waktu masuk shift 1
        const waktuMasukShift1UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftMasuk1.split(":")[0],
            shiftMasuk1.split(":")[1]
          )
        ).getTime();

        //waktu keluar shift 1
        const waktuKeluarShift1UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftKeluar1.split(":")[0],
            shiftKeluar1.split(":")[1]
          )
        ).getTime();

        //waktu masuk shift 2
        const waktuMasukShift2UTC = new Date(
          Date.UTC(
            waktuMasukUTC.getUTCFullYear(),
            waktuMasukUTC.getUTCMonth(),
            waktuMasukUTC.getUTCDate(),
            shiftMasuk2.split(":")[0],
            shiftMasuk2.split(":")[1]
          )
        ).getTime();

        // Tentukan shift berdasarkan waktu absensi masuk
        // Shift 1
        if (
          (waktuMasukUTC >= waktuMasukShift1UTC ||
            waktuMasukUTC - 60 * 60 * 1000 <= waktuMasukShift1UTC) &&
          waktuMasukUTC < waktuKeluarShift1UTC
        ) {
          shift = "Shift 1";
          shiftMasukTime = waktuMasukShift1UTC;
          shiftKeluarTime = waktuKeluarShift1UTC;
        }
        // Shift 2
        else if (
          waktuMasukUTC >= waktuKeluarShift1UTC ||
          waktuMasukUTC - 60 * 60 * 1000 <= waktuKeluarShift1UTC
        ) {
          shift = "Shift 2";
          shiftMasukTime = waktuMasukShift2UTC;
        }

        // Hitung keterlambatan
        const toleransi = masterAbsensi.toleransi_kedatangan_menit * 60 * 1000; // Toleransi 5 menit dalam milidetik
        if (waktuMasukUTC.getTime() > shiftMasukTime + toleransi) {
          const Terlambat = Math.floor(
            (waktuMasukUTC.getTime() - shiftMasukTime) / 60000
          ); // Hitung selisih dalam menit

          //ubah ke bentuk jam
          let hours = Terlambat / 60;
          menitTerlambat = Math.ceil(hours * 2) / 2;
          statusMasuk = "Terlambat";
        }

        const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);

        const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
        const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;

        const jamMasukShift = shift == "Shift 1" ? shiftMasuk1 : shiftMasuk2;
        const jamKeluarShift = shift == "Shift 1" ? shiftKeluar1 : shiftKeluar2;

        //pencocokan pengajuan terlambat dengan absen
        let statusTerlambat = "";
        const terlambatFind = terlambatEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );
        if (terlambatFind) {
          statusTerlambat = terlambatFind.status_masuk;
        }

        //pencocokan pengajuan lembur dengan absen
        let statusLemburSPL = "tidak dengan SPL";
        let jamLemburSPL = 0;
        let id_pengajuan_lembur = null;
        let statusKetidaksesuaian = null;
        const lemburFind = lemburEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );

        if (lemburFind) {
          statusLemburSPL = "dengan SPL";
          jamLemburSPL = lemburFind.jam_lembur;
          id_pengajuan_lembur = lemburFind.id_pengajuan_lembur;
          statusKetidaksesuaian = lemburFind.status_ketidaksesuaian;
        }

        return {
          id_pengajuan_lembur: id_pengajuan_lembur,
          tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
          userid: masuk.userid,
          waktu_masuk: masuk.checktime,
          waktu_keluar: keluar ? keluar.checktime : null,
          tgl_masuk: tglMasuk,
          tgl_keluar: null,
          jam_masuk: jamMasuk,
          jam_keluar: null,
          menit_terlambat: menitTerlambat,
          jam_lembur: 0,
          jam_lembur_spl: jamLemburSPL,
          status_lembur: "Belum Pulang",
          status_lembur_spl: statusLemburSPL,
          status_masuk: `${statusMasuk} ${statusTerlambat}`,
          status_ketidaksesuaian: statusKetidaksesuaian,
          name: namaKaryawan,
          status_keluar: "Belum Pulang",
          menit_pulang_cepat: 0,
          shift, // Menampilkan shift
          status_absen: "masuk",
          id_department: idDepartmentKaryawan,
          nama_department: namaDepartmentKaryawan,
          id_divisi: idDivisi,
          nama_divisi: namaDivisi,
          jam_masuk_shift: jamMasukShift,
          jam_keluar_shift: jamKeluarShift,
          hari: dayName2,
          jenis_hari_masuk: jenisHariMasuk,
          tipe_karyawan: typeKaryawan,
          tipe_penggajian: tipePenggajian,
        };
      }
    });

    //masukan data cuti ke data absen
    results.push(...cutiEntries);
    //masukan data izin ke data absen
    results.push(...izinEntries);
    //masukan data dinas ke data absen
    results.push(...dinasEntries);
    //masukan data sakit ke data absen
    results.push(...sakitEntries);
    //masukan data mangkir ke data absen
    results.push(...mangkirEntries);

    // Sorting berdasarkan tanggal (terbaru ke terlama)
    results.sort((a, b) => b.waktu_masuk - a.waktu_masuk);

    //console.log(5);

    //cek apakah filter date hanya 1 hari (untuk menampilkan semua karyawan jika hanya satu hari)
    if (startDate === endDate) {
      const dataKaryawanGenerete = generatekaryawanList(
        karyawan,
        karyawanBiodata,
        masterDepartment,
        masterDivisi,
        resultJadwalKaryawan,
        startDate
      );

      results.forEach((absen) => {
        const karyawanDitemukan = dataKaryawanGenerete.find(
          (k) => k.userid === absen.userid
        );
        // if (absen.name == "RIFKI RIVALDI") {
        //   console.log(absen, karyawanDitemukan);
        // }

        if (karyawanDitemukan) {
          (karyawanDitemukan.id_pengajuan_lembur = absen.id_pengajuan_lembur),
            (karyawanDitemukan.userid = absen.userid),
            (karyawanDitemukan.waktu_masuk = absen.waktu_masuk),
            (karyawanDitemukan.waktu_keluar = absen.waktu_keluar),
            (karyawanDitemukan.tgl_absen = absen.tgl_absen),
            (karyawanDitemukan.tgl_masuk = absen.tgl_masuk),
            (karyawanDitemukan.tgl_keluar = absen.tgl_keluar),
            (karyawanDitemukan.jam_masuk = absen.jam_masuk),
            (karyawanDitemukan.jam_keluar = absen.jam_keluar),
            (karyawanDitemukan.menit_terlambat = absen.menit_terlambat),
            (karyawanDitemukan.jam_lembur = absen.jam_lembur),
            (karyawanDitemukan.jam_lembur_spl = absen.jam_lembur_spl),
            (karyawanDitemukan.status_lembur = absen.status_lembur),
            (karyawanDitemukan.status_lembur_spl = absen.status_lembur_spl),
            (karyawanDitemukan.status_masuk = absen.status_masuk),
            (karyawanDitemukan.status_ketidaksesuaian =
              absen.status_ketidaksesuaian),
            (karyawanDitemukan.name = absen.name),
            (karyawanDitemukan.status_keluar = absen.status_keluar),
            (karyawanDitemukan.menit_pulang_cepat = absen.menit_pulang_cepat),
            (karyawanDitemukan.shift = absen.shift), // Menampilkan shift
            (karyawanDitemukan.status_absen = absen.status_absen),
            (karyawanDitemukan.id_department = absen.id_department),
            (karyawanDitemukan.nama_department = absen.nama_department);
          (karyawanDitemukan.id_divisi = absen.id_divisi),
            (karyawanDitemukan.nama_divisi = absen.nama_divisi);
          (karyawanDitemukan.hari = absen.hari),
            (karyawanDitemukan.jenis_hari_masuk = absen.jenis_hari_masuk);
        } else {
          dataKaryawanGenerete.push({
            id_pengajuan_lembur: absen.id_pengajuan_lembur,
            userid: absen.userid,
            waktu_masuk: absen.waktu_masuk,
            waktu_keluar: absen.waktu_keluar,
            tgl_absen: absen.tgl_absen,
            tgl_masuk: absen.tgl_masuk,
            tgl_keluar: absen.tgl_keluar,
            jam_masuk: absen.jam_masuk,
            jam_keluar: absen.jam_keluar,
            menit_terlambat: absen.menit_terlambat,
            jam_lembur: absen.jam_lembur,
            jam_lembur_spl: absen.jam_lembur_spl,
            status_lembur: absen.status_lembur,
            status_lembur_spl: absen.status_lembur_spl,
            status_masuk: absen.status_masuk,
            status_ketidaksesuaian: absen.status_ketidaksesuaian,
            name: absen.name,
            status_keluar: absen.status_keluar,
            menit_pulang_cepat: absen.menit_pulang_cepat,
            shift: absen.shift,
            status_absen: absen.status_absen,
            id_department: absen.id_department,
            nama_department: absen.nama_department,
            id_divisi: absen.id_divisi,
            nama_divisi: absen.nama_divisi,
            hari: absen.hari,
            jenis_hari_masuk: absen.jenis_hari_masuk,
          });
        }
      });
      const resultAbsen = dataKaryawanGenerete.sort(
        (a, b) => new Date(b.waktu_masuk) - new Date(a.waktu_masuk)
      );

      return resultAbsen;
    } else {
      const resultAbsen = results.sort(
        (a, b) => new Date(b.waktu_masuk) - new Date(a.waktu_masuk)
      );

      return resultAbsen;
    }
  },
};

// Fungsi untuk memecah rentang tanggal Cuti menjadi array tanggal harian
const generateDailyCuti = (
  cuti,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan,
  startDateCuti,
  endDateCuti
) => {
  let dailycuti = [];
  let startDate = new Date(cuti.dari);
  let endDate = new Date(cuti.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === cuti.id_karyawan
  );

  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === cuti.id_karyawan
  );
  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Pastikan untuk memfilter berdasarkan rentang tanggal yang diinginkan
  if (endDate < new Date(startDateCuti) || startDate > new Date(endDateCuti)) {
    return dailySakit; // Jika tidak dalam rentang, kembalikan array kosong
  }
  // Sesuaikan startDate dan endDate untuk rentang yang relevan
  startDate =
    startDate < new Date(startDateCuti) ? new Date(startDateCuti) : startDate;
  endDate = endDate > new Date(endDateCuti) ? new Date(endDateCuti) : endDate;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

    // Dapatkan tanggal berdasarkan tanggal absensi masuk
    const tglMasukUtc = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    );
    const hariIni = tglMasukUtc.getDate();
    const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
    const tahunIni = tglMasukUtc.getFullYear();
    const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

    let jenisHariMasuk = "Biasa";

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );
    if (isTodayOvertime == true) {
      jenisHariMasuk = "Libur";
    } else {
      const dayName2 = new Date(
        Date.UTC(
          waktuMasuk.getUTCFullYear(),
          waktuMasuk.getUTCMonth(),
          waktuMasuk.getUTCDate()
        )
      ).toLocaleDateString("id-ID", {
        weekday: "long",
      });

      dailycuti.push({
        userid: cuti.id_karyawan,
        waktu_masuk: new Date(startDate),
        waktu_keluar: null,
        tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
        tgl_masuk: tglMasuk,
        tgl_keluar: null,
        jam_masuk: null,
        jam_keluar: null,
        menit_terlambat: null,
        jam_lembur: null,
        status_lembur: null,
        status_masuk: null,
        name: namaKaryawan,
        status_keluar: null,
        menit_pulang_cepat: null,
        shift: null, // Menampilkan shift
        status_absen: "cuti" + " " + cuti.tipe_cuti,
        id_department: namaKaryawanBiodata,
        nama_department: namaDepartmentKaryawan,
        id_divisi: idDivisi,
        nama_divisi: namaDivisi,
        hari: dayName2,
        jenis_hari_masuk: jenisHariMasuk,
      });
    }

    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailycuti;
};

// Fungsi untuk memecah rentang tanggal izin menjadi array tanggal harian
const generateDailyIzin = (
  izin,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyIzin = [];
  let startDate = new Date(izin.dari);
  let endDate = new Date(izin.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === izin.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === izin.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

    // Dapatkan tanggal berdasarkan tanggal absensi masuk
    const tglMasukUtc = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    );
    const hariIni = tglMasukUtc.getDate();
    const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
    const tahunIni = tglMasukUtc.getFullYear();
    const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

    let jenisHariMasuk = "Biasa";

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );
    if (isTodayOvertime == true) {
      jenisHariMasuk = "Libur";
    }
    const dayName2 = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    ).toLocaleDateString("id-ID", {
      weekday: "long",
    });
    dailyIzin.push({
      userid: izin.id_karyawan,
      waktu_masuk: new Date(startDate),
      waktu_keluar: null,
      tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
      tgl_masuk: tglMasuk,
      tgl_keluar: null,
      jam_masuk: null,
      jam_keluar: null,
      menit_terlambat: null,
      jam_lembur: null,
      status_lembur: null,
      status_masuk: null,
      name: namaKaryawan,
      status_keluar: null,
      menit_pulang_cepat: null,
      shift: null, // Menampilkan shift
      status_absen: "izin",
      id_department: namaKaryawanBiodata,
      nama_department: namaDepartmentKaryawan,
      id_divisi: idDivisi,
      nama_divisi: namaDivisi,
      hari: dayName2,
      jenis_hari_masuk: jenisHariMasuk,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailyIzin;
};

// Fungsi untuk memecah rentang tanggal izin menjadi array tanggal harian
const generateDailyDinas = (
  dinas,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyDinas = [];
  let startDate = new Date(dinas.dari);
  let endDate = new Date(dinas.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === dinas.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === dinas.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

    // Dapatkan tanggal berdasarkan tanggal absensi masuk
    const tglMasukUtc = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    );
    const hariIni = tglMasukUtc.getDate();
    const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
    const tahunIni = tglMasukUtc.getFullYear();
    const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

    let jenisHariMasuk = "Biasa";

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );
    if (isTodayOvertime == true) {
      jenisHariMasuk = "Libur";
    }
    const dayName2 = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    ).toLocaleDateString("id-ID", {
      weekday: "long",
    });
    dailyDinas.push({
      userid: dinas.id_karyawan,
      waktu_masuk: new Date(startDate),
      waktu_keluar: null,
      tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
      tgl_masuk: tglMasuk,
      tgl_keluar: null,
      jam_masuk: null,
      jam_keluar: null,
      menit_terlambat: null,
      jam_lembur: null,
      status_lembur: null,
      status_masuk: null,
      name: namaKaryawan,
      status_keluar: null,
      menit_pulang_cepat: null,
      shift: null, // Menampilkan shift
      status_absen: "dinas",
      id_department: namaKaryawanBiodata,
      nama_department: namaDepartmentKaryawan,
      id_divisi: idDivisi,
      nama_divisi: namaDivisi,
      hari: dayName2,
      jenis_hari_masuk: jenisHariMasuk,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailyDinas;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailySakit = (
  sakit,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan,
  startDateSakit,
  endDateSakit
) => {
  let dailySakit = [];
  let startDate = new Date(sakit.dari);
  let endDate = new Date(sakit.sampai);

  const dataKaryawan = karyawan.find(
    (data) => data.userid === sakit.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === sakit.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Pastikan untuk memfilter berdasarkan rentang tanggal yang diinginkan
  if (
    endDate < new Date(startDateSakit) ||
    startDate > new Date(endDateSakit)
  ) {
    return dailySakit; // Jika tidak dalam rentang, kembalikan array kosong
  }
  // Sesuaikan startDate dan endDate untuk rentang yang relevan
  startDate =
    startDate < new Date(startDateSakit) ? new Date(startDateSakit) : startDate;
  endDate = endDate > new Date(endDateSakit) ? new Date(endDateSakit) : endDate;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

    // Dapatkan tanggal berdasarkan tanggal absensi masuk
    const tglMasukUtc = new Date(
      Date.UTC(
        waktuMasuk.getUTCFullYear(),
        waktuMasuk.getUTCMonth(),
        waktuMasuk.getUTCDate()
      )
    );
    const hariIni = tglMasukUtc.getDate();
    const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
    const tahunIni = tglMasukUtc.getFullYear();
    const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;
    let jenisHariMasuk = "Biasa";

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );

    if (isTodayOvertime == true) {
      jenisHariMasuk = "Libur";
    } else {
      const dayName2 = new Date(
        Date.UTC(
          waktuMasuk.getUTCFullYear(),
          waktuMasuk.getUTCMonth(),
          waktuMasuk.getUTCDate()
        )
      ).toLocaleDateString("id-ID", {
        weekday: "long",
      });
      dailySakit.push({
        userid: sakit.id_karyawan,
        waktu_masuk: new Date(startDate),
        waktu_keluar: null,
        tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
        tgl_masuk: tglMasuk,
        tgl_keluar: null,
        jam_masuk: null,
        jam_keluar: null,
        menit_terlambat: null,
        jam_lembur: null,
        status_lembur: null,
        status_masuk: null,
        name: namaKaryawan,
        status_keluar: null,
        menit_pulang_cepat: null,
        shift: null, // Menampilkan shift
        status_absen: "sakit",
        id_department: namaKaryawanBiodata,
        nama_department: namaDepartmentKaryawan,
        id_divisi: idDivisi,
        nama_divisi: namaDivisi,
        hari: dayName2,
        jenis_hari_masuk: jenisHariMasuk,
      });
    }

    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailySakit;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailyMangkir = (
  mangkir,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyMangkir = [];
  let startDate = new Date(mangkir.tanggal);

  const dataKaryawan = karyawan.find(
    (data) => data.userid === mangkir.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === mangkir.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai

  const waktuMasuk = new Date(startDate);
  const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
  const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

  // Dapatkan tanggal berdasarkan tanggal absensi masuk
  const tglMasukUtc = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  );
  const hariIni = tglMasukUtc.getDate();
  const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
  const tahunIni = tglMasukUtc.getFullYear();
  const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

  let jenisHariMasuk = "Biasa";

  const filterJadwalKaryawan = resultJadwalKaryawan.filter(
    (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
  );

  // Cek apakah tanggal hari ini ada di data lembur
  const isTodayOvertime = filterJadwalKaryawan.some(
    (data) => data.tanggal_libur == tglHariini
  );
  if (isTodayOvertime == true) {
    jenisHariMasuk = "Libur";
  }
  const dayName2 = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  ).toLocaleDateString("id-ID", {
    weekday: "long",
  });

  dailyMangkir.push({
    userid: mangkir.id_karyawan,
    waktu_masuk: new Date(startDate),
    waktu_keluar: null,
    tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
    tgl_masuk: tglMasuk,
    tgl_keluar: null,
    jam_masuk: null,
    jam_keluar: null,
    menit_terlambat: null,
    jam_lembur: null,
    status_lembur: null,
    status_masuk: null,
    name: namaKaryawan,
    status_keluar: null,
    menit_pulang_cepat: null,
    shift: null, // Menampilkan shift
    status_absen: "Mangkir",
    id_department: namaKaryawanBiodata,
    nama_department: namaDepartmentKaryawan,
    id_divisi: idDivisi,
    nama_divisi: namaDivisi,
    hari: dayName2,
    jenis_hari_masuk: jenisHariMasuk,
  });

  return dailyMangkir;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailyTerlambat = (
  Terlambat,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyTerlambat = [];
  let startDate = new Date(Terlambat.tanggal);

  const dataKaryawan = karyawan.find(
    (data) => data.userid === Terlambat.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === Terlambat.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai

  const waktuMasuk = new Date(startDate);
  const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
  const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

  // Dapatkan tanggal berdasarkan tanggal absensi masuk
  const tglMasukUtc = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  );
  const hariIni = tglMasukUtc.getDate();
  const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
  const tahunIni = tglMasukUtc.getFullYear();
  const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

  let jenisHariMasuk = "Biasa";

  const filterJadwalKaryawan = resultJadwalKaryawan.filter(
    (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
  );

  // Cek apakah tanggal hari ini ada di data lembur
  const isTodayOvertime = filterJadwalKaryawan.some(
    (data) => data.tanggal_libur == tglHariini
  );
  if (isTodayOvertime == true) {
    jenisHariMasuk = "Libur";
  }
  const dayName2 = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  ).toLocaleDateString("id-ID", {
    weekday: "long",
  });

  dailyTerlambat.push({
    userid: Terlambat.id_karyawan,
    waktu_masuk: new Date(startDate),
    waktu_keluar: null,
    tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
    tgl_masuk: tglMasuk,
    tgl_keluar: null,
    jam_masuk: null,
    jam_keluar: null,
    menit_terlambat: null,
    jam_lembur: null,
    status_lembur: null,
    status_masuk: `: ${Terlambat.type_izin}`,
    name: namaKaryawan,
    status_keluar: null,
    menit_pulang_cepat: null,
    shift: null, // Menampilkan shift
    status_absen: `${Terlambat.type_izin}`,
    id_department: namaKaryawanBiodata,
    nama_department: namaDepartmentKaryawan,
    id_divisi: idDivisi,
    nama_divisi: namaDivisi,
    hari: dayName2,
    jenis_hari_masuk: jenisHariMasuk,
  });

  return dailyTerlambat;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailyPulangCepat = (
  PulangCepat,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyPulangCepat = [];
  let startDate = new Date(PulangCepat.tanggal);

  const dataKaryawan = karyawan.find(
    (data) => data.userid === PulangCepat.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === PulangCepat.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai

  const waktuMasuk = new Date(startDate);
  const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
  const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

  // Dapatkan tanggal berdasarkan tanggal absensi masuk
  const tglMasukUtc = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  );
  const hariIni = tglMasukUtc.getDate();
  const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
  const tahunIni = tglMasukUtc.getFullYear();
  const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

  let jenisHariMasuk = "Biasa";

  const filterJadwalKaryawan = resultJadwalKaryawan.filter(
    (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
  );

  // Cek apakah tanggal hari ini ada di data lembur
  const isTodayOvertime = filterJadwalKaryawan.some(
    (data) => data.tanggal_libur == tglHariini
  );
  if (isTodayOvertime == true) {
    jenisHariMasuk = "Libur";
  }
  const dayName2 = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  ).toLocaleDateString("id-ID", {
    weekday: "long",
  });

  dailyPulangCepat.push({
    userid: PulangCepat.id_karyawan,
    waktu_masuk: new Date(startDate),
    waktu_keluar: null,
    tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
    tgl_masuk: tglMasuk,
    tgl_keluar: null,
    jam_masuk: null,
    jam_keluar: null,
    menit_PulangCepat: null,
    jam_lembur: null,
    status_lembur: null,
    status_masuk: null,
    name: namaKaryawan,
    status_keluar: `: ${PulangCepat.type_izin}`,
    menit_pulang_cepat: null,
    shift: null, // Menampilkan shift
    status_absen: `${PulangCepat.type_izin}`,
    id_department: namaKaryawanBiodata,
    nama_department: namaDepartmentKaryawan,
    id_divisi: idDivisi,
    nama_divisi: namaDivisi,
    hari: dayName2,
    jenis_hari_masuk: jenisHariMasuk,
  });

  return dailyPulangCepat;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailyLembur = (
  Lembur,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan
) => {
  let dailyLembur = [];
  let startDate = new Date(Lembur.dari);

  const dataKaryawan = karyawan.find(
    (data) => data.userid === Lembur.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === Lembur.id_karyawan
  );

  //get data master department
  const dataMasterDepartment = masterDepartment.find(
    (data) => data.id === dataKaryawanBiodata?.id_department
  );

  //get data master divisi
  const dataMasterDivisi = masterDivisi.find(
    (data) => data.id === dataKaryawanBiodata?.id_divisi
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
  const idDivisi = dataKaryawanBiodata?.id_divisi;
  const namaDivisi = dataMasterDivisi?.nama_divisi;

  // Iterasi dari tanggal_dari hingga tanggal_sampai

  const waktuMasuk = new Date(startDate);
  const monthMasuk = getMonthName(waktuMasuk.getMonth() + 1);
  const tglMasuk = `${waktuMasuk.getDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;

  const jamStr = waktuMasuk.getHours().toString().padStart(2, "0");
  const menitStr = waktuMasuk.getMinutes().toString().padStart(2, "0");
  const seconStr = waktuMasuk.getSeconds().toString().padStart(2, "0");

  const jamFormatted = `${jamStr}:${menitStr}:${seconStr}`;

  // Dapatkan tanggal berdasarkan tanggal absensi masuk
  const tglMasukUtc = new Date(
    Date.UTC(
      waktuMasuk.getUTCFullYear(),
      waktuMasuk.getUTCMonth(),
      waktuMasuk.getUTCDate()
    )
  );

  const statusKetidaksesuaian = Lembur.status_ketidaksesuaian;
  const penanganan = Lembur.penanganan;

  dailyLembur.push({
    id_pengajuan_lembur: Lembur.id,
    userid: Lembur.id_karyawan,
    waktu_masuk: new Date(startDate),
    tgl_masuk: tglMasuk,
    tgl_absen: convertTanggalIndonesiaToISO(tglMasuk),
    jam_lembur: Lembur.lama_lembur_aktual,
    jam_mulai_lembur: `${tglMasuk} ${jamFormatted}`,
    name: namaKaryawan,
    id_department: namaKaryawanBiodata,
    nama_department: namaDepartmentKaryawan,
    id_divisi: idDivisi,
    nama_divisi: namaDivisi,
    status_ketidaksesuaian:
      statusKetidaksesuaian == "approved" ? penanganan : statusKetidaksesuaian,
  });

  return dailyLembur;
};
// Fungsi untuk memecah rentang tanggal Cuti menjadi array tanggal harian
const generatekaryawanList = (
  karyawan,
  karyawanBiodata,
  masterDepartment,
  masterDivisi,
  resultJadwalKaryawan,
  date
) => {
  let dataKaryawan = [];
  // Dapatkan tanggal berdasarkan tanggal absensi masuk
  const waktuHariIni = new Date(date);

  const tglMasukUtc = new Date(
    Date.UTC(
      waktuHariIni.getUTCFullYear(),
      waktuHariIni.getUTCMonth(),
      waktuHariIni.getUTCDate()
    )
  );
  const hariIni = tglMasukUtc.getDate();
  const bulanIni = getMonthName((tglMasukUtc.getMonth() + 1).toString());
  const tahunIni = tglMasukUtc.getFullYear();
  const tglHariini = `${hariIni}-${bulanIni}-${tahunIni}`;

  for (let i = 0; i < karyawan.length; i++) {
    //get biodataKaryawan
    const dataKaryawanBiodata = karyawanBiodata.find(
      (data) => data.id_karyawan === karyawan[i].userid
    );
    //get data master department
    const dataMasterDepartment = masterDepartment.find(
      (data) => data.id === dataKaryawanBiodata?.id_department
    );

    //get data master divisi
    const dataMasterDivisi = masterDivisi.find(
      (data) => data.id === dataKaryawanBiodata?.id_divisi
    );

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );

    const idDepartment = dataKaryawanBiodata?.id_department;
    const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;
    const idDivisi = dataKaryawanBiodata?.id_divisi;
    const namaDivisi = dataMasterDivisi?.nama_divisi;

    if (!isTodayOvertime) {
      dataKaryawan.push({
        id_pengajuan_lembur: null,
        tgl_absen: date,
        userid: karyawan[i].userid,
        waktu_masuk: null,
        waktu_keluar: null,
        tgl_masuk: null,
        tgl_keluar: null,
        jam_masuk: null,
        jam_keluar: null,
        menit_terlambat: null,
        jam_lembur: null,
        jam_lembur_spl: null,
        status_lembur: null,
        status_lembur_spl: null,
        status_masuk: null,
        status_ketidaksesuaian: null,
        name: karyawan[i].name,
        status_keluar: "Belum Keluar",
        menit_pulang_cepat: null,
        shift: null, // Menampilkan shift
        status_absen: "Belum Masuk",
        id_department: idDepartment,
        nama_department: namaDepartmentKaryawan,
        id_divisi: idDivisi,
        nama_divisi: namaDivisi,
        hari: null,
        jenis_hari_masuk: null,
        tipe_karyawan: dataKaryawanBiodata.tipe_karyawan,
        tipe_penggajian: dataKaryawanBiodata.tipe_penggajian,
      });
    }
  }

  return dataKaryawan;
};

function getMonthName(monthString) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthNumber = parseInt(monthString);

  if (monthNumber < 1 || monthNumber > 12) {
    return "Bulan tidak valid";
  } else {
    return months[monthNumber - 1];
  }
}

function convertTanggalIndonesiaToISO(tanggal) {
  const bulanMap = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const [hari, namaBulan, tahun] = tanggal.split("-");
  const bulan = bulanMap[namaBulan];

  if (!bulan) {
    throw new Error(`Bulan "${namaBulan}" tidak dikenali`);
  }

  return `${tahun}-${bulan}-${hari.padStart(2, "0")}`;
}

module.exports = absenFunction;
