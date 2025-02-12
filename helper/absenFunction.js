const dbFinger = require("../config/databaseFinger");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../model/hr/absenModel");
const Karyawan = require("../model/hr/karyawanModel");
const KaryawanBiodata = require("../model/hr/karyawan/karyawanBiodataModel");
const masterShift = require("../model/masterData/hr/masterShift/masterShiftModel");
const MasterDepartment = require("../model/masterData/hr/masterDeprtmentModel");
const MasterAbsensi = require("../model/masterData/hr/masterAbsensiModel");
const DataCuti = require("../model/hr/pengajuanCuti/pengajuanCutiModel");
const DataIzin = require("../model/hr/pengajuanIzin/pengajuanIzinModel");
const DataSakit = require("../model/hr/pengajuanSakit/pengajuanSakitModel");
const DataMangkir = require("../model/hr/pengajuanMangkir/pengajuanMangkirModel");
const DataTerlambat = require("../model/hr/pengajuanTerlambat/pengajuanTerlambatModel");
const DataLembur = require("../model/hr/pengajuanLembur/pengajuanLemburModel");
const JadwalKaryawan = require("../model/hr/jadwalKaryawan/jadwalKaryawanModel");

const absenFunction = {
  getAbsensiFunction: async (startDate, endDate, obj, isLibur) => {
    const masterAbsensi = await MasterAbsensi.findByPk(1);
    const masterDepartment = await MasterDepartment.findAll();
    const karyawanBiodata = await KaryawanBiodata.findAll({
      where: obj,
    });

    // Ekstrak id_karyawan dari hasil query
    const karyawanIds = karyawanBiodata.map((biodata) => biodata.id_karyawan);
    const karyawan = await Karyawan.findAll({
      where: {
        userid: {
          [Op.in]: karyawanIds, // Gunakan array id_karyawan
        },
      },
    });

    let absensiMasuk = [];
    let absensiKeluar = [];
    let dataCuti = [];
    let dataIzin = [];
    let dataSakit = [];
    let dataMangkir = [];
    let dataTerlambat = [];
    let dataLembur = [];

    const dataJadwalKaryawan = await JadwalKaryawan.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        tanggal: {
          [Op.between]: [
            new Date(startDate).setHours(0, 0, 0, 0),
            new Date(endDate).setHours(23, 59, 59, 999),
          ],
        },
      },
    });

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

    //jika ada range tanggal
    if (startDate && endDate) {
      const fromDateUTC = new Date(`${startDate}T00:00:00.000Z`); // Awal hari UTC
      const toDateMasukUTC = new Date(`${endDate}T23:59:59.999Z`);
      const dateKeluar = new Date(endDate);
      dateKeluar.setDate(dateKeluar.getDate() + 1);
      const nextDay = dateKeluar.toISOString().split("T")[0];
      const toDateKeluarUTC = new Date(`${nextDay}T23:59:59.999Z`);

      // Ambil  data absensi masuk
      absensiMasuk = await absensi.findAll({
        where: {
          checktype: "0",
          checktime: {
            [Op.between]: [fromDateUTC, toDateMasukUTC],
          },
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      //ambil data absensi keluar
      absensiKeluar = await absensi.findAll({
        where: {
          checktype: "1",
          checktime: {
            [Op.between]: [fromDateUTC, toDateKeluarUTC],
          },
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });
      dataCuti = await DataCuti.findAll({
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
      });
      dataIzin = await DataIzin.findAll({
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
      });

      dataSakit = await DataSakit.findAll({
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
      });

      dataMangkir = await DataMangkir.findAll({
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
      });

      dataTerlambat = await DataTerlambat.findAll({
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
      });

      dataLembur = await DataLembur.findAll({
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
      });
      //console.log(absensiMasuk);
    } else {
      // Ambil  data absensi masuk
      absensiMasuk = await absensi.findAll({
        where: {
          checktype: "0",
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      //ambil data absensi keluar
      absensiKeluar = await absensi.findAll({
        where: {
          checktype: "1",
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      dataCuti = await DataCuti.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });
      dataIzin = await DataIzin.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      dataSakit = await DataSakit.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      dataMangkir = await DataMangkir.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      dataTerlambat = await DataTerlambat.findAll({
        where: {
          status: "approved",
          id_karyawan: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });
    }

    dataLembur = await DataLembur.findAll({
      where: {
        status: "approved",
        id_karyawan: {
          [Op.in]: karyawanIds, // Gunakan array id_karyawan
        },
      },
    });

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
          resultJadwalKaryawan
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
          resultJadwalKaryawan
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
          resultJadwalKaryawan
        ),
      ];
    });

    // Ambil shift untuk semua hari
    const shifts = await masterShift.findAll();

    // Proses data untuk menghitung keterlambatan dan lembur
    const results = absensiMasuk.map((masuk) => {
      const keluar = absensiKeluar
        .filter((k) => {
          const masukTime = new Date(masuk.checktime);
          const keluarTime = new Date(k.checktime);
          const isSameUser = k.userid === masuk.userid;
          const isAfterMasuk = keluarTime > masukTime;
          const isWithin12Hours = keluarTime - masukTime <= 16 * 60 * 60 * 1000; // 12 jam dalam milidetik

          return isSameUser && isAfterMasuk && isWithin12Hours;
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
        (data) => data.jenis_karyawan == resultFindBiodata.tipe_karyawan
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

      const namaKaryawan = dataKaryawan?.name;
      const typeKaryawan = dataKaryawanBiodata?.tipe_karyawan;
      const idDepartmentKaryawan = dataKaryawanBiodata?.id_department;
      const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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
          waktuKeluarUTC.getTime() < shiftKeluarTime + toleransiKeluar &&
          jenisHariMasuk == "Biasa"
        ) {
          menitPulangCepat = Math.floor(
            (shiftKeluarTime - waktuKeluarUTC.getTime()) / 60000
          ); // Hitung selisih dalam menit
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
            console.log(jamLembur);
            statusLembur = "Lembur Libur";
          } else if (shift === "Shift 2") {
            const jamLemburMentah =
              (waktuKeluarUTC - waktuMasukUTC.getTime()) / 3600000;

            // Pembulatan ke bawah ke kelipatan 0.5
            jamLembur = Math.floor(jamLemburMentah * 2) / 2;

            statusLembur = "Lembur Libur";
          }
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

        //pencocokan pengajuan lembur dengan absen
        let statusLemburSPL = "tidak dengan SPL";
        let jamLemburSPL = 0;
        let id_pengajuan_lembur = null;
        const lemburFind = lemburEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );

        if (lemburFind) {
          statusLemburSPL = "dengan SPL";
          jamLemburSPL = lemburFind.jam_lembur;
          id_pengajuan_lembur = lemburFind.id_pengajuan_lembur;
        }

        //console.log(terlambatFind);

        return {
          id_pengajuan_lembur: id_pengajuan_lembur,
          tgl_absen: tglMasuk,
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
          status_lembur: statusLembur,
          status_lembur_spl: statusLemburSPL,
          status_masuk: `${statusMasuk} ${statusTerlambat}`,
          name: namaKaryawan,
          status_keluar: statusKeluar,
          menit_pulang_cepat: menitPulangCepat,
          shift, // Menampilkan shift
          status_absen: "masuk",
          id_department: idDepartmentKaryawan,
          nama_department: namaDepartmentKaryawan,
          jam_masuk_shift: jamMasukShift,
          jam_keluar_shift: jamKeluarShift,
          hari: dayName2,
          jenis_hari_masuk: jenisHariMasuk,
          tipe_karyawan: typeKaryawan,
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
        const lemburFind = lemburEntries.find(
          (entry) =>
            entry.userid === masuk.userid && entry.tgl_masuk === tglMasuk
        );

        if (lemburFind) {
          statusLemburSPL = "dengan SPL";
          jamLemburSPL = lemburFind.jam_lembur;
          id_pengajuan_lembur = lemburFind.id_pengajuan_lembur;
        }

        return {
          id_pengajuan_lembur: id_pengajuan_lembur,
          tgl_absen: tglMasuk,
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
          name: namaKaryawan,
          status_keluar: "Belum Pulang",
          menit_pulang_cepat: 0,
          shift, // Menampilkan shift
          status_absen: "masuk",
          id_department: idDepartmentKaryawan,
          nama_department: namaDepartmentKaryawan,
          jam_masuk_shift: jamMasukShift,
          jam_keluar_shift: jamKeluarShift,
          hari: dayName2,
          jenis_hari_masuk: jenisHariMasuk,
          tipe_karyawan: typeKaryawan,
        };
      }
    });

    //masukan data cuti ke data absen
    results.push(...cutiEntries);
    //masukan data izin ke data absen
    results.push(...izinEntries);
    //masukan data sakit ke data absen
    results.push(...sakitEntries);
    //masukan data mangkir ke data absen
    results.push(...mangkirEntries);

    // Sorting berdasarkan tanggal (terbaru ke terlama)
    results.sort((a, b) => b.waktu_masuk - a.waktu_masuk);

    //cek apakah filter date hanya 1 hari (untuk menampilkan semua karyawan jika hanya satu hari)
    if (startDate === endDate) {
      const dataKaryawanGenerete = generatekaryawanList(
        karyawan,
        karyawanBiodata,
        masterDepartment,
        resultJadwalKaryawan,
        startDate
      );

      results.forEach((absen) => {
        const karyawanDitemukan = dataKaryawanGenerete.find(
          (k) => k.userid === absen.userid
        );

        if (karyawanDitemukan) {
          (karyawanDitemukan.id_pengajuan_lembur = absen.id_pengajuan_lembur),
            (karyawanDitemukan.userid = absen.userid),
            (karyawanDitemukan.waktu_masuk = absen.waktu_masuk),
            (karyawanDitemukan.waktu_keluar = absen.waktu_keluar),
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
            (karyawanDitemukan.name = absen.name),
            (karyawanDitemukan.status_keluar = absen.status_keluar),
            (karyawanDitemukan.menit_pulang_cepat = absen.menit_pulang_cepat),
            (karyawanDitemukan.shift = absen.shift), // Menampilkan shift
            (karyawanDitemukan.status_absen = absen.status_absen),
            (karyawanDitemukan.id_department = absen.id_department),
            (karyawanDitemukan.nama_department = absen.nama_department);
          (karyawanDitemukan.hari = absen.hari),
            (karyawanDitemukan.jenis_hari_masuk = absen.jenis_hari_masuk);
        } else {
          dataKaryawanGenerete.push({
            id_pengajuan_lembur: absen.id_pengajuan_lembur,
            userid: absen.userid,
            waktu_masuk: absen.waktu_masuk,
            waktu_keluar: absen.waktu_keluar,
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
            name: absen.name,
            status_keluar: absen.status_keluar,
            menit_pulang_cepat: absen.menit_pulang_cepat,
            shift: absen.shift,
            status_absen: absen.status_absen,
            id_department: absen.id_department,
            nama_department: absen.nama_department,
            hari: absen.hari,
            jenis_hari_masuk: absen.jenis_hari_masuk,
          });
        }
      });
      const resultAbsen = dataKaryawanGenerete.sort(
        (a, b) => new Date(b.waktu_masuk) - new Date(a.waktu_masuk)
      );
      // console.log(dataKaryawanGenerete);

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
  resultJadwalKaryawan
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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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

    dailycuti.push({
      userid: cuti.id_karyawan,
      waktu_masuk: new Date(startDate),
      waktu_keluar: null,
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
      hari: dayName2,
      jenis_hari_masuk: jenisHariMasuk,
    });
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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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
      hari: dayName2,
      jenis_hari_masuk: jenisHariMasuk,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailyIzin;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailySakit = (
  sakit,
  karyawan,
  karyawanBiodata,
  masterDepartment,
  resultJadwalKaryawan
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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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
    dailySakit.push({
      userid: sakit.id_karyawan,
      waktu_masuk: new Date(startDate),
      waktu_keluar: null,
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
      hari: dayName2,
      jenis_hari_masuk: jenisHariMasuk,
    });
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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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
    hari: dayName2,
    jenis_hari_masuk: jenisHariMasuk,
  });

  return dailyTerlambat;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailyLembur = (
  Lembur,
  karyawan,
  karyawanBiodata,
  masterDepartment,
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

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;
  const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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

  dailyLembur.push({
    id_pengajuan_lembur: Lembur.id,
    userid: Lembur.id_karyawan,
    waktu_masuk: new Date(startDate),
    tgl_masuk: tglMasuk,
    jam_lembur: Lembur.lama_lembur_aktual,
    name: namaKaryawan,
    id_department: namaKaryawanBiodata,
    nama_department: namaDepartmentKaryawan,
  });

  return dailyLembur;
};
// Fungsi untuk memecah rentang tanggal Cuti menjadi array tanggal harian
const generatekaryawanList = (
  karyawan,
  karyawanBiodata,
  masterDepartment,
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

    const filterJadwalKaryawan = resultJadwalKaryawan.filter(
      (data) => data.jenis_karyawan == dataKaryawanBiodata.tipe_karyawan
    );

    // Cek apakah tanggal hari ini ada di data lembur
    const isTodayOvertime = filterJadwalKaryawan.some(
      (data) => data.tanggal_libur == tglHariini
    );

    const idDepartment = dataKaryawanBiodata?.id_department;
    const namaDepartmentKaryawan = dataMasterDepartment?.nama_department;

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
        name: karyawan[i].name,
        status_keluar: "Belum Keluar",
        menit_pulang_cepat: null,
        shift: null, // Menampilkan shift
        status_absen: "Belum Masuk",
        id_department: idDepartment,
        nama_department: namaDepartmentKaryawan,
        hari: null,
        jenis_hari_masuk: null,
        tipe_karyawan: dataKaryawanBiodata.tipe_karyawan,
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

module.exports = absenFunction;
