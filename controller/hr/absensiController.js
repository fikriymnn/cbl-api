const dbFinger = require("../../config/databaseFinger");
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../../model/hr/absenModel");
const Karyawan = require("../../model/hr/karyawanModel");
const masterShift = require("../../model/masterData/hr/masterShiftModel");

const userController = {
  getAbsensi: async (req, res) => {
    const { bagian, role } = req.query;

    const query = `
    SELECT 
        a_masuk.USERID,
        a_masuk.CHECKTIME AS waktu_masuk,
        a_keluar.CHECKTIME AS waktu_keluar,
        CASE
            
            WHEN ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), a_masuk.CHECKTIME)) 
                < ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), a_masuk.CHECKTIME))
            THEN 'Shift 1'
            ELSE 'Shift 2'
        END AS shift,
        CASE
           
            WHEN ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), a_masuk.CHECKTIME)) 
                < ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), a_masuk.CHECKTIME))
            THEN
                CASE
                   
                    WHEN a_masuk.CHECKTIME > ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), '00:10:00')
                    THEN TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), '00:10:00'), a_masuk.CHECKTIME)
                    ELSE 0
                END
            
            ELSE
                CASE
                   
                    WHEN a_masuk.CHECKTIME > ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), '00:10:00')
                    THEN TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), '00:10:00'), a_masuk.CHECKTIME)
                    ELSE 0
                END
        END AS menit_terlambat,
        
        CASE
            WHEN 
                CASE
                    
                    WHEN ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), a_masuk.CHECKTIME)) 
                        < ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), a_masuk.CHECKTIME))
                    THEN
                        CASE
                            WHEN a_masuk.CHECKTIME > ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), '00:10:00')
                            THEN TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_1_masuk), '00:10:00'), a_masuk.CHECKTIME)
                            ELSE 0
                        END
                    
                    ELSE
                        CASE
                            WHEN a_masuk.CHECKTIME > ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), '00:10:00')
                            THEN TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_masuk.CHECKTIME), ' ', s_harian.shift_2_masuk), '00:10:00'), a_masuk.CHECKTIME)
                            ELSE 0
                        END
                END > 0
            THEN 'Terlambat'
            ELSE 'Tepat Waktu'
        END AS status_kehadiran,
        CASE
           
            WHEN ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_1_keluar), a_keluar.CHECKTIME)) 
                < ABS(TIMESTAMPDIFF(MINUTE, CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_2_keluar), a_keluar.CHECKTIME))
            THEN
                CASE
                    WHEN a_keluar.CHECKTIME > ADDTIME(CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_1_keluar), '01:00:00')
                    THEN ROUND(TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_1_keluar), '01:00:00'), a_keluar.CHECKTIME) / 60, 2)
                    ELSE 0
                END
           
            ELSE
                CASE
                    WHEN a_keluar.CHECKTIME > ADDTIME(CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_2_keluar), '01:00:00')
                    THEN ROUND(TIMESTAMPDIFF(MINUTE, ADDTIME(CONCAT(DATE(a_keluar.CHECKTIME), ' ', s_harian.shift_2_keluar), '01:00:00'), a_keluar.CHECKTIME) / 60, 2)
                    ELSE 0
                END
        END AS jam_lembur
    FROM 
        CHECKINOUT a_masuk
    JOIN 
        CHECKINOUT a_keluar 
        ON a_masuk.USERID = a_keluar.USERID 
        AND a_masuk.CHECKTYPE = 'I'
        AND a_keluar.CHECKTYPE = 'O'
        AND a_keluar.CHECKTIME > a_masuk.CHECKTIME
    
    JOIN 
        shift_harian s_harian 
        ON DAYNAME(a_masuk.CHECKTIME) = s_harian.hari
    WHERE 
        a_masuk.CHECKTYPE = 'I';
`;

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
          const toleransi = 5 * 60 * 1000; // Toleransi 5 menit dalam milidetik
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

          const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;
          const jamKeluar = `${waktuKeluar.getUTCHours()}:${waktuKeluar.getUTCMinutes()}:${waktuKeluar.getUTCSeconds()}`;

          return {
            USERID: masuk.USERID,
            waktu_masuk: masuk.CHECKTIME,
            waktu_keluar: keluar ? keluar.CHECKTIME : null,
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

          const jamMasuk = `${waktuMasuk.getUTCHours()}:${waktuMasuk.getUTCMinutes()}:${waktuMasuk.getUTCSeconds()}`;

          return {
            USERID: masuk.USERID,
            waktu_masuk: masuk.CHECKTIME,
            waktu_keluar: keluar ? keluar.CHECKTIME : null,
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
