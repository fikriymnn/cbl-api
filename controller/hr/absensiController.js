const dbFinger = require("../../config/databaseFinger");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../../model/hr/absenModel");
const Karyawan = require("../../model/hr/karyawanModel");
const masterShift = require("../../model/masterData/hr/masterShiftModel");

const userController = {
  getAbsensi: async (req, res) => {
    const { bagian, role } = req.query;

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

    try {
      // const results = await dbFinger.query(query2, {
      //   type: dbFinger.QueryTypes.SELECT,
      // });
      // const user = await dbFinger.query(
      //   `
      //   SELECT USERID, name, FROM USERINFO
      //     `,
      //   {
      //     type: dbFinger.QueryTypes.SELECT,
      //   }
      // );

      const karyawan = await Karyawan.findAll();

      // Ambil semua data absensi masuk
      const absensiMasuk = await absensi.findAll({
        where: {
          CHECKTYPE: "I",
        },
      });

      const absensiKeluar = await absensi.findAll({
        where: {
          CHECKTYPE: "O",
        },
      });

      // Ambil shift untuk semua hari
      const shifts = await masterShift.findAll();

      // Proses data untuk menghitung keterlambatan dan lembur
      const results = absensiMasuk.map((masuk) => {
        const keluar = absensiKeluar.find(
          (k) =>
            k.USERID === masuk.USERID &&
            (k.CHECKTIME > masuk.CHECKTIME ||
              new Date(k.CHECKTIME).getDate() >
                new Date(masuk.CHECKTIME).getDate())
        );

        // Dapatkan shift berdasarkan tanggal absensi masuk
        const dayName = new Date(masuk.CHECKTIME).toLocaleDateString("id-ID", {
          weekday: "long",
        });
        const shiftHariIni = shifts.find((shift) => shift.hari === dayName);
        const dataKaryawan = karyawan.find(
          (data) => data.USERID === masuk.USERID
        );
        const namaKaryawan = dataKaryawan.name;

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
        const waktuMasuk = new Date(masuk.CHECKTIME);
        const waktuKeluar = !keluar ? null : new Date(keluar.CHECKTIME);

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

          console.log(waktuKeluarShift2UTC);

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
            console.log(menitTerlambat);
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
            USERID: masuk.USERID,
            waktu_masuk: masuk.CHECKTIME,
            waktu_keluar: keluar ? keluar.CHECKTIME : null,
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
            USERID: masuk.USERID,
            waktu_masuk: masuk.CHECKTIME,
            waktu_keluar: keluar ? keluar.CHECKTIME : null,
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
          };
        }
      });
      //console.log(results);
      res.status(200).json({ data: results });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = userController;
