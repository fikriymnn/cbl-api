const dbFinger = require("../../config/databaseFinger");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../../model/hr/absenModel");
const Karyawan = require("../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../model/hr/karyawan/karyawanBiodataModel");
const masterShift = require("../../model/masterData/hr/masterShift/masterShiftModel");
const DataCuti = require("../../model/hr/pengajuanCuti/pengajuanCutiModel");
const DataIzin = require("../../model/hr/pengajuanIzin/pengajuanIzinModel");
const DataSakit = require("../../model/hr/pengajuanSakit/pengajuanSakitModel");

const AbsensiDepartmentController = {
  getAbsensiDepartment: async (req, res) => {
    const { id_department, is_active, startDate, endDate } = req.query;

    let obj = {};
    if (id_department) obj.id_department = id_department;
    if (is_active) obj.is_active = is_active;
    try {
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
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `from` berada dalam rentang
              {
                sampai: {
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `to` berada dalam rentang
              {
                [Op.and]: [
                  { dari: { [Op.lte]: new Date(startDate) } }, // Rentang cuti mencakup startDate
                  { sampai: { [Op.gte]: new Date(endDate) } }, // Rentang cuti mencakup endDate
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
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `from` berada dalam rentang
              {
                sampai: {
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `to` berada dalam rentang
              {
                [Op.and]: [
                  { dari: { [Op.lte]: new Date(startDate) } }, // Rentang cuti mencakup startDate
                  { sampai: { [Op.gte]: new Date(endDate) } }, // Rentang cuti mencakup endDate
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
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `from` berada dalam rentang
              {
                sampai: {
                  [Op.between]: [new Date(startDate), new Date(endDate)],
                },
              }, // `to` berada dalam rentang
              {
                [Op.and]: [
                  { dari: { [Op.lte]: new Date(startDate) } }, // Rentang cuti mencakup startDate
                  { sampai: { [Op.gte]: new Date(endDate) } }, // Rentang cuti mencakup endDate
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
      }

      // Memecah cuti menjadi entri harian
      let cutiEntries = [];
      dataCuti.forEach((cuti) => {
        cutiEntries = [
          ...cutiEntries,
          ...generateDailyCuti(cuti, karyawan, karyawanBiodata),
        ];
      });

      // Memecah izin menjadi entri harian
      let izinEntries = [];
      dataIzin.forEach((izin) => {
        izinEntries = [
          ...izinEntries,
          ...generateDailyIzin(izin, karyawan, karyawanBiodata),
        ];
      });

      // Memecah sakit menjadi entri harian
      let sakitEntries = [];
      dataSakit.forEach((sakit) => {
        sakitEntries = [
          ...sakitEntries,
          ...generateDailySakit(sakit, karyawan, karyawanBiodata),
        ];
      });

      // Ambil shift untuk semua hari
      const shifts = await masterShift.findAll();

      // Proses data untuk menghitung keterlambatan dan lembur
      const results = absensiMasuk.map((masuk) => {
        const keluar = absensiKeluar.find(
          (k) =>
            k.userid === masuk.userid &&
            (k.checktime > masuk.checktime ||
              new Date(k.checktime).getDate() >
                new Date(masuk.checktime).getDate())
        );

        // Dapatkan shift berdasarkan tanggal absensi masuk
        const dayName = new Date(masuk.checktime).toLocaleDateString("id-ID", {
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

        const namaKaryawan = dataKaryawan?.name;
        const idDepartmentKaryawan = dataKaryawanBiodata?.id_department;

        // Ambil jam shift
        const shiftMasuk1 = shiftHariIni.shift_1_masuk; // Jam masuk shift 1
        const shiftKeluar1 = shiftHariIni.shift_1_keluar; // Jam keluar shift 1
        const shiftMasuk2 = shiftHariIni.shift_2_masuk; // Jam masuk shift 2
        const shiftKeluar2 = shiftHariIni.shift_2_keluar; // Jam keluar shift 2

        let menitTerlambat = 0;
        let jamLembur = 0;
        let statusMasuk = "Tepat Waktu";
        let statusKeluar = "Tepat Waktu";
        let statusLembur = "Tidak Lembur";
        let shift = "";

        // Tentukan shift berdasarkan waktu absensi masuk
        let shiftMasukTime, shiftKeluarTime;

        // Konversi waktu ke UTC untuk perbandingan
        const waktuMasuk = new Date(masuk.checktime);
        const waktuKeluar = !keluar ? null : new Date(keluar.checktime);

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
          const toleransi = 15 * 60 * 1000; // Toleransi 15 menit dalam milidetik
          if (waktuMasukUTC.getTime() > shiftMasukTime + toleransi) {
            menitTerlambat = Math.floor(
              (waktuMasukUTC.getTime() - (shiftMasukTime + toleransi)) / 60000
            ); // Hitung selisih dalam menit

            statusMasuk = "Terlambat";
          }

          // Hitung pulang cepat
          //const toleransi = 5 * 60 * 1000; // Toleransi 5 menit dalam milidetik
          if (waktuKeluarUTC.getTime() < shiftKeluarTime) {
            // menitTerlambat = Math.floor(
            //   (waktuKeluarUTC.getTime() - (shiftMasukTime )) / 60000
            // ); // Hitung selisih dalam menit
            statusKeluar = "Pulang Cepat";
          }

          // Hitung lembur
          if (keluar) {
            if (
              shift === "Shift 1" &&
              waktuKeluarUTC > waktuKeluarShift1UTC + 60 * 60 * 1000
            ) {
              jamLembur = Math.floor(
                (waktuKeluarUTC.getTime() - waktuKeluarShift1UTC) / 3600000
              );
              statusLembur = "Lembur";
            } else if (
              shift === "Shift 2" &&
              waktuKeluarUTC > waktuKeluarShift2UTC + 60 * 60 * 1000
            ) {
              jamLembur = Math.floor(
                (waktuKeluarUTC.getTime() - waktuKeluarShift2UTC) / 3600000
              );

              statusLembur = "Lembur";
            }
          }

          const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
          const monthKeluar = getMonthName(waktuKeluar.getUTCMonth() + 1);

          const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
          const tglKeluar = `${waktuKeluar.getUTCDate()}-${monthKeluar}-${waktuKeluar.getFullYear()}`;
          const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;
          const jamKeluar = `${waktuKeluar.getUTCHours()}:${waktuKeluar.getUTCMinutes()}:${waktuKeluar.getUTCSeconds()}`;

          return {
            userid: masuk.userid,
            waktu_masuk: masuk.checktime,
            waktu_keluar: keluar ? keluar.checktime : null,
            tgl_masuk: tglMasuk,
            tgl_keluar: tglKeluar,
            jam_masuk: jamMasuk,
            jam_keluar: jamKeluar,
            menit_terlambat: menitTerlambat,
            jam_lembur: jamLembur,
            status_lembur: statusLembur,
            status_masuk: statusMasuk,
            name: namaKaryawan,
            //status_keluar: statusKeluar,
            shift, // Menampilkan shift
            status_absen: "masuk",
            id_department: idDepartmentKaryawan,
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
          const toleransi = 5 * 60 * 1000; // Toleransi 5 menit dalam milidetik
          if (waktuMasukUTC.getTime() > shiftMasukTime + toleransi) {
            menitTerlambat = Math.floor(
              (waktuMasukUTC.getTime() - (shiftMasukTime + toleransi)) / 60000
            ); // Hitung selisih dalam menit
            statusMasuk = "Terlambat";
          }

          const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);

          const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
          const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;

          return {
            userid: masuk.userid,
            waktu_masuk: masuk.checktime,
            waktu_keluar: keluar ? keluar.checktime : null,
            tgl_masuk: tglMasuk,
            tgl_keluar: null,
            jam_masuk: jamMasuk,
            jam_keluar: null,
            menit_terlambat: menitTerlambat,
            jam_lembur: 0,
            status_lembur: "Belum Keluar",
            status_masuk: statusMasuk,
            name: namaKaryawan,
            //status_keluar: statusKeluar,
            shift, // Menampilkan shift
            status_absen: "masuk",
            id_department: idDepartmentKaryawan,
          };
        }
      });

      //masukan data cuti ke data absen
      results.push(...cutiEntries);
      //masukan data izin ke data absen
      results.push(...izinEntries);
      //masukan data sakit ke data absen
      results.push(...sakitEntries);

      // Sorting berdasarkan tanggal (terbaru ke terlama)
      results.sort((a, b) => b.waktu_masuk - a.waktu_masuk);

      res.status(200).json({ data: results });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

// Fungsi untuk memecah rentang tanggal Cuti menjadi array tanggal harian
const generateDailyCuti = (cuti, karyawan, karyawanBiodata) => {
  let dailycuti = [];
  let startDate = new Date(cuti.dari);
  let endDate = new Date(cuti.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === cuti.id_karyawan
  );

  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === cuti.id_karyawan
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
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
      //status_keluar: statusKeluar,
      shift: null, // Menampilkan shift
      status_absen: "cuti" + " " + cuti.tipe_cuti,
      id_department: namaKaryawanBiodata,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailycuti;
};

// Fungsi untuk memecah rentang tanggal izin menjadi array tanggal harian
const generateDailyIzin = (izin, karyawan, karyawanBiodata) => {
  let dailyIzin = [];
  let startDate = new Date(izin.dari);
  let endDate = new Date(izin.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === izin.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === izin.id_karyawan
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);
    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
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
      //status_keluar: statusKeluar,
      shift: null, // Menampilkan shift
      status_absen: "izin",
      id_department: namaKaryawanBiodata,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailyIzin;
};

// Fungsi untuk memecah rentang tanggal Sakit menjadi array tanggal harian
const generateDailySakit = (sakit, karyawan, karyawanBiodata) => {
  let dailySakit = [];
  let startDate = new Date(sakit.dari);
  let endDate = new Date(sakit.sampai);
  const dataKaryawan = karyawan.find(
    (data) => data.userid === sakit.id_karyawan
  );
  const dataKaryawanBiodata = karyawanBiodata.find(
    (data) => data.id_karyawan === sakit.id_karyawan
  );

  const namaKaryawan = dataKaryawan?.name;
  const namaKaryawanBiodata = dataKaryawanBiodata?.id_department;

  // Iterasi dari tanggal_dari hingga tanggal_sampai
  while (startDate <= endDate) {
    const waktuMasuk = new Date(startDate);
    const monthMasuk = getMonthName(waktuMasuk.getUTCMonth() + 1);

    const tglMasuk = `${waktuMasuk.getUTCDate()}-${monthMasuk}-${waktuMasuk.getFullYear()}`;
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
      //status_keluar: statusKeluar,
      shift: null, // Menampilkan shift
      status_absen: "sakit",
      id_department: namaKaryawanBiodata,
    });
    // Tambah 1 hari
    startDate.setDate(startDate.getDate() + 1);
  }

  return dailySakit;
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

module.exports = AbsensiDepartmentController;
