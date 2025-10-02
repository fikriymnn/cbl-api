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
        const aaa = absenResultYesterday.find((d) => d.userid == 44);
        const bbb = absenResult.find((d) => d.userid == 44);

        // Buat array userid yang shift 2 kemarin dan tidak hadir hari ini
        const excludeUserIds = absenResultYesterdayShift2
          .filter(
            (y) => !absenResult.some((today) => today.userid === y.userid)
          )
          .map((y) => y.userid);

        // Filter data hari ini, kecualikan user yang tidak hadir hari ini dan shift 2 kemarin
        const filteredToday = absenResult.filter((entry) => {
          const isBelumMasuk =
            entry.status_absen?.toLowerCase().trim() === "belum masuk";
          const wasInShift2Yesterday = absenResultYesterdayShift2.some(
            (y) => String(y.userid) === String(entry.userid)
          );
          // Jika belum masuk dan kemarin shift 2, hapus (return false)
          if (isBelumMasuk && wasInShift2Yesterday) {
            return false;
          }
          return true;
        });
        res.status(200).json({
          data: filteredToday,
          tes: aaa,
          eiii: bbb,
        });
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
    const { idDepartment, id_karyawan, is_active, startDate, endDate } =
      req.query;

    let obj = {};
    if (idDepartment) obj.id_department = idDepartment;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    }

    try {
      const dataPeriode = splitPerMonth(startDate, endDate);
      const differentMoth = isDifferentMonth(startDate, endDate);

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
      console.log(req.query);

      const dataRekap = await getRekapAbsensi(
        startDate,
        endDate,
        dataKaryawan,
        obj,
        true
      );

      res.status(200).json({ data: dataRekap });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  getAbsensiMonthPeriode: async (req, res) => {
    const { idDepartment, is_active, startDate, endDate } = req.query;

    let obj = {};
    if (idDepartment) obj.id_department = idDepartment;
    if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    }

    try {
      const dataPeriode = splitPerMonth(startDate, endDate);
      const differentMoth = isDifferentMonth(startDate, endDate);

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

      let dataRekap = [];

      for (let i = 0; i < dataPeriode.length; i++) {
        const e = dataPeriode[i];
        const rekap = await getRekapAbsensi(
          e.startPeriode,
          e.endPeriode,
          dataKaryawan,
          obj,
          false
        );
        dataRekap.push({ ...e, rekapAbsen: rekap });
      }

      res.status(200).json({ data: dataRekap });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

async function getRekapAbsensi(startDate, endDate, dataKaryawan, obj, absen) {
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
    const totalLemburBiasaJam = lemburBiasaJam - (lemburBiasaIstirahatJam || 0);

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
      (absen) =>
        absen.status_masuk == "Terlambat " ||
        absen.status_masuk == "Terlambat : Pribadi"
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

    const jumlahHariMangkir = dataMangkir.length;

    if (absen == true) {
      dataResult.push({
        nama_karyawan: data?.karyawan?.name,
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
    } else {
      dataResult.push({
        nama_karyawan: data?.karyawan?.name,
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
      });
    }
  }

  return dataResult;
}

function isDifferentMonth(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const isDifferent =
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth();

  return isDifferent;
}

function splitPerMonth(startDateStr, endDateStr) {
  const result = [];

  // Parse tanggal dengan cara yang lebih eksplisit untuk menghindari masalah timezone
  const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split("-").map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  let year = startDate.getFullYear();
  let month = startDate.getMonth();

  while (new Date(year, month, 1) <= endDate) {
    const isFirst =
      year === startDate.getFullYear() && month === startDate.getMonth();
    const isLast =
      year === endDate.getFullYear() && month === endDate.getMonth();

    // Untuk startPeriode: gunakan tanggal awal jika bulan pertama, atau tanggal 1 jika bukan
    let startPeriode;
    if (isFirst) {
      startPeriode = new Date(startDate);
    } else {
      startPeriode = new Date(year, month, 1);
    }

    // Untuk endPeriode: gunakan tanggal akhir jika bulan terakhir, atau akhir bulan jika bukan
    let endPeriode;
    if (isLast) {
      endPeriode = new Date(endDate);
    } else {
      endPeriode = new Date(year, month + 1, 0); // Hari terakhir bulan ini
    }

    // Format tanggal ke string YYYY-MM-DD
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    result.push({
      bulan: startPeriode.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      startPeriode: formatDate(startPeriode),
      endPeriode: formatDate(endPeriode),
    });

    // Naik ke bulan berikutnya
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return result;
}
module.exports = AbsensiController;
