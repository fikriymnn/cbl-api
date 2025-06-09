const { getAbsensiFunction } = require("../../helper/absenFunction");
const Karyawan = require("../../model/hr/karyawanModel");
const BiodataKaryawan = require("../../model/hr/karyawan/karyawanBiodataModel");
const MasterDepartment = require("../../model/masterData/hr/masterDeprtmentModel");
const MasterDivisi = require("../../model/masterData/hr/masterDivisiModel");
const MasterBagianHr = require("../../model/masterData/hr/masterBagianModel");
const MasterJabatan = require("../../model/masterData/hr/masterJabatanModel");
const PengajuanCuti = require("../../model/hr/pengajuanCuti/pengajuanCutiModel");
const PengajuanSakit = require("../../model/hr/pengajuanSakit/pengajuanSakitModel");
const PengajuanIzin = require("../../model/hr/pengajuanIzin/pengajuanIzinModel");
const PengajuanMangkir = require("../../model/hr/pengajuanMangkir/pengajuanMangkirModel");
const { Op, fn, col, literal, Sequelize } = require("sequelize");

const AbsensiController = {
  getAbsensi: async (req, res) => {
    const { idDepartment, is_active, startDate, endDate } = req.query;

    let obj = {};
    let day = null;
    if (idDepartment) obj.id_department = idDepartment;
    // if (is_active && is_active == "true") {
    //   console.log(1);
    //   obj.is_active = true;
    // } else if (is_active && is_active == "false") {
    //   obj.is_active = false;
    //   console.log(2);
    // }

    if (startDate === endDate) {
      obj.is_active = true;
      // Konversi ke objek Date
      const dateObj = new Date(startDate);

      // Mendapatkan nama hari dalam bahasa Indonesia
      const hariIndonesia = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];

      day = hariIndonesia[dateObj.getDay()]; // Ambil nama hari
    }

    try {
      if (startDate === endDate && day === "Sabtu") {
        // Mendapatkan tanggal sehari sebelumnya
        const yesterdayObj = new Date(startDate);
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);

        const yesterday = yesterdayObj.toISOString().split("T")[0];

        const absenResultYesterday = await getAbsensiFunction(
          yesterday,
          yesterday,
          obj,
          true
        );

        const absenResultYesterdayShift2 = absenResultYesterday.filter(
          (data) => data.shift == "Shift 2"
        );

        const absenResult = await getAbsensiFunction(
          startDate,
          endDate,
          obj,
          true
        );

        // Buat array userid yang shift 2 kemarin dan tidak hadir hari ini
        const excludeUserIds = absenResultYesterdayShift2
          .filter(
            (y) => !absenResult.some((today) => today.userid === y.userid)
          )
          .map((y) => y.userid);

        // Filter data hari ini, kecualikan user yang tidak hadir hari ini dan shift 2 kemarin
        const filteredToday = absenResult.filter(
          (entry) => !excludeUserIds.includes(entry.userid)
        );
        res.status(200).json({ data: filteredToday });
      } else {
        const absenResult = await getAbsensiFunction(
          startDate,
          endDate,
          obj,
          true
        );
        res.status(200).json({ data: absenResult });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getAbsensiRekap: async (req, res) => {
    const { idDepartment, is_active, startDate, endDate } = req.query;

    let obj = {};
    if (idDepartment) obj.id_department = idDepartment;
    if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    }

    try {
      const dataKaryawan = await BiodataKaryawan.findAll({
        where: obj,
        include: [
          {
            model: Karyawan,
            as: "karyawan",
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
        ],
      });

      //cuti khusus
      const cutiKhusus = await PengajuanCuti.findAll({
        where: {
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
          tipe_cuti: "khusus",
          status: "approved",
        },
      });
      //cuti tahunan
      const cutiTahunan = await PengajuanCuti.findAll({
        where: {
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
          tipe_cuti: "tahunan",
          status: "approved",
        },
      });
      //sakit
      const sakit = await PengajuanSakit.findAll({
        where: {
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },

          status: "approved",
        },
      });
      //sakit
      const izin = await PengajuanIzin.findAll({
        where: {
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },

          status: "approved",
        },
      });
      //mangkir
      const mangkir = await PengajuanMangkir.findAll({
        where: {
          tanggal: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },

          status: "approved",
        },
      });

      //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);

      let dataResult = [];
      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        const absenResultFilter = absenResult.filter(
          (absen) => absen.userid === data.id_karyawan
        );

        //untuk total jam lembur biasa
        const lemburBiasaData = absenResultFilter.filter(
          (absen) => absen.jenis_hari_masuk == "Biasa"
        );
        const lemburBiasaJam = lemburBiasaData.reduce(
          (sum, item) => sum + item.jam_lembur,
          0
        );
        const lemburBiasaIstirahatJam = lemburBiasaData.reduce(
          (sum, item) => sum + item.jam_istirahat_lembur,
          0
        );
        const totalLemburBiasaJam = lemburBiasaJam - lemburBiasaIstirahatJam;

        //untuk total jam lembur libur
        const lemburLiburData = absenResultFilter.filter(
          (absen) => absen.jenis_hari_masuk == "Libur"
        );
        const lemburLiburJam = lemburLiburData.reduce(
          (sum, item) => sum + item.jam_lembur,
          0
        );
        const lemburLiburIstirahatJam = lemburLiburData.reduce(
          (sum, item) => sum + item.jam_istirahat_lembur,
          0
        );
        const totalLemburLiburJam = lemburLiburJam - lemburLiburIstirahatJam;

        //untuk mencari data terlambat (kata terlambat di tambah spasi ujungnya karena hasil formatnya seperti itu)
        const dataTerlambat = absenResultFilter.filter(
          (absen) => absen.status_masuk == "Terlambat "
        );

        //untuk cuti khusus
        const dataCutiKhusus = cutiKhusus.filter(
          (cuti) => cuti.id_karyawan == data.id_karyawan
        );

        const jumlahHariCutiKhusus = dataCutiKhusus.reduce(
          (sum, item) => sum + item.jumlah_hari,
          0
        );

        //untuk cuti tahunana
        const dataCutiTahunan = cutiTahunan.filter(
          (cuti) => cuti.id_karyawan == data.id_karyawan
        );

        const jumlahHariCutiTahunan = dataCutiTahunan.reduce(
          (sum, item) => sum + item.jumlah_hari,
          0
        );

        //untuk sakit
        const dataSakit = sakit.filter(
          (sakit) => sakit.id_karyawan == data.id_karyawan
        );
        const jumlahHariSakit = dataSakit.reduce(
          (sum, item) => sum + item.jumlah_hari,
          0
        );

        //untuk izin
        const dataIzin = izin.filter(
          (izin) => izin.id_karyawan == data.id_karyawan
        );
        const jumlahHariIzin = dataIzin.reduce(
          (sum, item) => sum + item.jumlah_hari,
          0
        );

        //untuk mangkir
        const dataMangkir = mangkir.filter(
          (izin) => izin.id_karyawan == data.id_karyawan
        );

        if (dataMangkir.length != 0) {
          console.log(data.karyawan.name);
        }
        const jumlahHariMangkir = dataMangkir.length;

        dataResult.push({
          nama_karyawan: data.karyawan.name,
          nik: data.nik,
          id_department: data.id_department,
          divisi: data.divisi == null ? null : data.divisi?.nama_divisi,
          department:
            data.department == null ? null : data.department.nama_department,
          jabatan: data.jabatan == null ? null : data.jabatan.nama_jabatan,
          jam_lembur_biasa: totalLemburBiasaJam,
          jam_lembur_libur: totalLemburLiburJam,
          jumlah_hari_terlambat: dataTerlambat.length,
          jumlah_hari_cuti_khusus: jumlahHariCutiKhusus,
          jumlah_hari_cuti_tahunan: jumlahHariCutiTahunan,
          jumlah_hari_sakit: jumlahHariSakit,
          jumlah_hari_izin: jumlahHariIzin,
          jumlah_hari_mangkir: jumlahHariMangkir,
          cuti_khusus: dataCutiKhusus,
          cuti_tahunan: dataCutiTahunan,
          sakit: dataSakit,
          izin: dataIzin,
          mangkir: dataMangkir,
          absensi: absenResultFilter,
        });
      }
      res.status(200).json({ data: dataResult });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AbsensiController;
