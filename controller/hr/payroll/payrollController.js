const { getAbsensiFunction } = require("../../../helper/absenFunction");
const Karyawan = require("../../../model/hr/karyawanModel");
const BiodataKaryawan = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterJabatan = require("../../../model/masterData/hr/masterJabatanModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const MasterPayroll = require("../../../model/masterData/hr/masterPayrollModel");
const pengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanPotongan = require("../../../model/hr/karyawan/karyawanPotonganModel");
const masterShift = require("../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../model/masterData/hr/masterShift/masterIstirahatModel");
const { Op, fn, col, literal, Sequelize } = require("sequelize");

const payrollController = {
  getPayroll: async (req, res) => {
    const { id_karyawan, startDate, endDate } = req.query;

    let obj = {};
    if (id_karyawan) obj.id_karyawan = id_karyawan;

    try {
      const pengajuanLemburData = await pengajuanLembur.findAll({
        include: [
          {
            model: Karyawan,
            as: "karyawan",
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
        where: {
          id_karyawan: id_karyawan,
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
          sampai: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      });
      const karyawanData = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
        include: [
          {
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
          {
            model: Karyawan,
            as: "karyawan",
          },
          {
            model: MasterGradeHr,
            as: "grade",
          },
        ],
      });

      // buat tanggal sesuai format
      const resultPengajuanLebur = pengajuanLemburData.map((pengajuan) => {
        const datePengajuan = new Date(pengajuan.dari);
        const day = datePengajuan.getDate();
        const month = getMonthName((datePengajuan.getMonth() + 1).toString());
        const year = datePengajuan.getFullYear();

        return {
          tanggal_lembur: `${day}-${month}-${year}`,
          ...pengajuan.toJSON(),
        };
      });

      //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);

      //hitung payroll berdasarkan data absensi dan pengajuan lembur
      const payroll = await hitungPayroll(
        absenResult,
        karyawanData,
        resultPengajuanLebur
      );
      res.status(200).json({
        data: payroll,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // getPayrollAll: async (req, res) => {
  //   const { startDate, endDate } = req.query;

  //   try {
  //     // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
  //     const dataKaryawan = await BiodataKaryawan.findAll({
  //       where: { id_grade: { [Op.ne]: null } },
  //       include: [
  //         {
  //           model: KaryawanPotongan,
  //           as: "potongan_karyawan",
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan",
  //         },
  //         {
  //           model: MasterGradeHr,
  //           as: "grade",
  //         },
  //         // {
  //         //   model: MasterDivisi,
  //         //   as: "divisi",
  //         // },
  //         // {
  //         //   model: MasterDepartment,
  //         //   as: "department",
  //         // },
  //         // {
  //         //   model: MasterBagianHr,
  //         //   as: "bagian",
  //         // },
  //         // {
  //         //   model: MasterJabatan,
  //         //   as: "jabatan",
  //         // },
  //       ],
  //     });

  //     // 2. Ambil semua data pengajuan lembur sekaligus
  //     const allPengajuanLembur = await pengajuanLembur.findAll({
  //       where: {
  //         id_karyawan: { [Op.in]: dataKaryawan.map((k) => k.id_karyawan) },
  //         dari: {
  //           [Op.between]: [
  //             new Date(startDate).setHours(0, 0, 0, 0),
  //             new Date(endDate).setHours(23, 59, 59, 999),
  //           ],
  //         },
  //         sampai: {
  //           [Op.between]: [
  //             new Date(startDate).setHours(0, 0, 0, 0),
  //             new Date(endDate).setHours(23, 59, 59, 999),
  //           ],
  //         },
  //       },
  //       include: [
  //         {
  //           model: Karyawan,
  //           as: "karyawan",
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan_pengaju",
  //           include: [
  //             {
  //               model: KaryawanBiodata,
  //               as: "biodata_karyawan",
  //               include: [
  //                 // {
  //                 //   model: MasterDivisi,
  //                 //   as: "divisi",
  //                 // },
  //                 {
  //                   model: MasterDepartment,
  //                   as: "department",
  //                 },
  //                 // {
  //                 //   model: MasterBagianHr,
  //                 //   as: "bagian",
  //                 // },
  //               ],
  //             },
  //           ],
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan_hr",
  //         },
  //       ],
  //     });

  //     const resultPengajuanLebur = await allPengajuanLembur.map(
  //       (pengajuan) => ({
  //         tanggal_lembur: `${new Date(pengajuan.dari).getDate()}-${getMonthName(
  //           new Date(pengajuan.dari).getMonth() + 1
  //         )}-${new Date(pengajuan.dari).getFullYear()}`,
  //         ...pengajuan.toJSON(),
  //       })
  //     );

  //     let dataResult = {
  //       periode_dari: startDate,
  //       periode_sampai: endDate,
  //       total: 0,
  //       detail: [],
  //     };

  //     // 3. Loop karyawan dengan optimasi
  //     await Promise.all(
  //       dataKaryawan.map(async (data, i) => {
  //         if (i % 50 === 0)

  //         let obj = { id_karyawan: data.id_karyawan };

  //         // 4. Ambil data lembur dari array yang sudah ada
  //         const pengajuanLemburData = resultPengajuanLebur.filter(
  //           (lembur) => lembur.id_karyawan === data.id_karyawan
  //         );

  //         // 5. Ambil data absensi & hitung payroll secara paralel
  //         const absenResult = await getAbsensiFunction(startDate, endDate, obj);

  //         const payroll = await hitungPayroll(
  //           absenResult,
  //           data,
  //           pengajuanLemburData
  //         );

  //         dataResult.detail.push(payroll);
  //       })
  //     );

  //     // 6. Hitung total menggunakan reduce
  //     dataResult.total = dataResult.detail.reduce(
  //       (acc, curr) => acc + curr.summaryPayroll.total,
  //       0
  //     );

  //     res.status(200).json({ data: dataResult });
  //   } catch (error) {
  //     res.status(500).json({ msg: error.message });
  //   }
  // },

  getPayrollAll: async (req, res) => {
    const { startDate, endDate } = req.query;

    // const dataKaryawan = await BiodataKaryawan.findAll({
    //   where: { is_active: true, id_grade: { [Op.ne]: null } },
    // });

    try {
      // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
      const dataKaryawan = await BiodataKaryawan.findAll({
        where: { id_grade: { [Op.ne]: null }, is_active: true },
        include: [
          {
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
          {
            model: Karyawan,
            as: "karyawan",
          },
          {
            model: MasterGradeHr,
            as: "grade",
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

      // 2. Ambil semua data pengajuan lembur sekaligus
      const allPengajuanLembur = await pengajuanLembur.findAll({
        where: {
          id_karyawan: { [Op.in]: dataKaryawan.map((k) => k.id_karyawan) },
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
          sampai: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
        include: [
          {
            model: Karyawan,
            as: "karyawan",
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

      const dataShift = await masterShift.findAll({
        include: [
          {
            model: masterIstirahat,
            as: "istirahat",
          },
        ],
      });

      // buat tanggal sesuai format
      const resultPengajuanLebur = allPengajuanLembur.map((pengajuan) => {
        const datePengajuan = new Date(pengajuan.dari);
        const day = datePengajuan.getDate();
        const month = getMonthName((datePengajuan.getMonth() + 1).toString());
        const year = datePengajuan.getFullYear();

        return {
          tanggal_lembur: `${day}-${month}-${year}`,
          ...pengajuan.toJSON(),
        };
      });

      let dataResult = {
        periode_dari: startDate,
        periode_sampai: endDate,
        total: 0,
        detail: [],
      };

      // //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, {
        id_grade: { [Op.ne]: null },
      });

      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        // 4. Ambil data lembur dari array yang sudah ada
        const pengajuanLemburData = resultPengajuanLebur.filter(
          (lembur) => lembur.id_karyawan === data.id_karyawan
        );

        //Ambil data lembur dari array yang sudah ada
        const absenResultFilter = absenResult.filter(
          (absen) => absen.userid === data.id_karyawan
        );

        // hitung payroll berdasarkan data absensi dan pengajuan lembur
        const payroll = await hitungPayroll(
          absenResultFilter,
          data,
          pengajuanLemburData,
          dataShift
        );

        dataResult.detail.push(payroll);
      }

      // Menggunakan reduce untuk menjumlahkan nilai total
      const totalSum = dataResult.detail.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.summaryPayroll.total;
      }, 0); // Nilai awal accumulator adalah 0

      dataResult.total = totalSum;

      res.status(200).json({
        data: dataResult,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPayrollBulanan: async (req, res) => {
    const { id_karyawan, startDate, endDate } = req.query;

    let obj = {};
    if (id_karyawan) obj.id_karyawan = id_karyawan;

    try {
      const karyawanData = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
        include: [
          {
            model: MasterGradeHr,
            as: "grade",
          },
          {
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
        ],
      });

      //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);

      //hitung payroll berdasarkan data absensi dan pengajuan lembur
      const payroll = await hitungPayrollBulanan(absenResult, karyawanData);
      res.status(200).json({
        data: payroll,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPayrollBulananAll: async (req, res) => {
    const { startDate, endDate } = req.query;

    // const dataKaryawan = await BiodataKaryawan.findAll({
    //   where: { is_active: true, id_grade: { [Op.ne]: null } },
    // });

    try {
      // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
      const dataKaryawan = await BiodataKaryawan.findAll({
        where: { id_grade: { [Op.ne]: null }, tipe_penggajian: "bulanan" },
        include: [
          {
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
          {
            model: Karyawan,
            as: "karyawan",
          },
          {
            model: MasterGradeHr,
            as: "grade",
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

      let dataResult = {
        periode_dari: startDate,
        periode_sampai: endDate,
        total: 0,
        detail: [],
      };
      //console.log(1);

      // //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, {});
      // console.log(2);

      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        //Ambil data lembur dari array yang sudah ada
        const absenResultFilter = absenResult.filter(
          (absen) => absen.userid === data.id_karyawan
        );

        // hitung payroll berdasarkan data absensi dan pengajuan lembur
        const payroll = await hitungPayrollBulanan(absenResultFilter, data);

        dataResult.detail.push(payroll);
      }
      //console.log(3);

      // Menggunakan reduce untuk menjumlahkan nilai total
      const totalSum = dataResult.detail.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.summaryPayroll.total;
      }, 0); // Nilai awal accumulator adalah 0

      dataResult.total = totalSum;

      res.status(200).json({
        data: dataResult,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

// Fungsi untuk menghitung lembur dengan memperhitungkan istirahat
const hitungPayroll = async (
  data,
  dataKaryawan,
  pengajuanLembur,
  dataShift
) => {
  //data dari grade
  const uangHadir = dataKaryawan.grade.uang_hadir;
  const uangMakan = dataKaryawan.grade.uang_makan;
  const upahPerHari = dataKaryawan.gaji;
  const uangLemburBiasa = dataKaryawan.grade.lembur_biasa;
  const uangLemburLibur = dataKaryawan.grade.lembur_libur;
  const uangMakanLembur = dataKaryawan.grade.uang_makan_lembur;
  const uangDinas = dataKaryawan.grade.uang_dinas;
  const tunjanganKerjaMalam = dataKaryawan.grade.tunjangan_kerja_malam;
  const tunjanganKopi = dataKaryawan.grade.tunjangan_kopi;

  //data dari karyawan
  const tipePenggajianKaryawan = dataKaryawan.tipe_penggajian;
  const potonganKaryawan = dataKaryawan.potongan_karyawan;
  const tipeKaryawan = dataKaryawan.tipe_karyawan;

  const masterPayrollData = await MasterPayroll.findByPk(1);
  const pengajuanPinjaman = await PengajuanPinjaman.findOne({
    where: {
      id_karyawan: dataKaryawan.id_karyawan,
      status_pinjaman: "belum lunas",
    },
  });

  let summaryPayroll = {
    nama_karyawan: dataKaryawan.karyawan.name,
    nik: dataKaryawan.nik,
    id_karyawan: dataKaryawan.id_karyawan,
    divisi:
      dataKaryawan.divisi == null ? null : dataKaryawan.divisi?.nama_divisi,
    id_divisi: dataKaryawan.id_divisi,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan?.nama_jabatan,
    id_jabatan: dataKaryawan.id_jabatan,
    department:
      dataKaryawan.department == null
        ? null
        : dataKaryawan.department.nama_department,
    id_department: dataKaryawan.id_department,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan.nama_jabatan,
    tipe_karyawan: tipeKaryawan,
    tipe_penggajian: tipePenggajianKaryawan,
    rincian: [],
    upahHarianSakit: [],
    potonganPinjaman: null,
    potongan: [],
    potongan_terlambat: [],
    total_potongan: 0,
    total: 0,
    sub_total: 0,
    pembulatan: false,
    pengurangan_penambahan: 0,
    note_pengurangan_penambahan: null,
  };

  //tambah data pengajuan pinjaman
  if (pengajuanPinjaman && tipePenggajianKaryawan == "mingguan") {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.sub_total -= pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;
  }

  //tambah data potogan jika ada
  if (tipePenggajianKaryawan == "mingguan") {
    for (let iPotongan = 0; iPotongan < potonganKaryawan.length; iPotongan++) {
      const dataPotongan = potonganKaryawan[iPotongan];
      summaryPayroll.potongan.push({
        label: dataPotongan.nama_potongan,
        jumlah: 1,
        nilai: dataPotongan.jumlah_potongan,
        total: dataPotongan.jumlah_potongan,
      });

      //pengurangan nilai ke total gaji
      summaryPayroll.total -= dataPotongan.jumlah_potongan;
      summaryPayroll.sub_total -= dataPotongan.jumlah_potongan;
      summaryPayroll.total_potongan += dataPotongan.jumlah_potongan;
    }
  }

  const detailAbsensi = await Promise.all(
    data.map(async (absen) => {
      let payroll = {
        rincian: [],
        potongan: [],
        total: 0,
        data_pengajuan_lembur: null,
      };

      const groupedData = await pengajuanLembur.map((curr) => {
        const tanggal = curr.tanggal_lembur;

        if (tanggal == absen.tgl_keluar) {
          // Jika tanggal belum ada, buat entri baru

          payroll.data_pengajuan_lembur = curr;
        }
      });

      let jamLembur = 0;
      let jamIstirahat = 0;

      const tglAbsen = absen.tgl_absen;
      let dayName = "";

      if (absen.jenis_hari_masuk == "Libur") {
        dayName = "Libur";
      } else {
        dayName = new Date(tglAbsen).toLocaleDateString("id-ID", {
          weekday: "long",
        });
      }

      const shiftHariIni = dataShift.find((shift) => shift.hari === dayName);
      const istirahatList = shiftHariIni.istirahat;
      jamLembur = absen.jam_lembur;

      if (absen.status_lembur === "Lembur Libur") {
        const jam_shift = absen.jam_masuk;
        const jam_keluar = absen.jam_keluar;

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

        jamIstirahat = totalSeconds / 3600;
        jamIstirahat = Math.round(jamIstirahat * 2) / 2; // bulatkan ke 0.5
        jamLembur = absen.jam_lembur - jamIstirahat;
      } else if (absen.status_lembur === "Lembur") {
        let jam_shift = null;
        let jam_keluar = null;
        if (absen.shift == "Shift 1") {
          jam_shift = shiftHariIni.shift_1_keluar;
          jam_keluar = absen.jam_keluar;
        } else {
          jam_shift = shiftHariIni.shift_2_keluar;
          jam_keluar = absen.jam_keluar;
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
        jamIstirahat = totalSeconds / 3600;

        // Bulatkan ke kelipatan 0.5 terdekat
        jamIstirahat = Math.round(jamIstirahat * 2) / 2;

        jamLembur = absen.jam_lembur - jamIstirahat;
      }

      // Perhitungan payroll
      if (
        (absen.status_absen === "masuk" &&
          (absen.status_keluar === "Keluar" ||
            absen.status_keluar === "Pulang Cepat" ||
            absen.status_keluar === "Pulang Cepat : dinas" ||
            absen.status_keluar === "Pulang Cepat : pribadi")) ||
        absen.status_absen === "dinas"
      ) {
        //hanya untuk karyawan mingguan
        if (tipePenggajianKaryawan === "mingguan") {
          payroll.rincian.push({
            label: "upahHarian",
            jumlah: 1,
            nilai: upahPerHari,
            total: upahPerHari,
          });

          payroll.total += upahPerHari;
        }
        //perhitungan tunjangan uang kopi untuk karyawan bulanan
        if (tipePenggajianKaryawan === "bulanan") {
          payroll.rincian.push({
            label: "tunjanganKopi",
            jumlah: 1,
            nilai: tunjanganKopi,
            total: tunjanganKopi,
          });

          payroll.total += tunjanganKopi;
        }

        //untuk perhitungan terlambat & uang hadir mingguan
        if (
          tipePenggajianKaryawan === "mingguan" &&
          absen.jenis_hari_masuk == "Biasa"
        ) {
          if (
            absen.status_masuk == "Terlambat " ||
            absen.status_masuk == "Terlambat : pribadi"
          ) {
            //untuk menentukan jam terlamabat(0.5 sampai 1 jam pertama tidak dapat uang makan dan jam berikutnya potong uang lembur)
            let jamTerlambat = absen.menit_terlambat;
            if (absen.menit_terlambat >= 0.5 && absen.menit_terlambat < 1) {
              jamTerlambat = absen.menit_terlambat - 0.5;
            } else if (
              absen.menit_terlambat >= 0.5 &&
              absen.menit_terlambat >= 1
            ) {
              jamTerlambat = absen.menit_terlambat - 1;
            }

            if (jamTerlambat > 0) {
              const findTerlambat = summaryPayroll.potongan.find(
                (dataT) => dataT.label === "potonganTerlambat"
              );

              if (!findTerlambat) {
                summaryPayroll.potongan.push({
                  label: "potonganTerlambat",
                  jumlah: jamTerlambat,
                  nilai: uangLemburBiasa,
                  total: jamTerlambat * uangLemburBiasa,
                });
              } else {
                findTerlambat.jumlah += jamTerlambat;
                findTerlambat.total += jamTerlambat * uangLemburBiasa;
              }

              //penambahan nilai ke total potongan
              summaryPayroll.total_potongan += jamTerlambat * uangLemburBiasa;
              summaryPayroll.sub_total -= jamTerlambat * uangLemburBiasa;
              //pengurangan nilai ke total gaji
              summaryPayroll.total -= jamTerlambat * uangLemburBiasa;
            }
          } else {
            payroll.rincian.push({
              label: "uangHadir",
              jumlah: 1,
              nilai: uangHadir,
              total: uangHadir,
            });
          }
        }
      }

      //uang hadir untuk hari biasa & karyawan bulanan
      if (
        absen.jenis_hari_masuk == "Biasa" &&
        tipePenggajianKaryawan == "bulanan"
      ) {
        payroll.rincian.push({
          label: "uangHadir",
          jumlah: 1,
          nilai: uangHadir,
          total: uangHadir,
        });
      }

      // Hitung uang lembur jika ada
      if (
        (absen.status_lembur === "Lembur" && jamLembur > 0) ||
        (absen.status_lembur === "Lembur Libur" && jamLembur > 0)
      ) {
        const banyakMakanLembur = Math.floor(
          (jamLembur + jamIstirahat) / masterPayrollData.uang_makan_lembur_per
        );

        // menghitung uang lembur karyawan bulanan, jika jenis hari masuk libur makan dihitung uang lembur libur

        if (
          absen.jenis_hari_masuk === "Libur" &&
          tipePenggajianKaryawan === "bulanan" &&
          absen.jam_lembur === absen.jam_lembur_spl
        ) {
          payroll.rincian.push({
            label: "uangLemburLibur",
            jumlah: jamLembur,
            nilai: uangLemburLibur,
            total: jamLembur * uangLemburLibur,
          });
          payroll.total += jamLembur * uangLemburLibur;
        } else if (
          tipePenggajianKaryawan === "bulanan" &&
          absen.jam_lembur === absen.jam_lembur_spl
        ) {
          payroll.rincian.push({
            label: "uangLembur",
            jumlah: jamLembur,
            nilai: uangLemburBiasa,
            total: jamLembur * uangLemburBiasa,
          });
          payroll.total += jamLembur * uangLemburBiasa;
        }

        // menghitung uang lembur karyawan mingguan
        if (
          tipePenggajianKaryawan === "mingguan" &&
          absen.jam_lembur === absen.jam_lembur_spl
        ) {
          payroll.rincian.push({
            label: "uangLembur",
            jumlah: jamLembur,
            nilai: uangLemburBiasa,
            total: jamLembur * uangLemburBiasa,
          });
          payroll.total += jamLembur * uangLemburBiasa;
        }

        let jamLemburSementara = jamLembur + jamIstirahat;

        //console.log(jamLemburSementara);
        //hitung uang makan lembur
        if (absen.jenis_hari_masuk === "Libur") {
          if (jamLemburSementara >= 4) {
            payroll.rincian.push({
              label: "uangHadir",
              jumlah: 1,
              nilai: uangHadir,
              total: uangHadir,
            });

            jamLemburSementara -= 4;

            if (tipePenggajianKaryawan == "bulanan") {
              jumlahMakanLemburLibur = Math.floor(jamLemburSementara / 4);
              if (dataKaryawan.id_karyawan == 188) {
                console.log(jumlahMakanLemburLibur);
              }
            } else if (tipePenggajianKaryawan == "mingguan") {
              jumlahMakanLemburLibur = Math.floor(jamLemburSementara / 8);
            }
          }

          if (jumlahMakanLemburLibur >= 0) {
            payroll.rincian.push({
              label: "uangMakanLembur",
              jumlah: jumlahMakanLemburLibur,
              nilai: uangMakanLembur,
              total: jumlahMakanLemburLibur * uangMakanLembur,
            });

            payroll.total += jumlahMakanLemburLibur * uangMakanLembur;
          }
        } else {
          payroll.rincian.push({
            label: "uangMakanLembur",
            jumlah: banyakMakanLembur,
            nilai: uangMakanLembur,
            total: banyakMakanLembur * uangMakanLembur,
          });

          payroll.total += banyakMakanLembur * uangMakanLembur;
        }
      }

      // Perhitungan sakit khusus untuk karyawan mingguan
      if (
        absen.status_absen === "sakit" &&
        tipePenggajianKaryawan === "mingguan" &&
        tipeKaryawan === "produksi"
      ) {
        summaryPayroll.upahHarianSakit.push({
          label: "upahHarianSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: upahPerHari,
          total: (masterPayrollData.upah_sakit * upahPerHari) / 100,
        });

        payroll.rincian.push({
          label: "upahHarianSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: upahPerHari,
          total: (masterPayrollData.upah_sakit * upahPerHari) / 100,
        });

        payroll.total += (masterPayrollData.upah_sakit * upahPerHari) / 100;
        summaryPayroll.total +=
          (masterPayrollData.upah_sakit * upahPerHari) / 100;
        summaryPayroll.sub_total +=
          (masterPayrollData.upah_sakit * upahPerHari) / 100;
      }

      // Perhitungan tunjangan kerja malam khusus untuk karyawan mingguan
      if (absen.shift === "Shift 2" && tipePenggajianKaryawan === "mingguan") {
        payroll.rincian.push({
          label: "tunjanganKerjaMalam",
          jumlah: 1,
          nilai: tunjanganKerjaMalam,
          total: tunjanganKerjaMalam,
        });
        payroll.total += tunjanganKerjaMalam;
      }
      // Gabungkan rincian payroll ke summaryPayroll
      payroll.rincian.forEach((item) => {
        if (item.label != "upahHarianSakit") {
          if (!summaryPayroll.rincian[item.label]) {
            summaryPayroll.rincian[item.label] = {
              jumlah: 0,
              nilai: item.nilai,
              total: 0,
            };
          }
          summaryPayroll.rincian[item.label].jumlah += item.jumlah;
          summaryPayroll.rincian[item.label].nilai = item.nilai;
          summaryPayroll.rincian[item.label].total =
            summaryPayroll.rincian[item.label].jumlah * item.nilai;
          summaryPayroll.total += item.total;
          summaryPayroll.sub_total += item.total;
        }
      });

      // Tambahkan payroll ke dalam data absen
      return { ...absen, lama_istirahat: jamIstirahat, payroll };
    })
  );

  //pembulatan bayaran dua digit terakhir
  const pembulatanBayaran = pembulatanAngka(summaryPayroll.sub_total);
  summaryPayroll.total = pembulatanBayaran.nilai;
  summaryPayroll.sub_total = pembulatanBayaran.nilai;
  summaryPayroll.pembulatan = pembulatanBayaran.pembulatan;
  // Ubah rincian summaryPayroll menjadi array
  summaryPayroll.rincian = Object.entries(summaryPayroll.rincian).map(
    ([label, { jumlah, nilai, total }]) => ({ label, jumlah, nilai, total })
  );

  return { summaryPayroll, detailAbsensi };
};

// Fungsi untuk menghitung lembur dengan memperhitungkan istirahat
const hitungPayrollBulanan = async (data, dataKaryawan) => {
  const gajiBulanan = dataKaryawan.gaji;
  const potonganKaryawan = dataKaryawan.potongan_karyawan;
  const tipePenggajianKaryawan = dataKaryawan.tipe_penggajian;
  const tipeKaryawan = dataKaryawan.tipe_karyawan;
  const masterPayrollData = await MasterPayroll.findByPk(1);
  const pengajuanPinjaman = await PengajuanPinjaman.findOne({
    where: {
      id_karyawan: dataKaryawan.id_karyawan,
      status_pinjaman: "belum lunas",
    },
  });

  const lamaKerja = hitungTahunDari(dataKaryawan.tgl_masuk);

  let summaryPayroll = {
    nama_karyawan: dataKaryawan.karyawan.name,
    nik: dataKaryawan.nik,
    id_karyawan: dataKaryawan.id_karyawan,
    divisi:
      dataKaryawan.divisi == null ? null : dataKaryawan.divisi?.nama_divisi,
    id_divisi: dataKaryawan.id_divisi,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan?.nama_jabatan,
    id_jabatan: dataKaryawan.id_jabatan,
    department:
      dataKaryawan.department == null
        ? null
        : dataKaryawan.department.nama_department,
    id_department: dataKaryawan.id_department,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan.nama_jabatan,
    tipe_karyawan: tipeKaryawan,
    tipe_penggajian: tipePenggajianKaryawan,
    gaji: gajiBulanan,
    potonganPinjaman: null,
    potonganSakit: [],
    potonganIzin: [],
    potonganMangkir: [],
    potongan: [],
    potongan_terlambat: [],
    total_potongan: 0,
    tmk: lamaKerja * 10000,
    sub_total: gajiBulanan + lamaKerja * 10000,
    total: gajiBulanan + lamaKerja * 10000,
    pembulatan: false,
    pengurangan_penambahan: 0,
    note_pengurangan_penambahan: null,
  };

  if (pengajuanPinjaman) {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //penambahan nilai ke total potongan
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.sub_total -= pengajuanPinjaman.jumlah_cicilan;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= pengajuanPinjaman.jumlah_cicilan;
  }

  //tambah data potogan jika ada

  for (let iPotongan = 0; iPotongan < potonganKaryawan.length; iPotongan++) {
    const dataPotongan = potonganKaryawan[iPotongan];
    summaryPayroll.potongan.push({
      label: dataPotongan.nama_potongan,
      jumlah: 1,
      nilai: dataPotongan.jumlah_potongan,
      total: dataPotongan.jumlah_potongan,
    });

    //penambahan nilai ke total potongan
    summaryPayroll.total_potongan += dataPotongan.jumlah_potongan;
    summaryPayroll.sub_total -= dataPotongan.jumlah_potongan;
    //pengurangan nilai ke total gaji
    summaryPayroll.total -= dataPotongan.jumlah_potongan;
  }

  const detailAbsensi = await Promise.all(
    data.map(async (absen) => {
      let payroll = {
        rincian: [],
        total: 0,
      };

      // Perhitungan sakit
      if (absen.status_absen === "sakit") {
        summaryPayroll.potonganSakit.push({
          label: "potonganSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: `${masterPayrollData.upah_sakit}% x ${gajiBulanan} / 26 `,
          total: Math.floor(
            (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
          ),
        });

        //penambahan nilai ke total potongan
        summaryPayroll.total_potongan += Math.floor(
          (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
        );
        summaryPayroll.sub_total -= Math.floor(
          (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
        );

        //pengurangan nilai ke total gaji
        summaryPayroll.total -= Math.floor(
          (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
        );
      }
      // Perhitungan izin
      if (absen.status_absen === "izin") {
        summaryPayroll.potonganIzin.push({
          label: "potonganIzin",
          jumlah: 1,
          nilai: `${gajiBulanan} / 26`,
          total: Math.floor(gajiBulanan / 26),
        });

        summaryPayroll.total_potongan += Math.floor(gajiBulanan / 26);
        summaryPayroll.sub_total -= Math.floor(gajiBulanan / 26);
        summaryPayroll.total -= Math.floor(gajiBulanan / 26);
      }

      // Perhitungan izin
      if (absen.status_absen === "mangkir") {
        summaryPayroll.potonganMangkir.push({
          label: "potonganMangkir",
          jumlah: 1,
          nilai: `${gajiBulanan} / 26`,
          total: Math.floor(gajiBulanan / 26),
        });

        summaryPayroll.total_potongan += Math.floor(gajiBulanan / 26);
        summaryPayroll.sub_total -= Math.floor(gajiBulanan / 26);
        summaryPayroll.total -= Math.floor(gajiBulanan / 26);
      }

      if (
        absen.status_masuk === "Terlambat " ||
        absen.status_masuk === "Terlambat : Pribadi"
      ) {
        const jumlahPotonganterlambat = (gajiBulanan / 26 / 7).toFixed(0);

        const findTerlambat = summaryPayroll.potongan_terlambat.find(
          (dataT) => dataT.label === "potonganTerlambat"
        );
        if (!findTerlambat) {
          summaryPayroll.potongan_terlambat.push({
            label: "potonganTerlambat",
            jumlah: absen.menit_terlambat,
            nilai: jumlahPotonganterlambat,
            total: absen.menit_terlambat * jumlahPotonganterlambat,
          });
        } else {
          findTerlambat.jumlah += absen.menit_terlambat;
          findTerlambat.total +=
            absen.menit_terlambat * jumlahPotonganterlambat;
        }

        //pengurangan nilai ke total gaji
        summaryPayroll.total -= absen.menit_terlambat * jumlahPotonganterlambat;
        summaryPayroll.sub_total -=
          absen.menit_terlambat * jumlahPotonganterlambat;
        summaryPayroll.total_potongan +=
          absen.menit_terlambat * jumlahPotonganterlambat;
      }

      if (
        absen.status_keluar === "Pulang Cepat" ||
        absen.status_keluar === "Pulang Cepat : Pribadi"
      ) {
        const jumlahPotonganPulangCepat = (gajiBulanan / 26 / 7).toFixed(0);

        const findTerlambat = summaryPayroll.potongan_terlambat.find(
          (dataT) => dataT.label === "potonganPulangCepat"
        );
        if (!findTerlambat) {
          summaryPayroll.potongan_terlambat.push({
            label: "potonganPulangCepat",
            jumlah: absen.menit_pulang_cepat,
            nilai: jumlahPotonganPulangCepat,
            total: absen.menit_pulang_cepat * jumlahPotonganPulangCepat,
          });
        } else {
          findTerlambat.jumlah += absen.menit_pulang_cepat;
          findTerlambat.total +=
            absen.menit_pulang_cepat * jumlahPotonganPulangCepat;
        }

        //pengurangan nilai ke total gaji
        summaryPayroll.total -=
          absen.menit_pulang_cepat * jumlahPotonganPulangCepat;
        summaryPayroll.sub_total -=
          absen.menit_pulang_cepat * jumlahPotonganPulangCepat;
        summaryPayroll.total_potongan +=
          absen.menit_pulang_cepat * jumlahPotonganPulangCepat;
      }

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );
  //pembulatan bayaran dua digit terakhir
  const pembulatanBayaran = pembulatanAngka(summaryPayroll.sub_total);
  summaryPayroll.total = pembulatanBayaran.nilai;
  summaryPayroll.sub_total = pembulatanBayaran.nilai;
  summaryPayroll.pembulatan = pembulatanBayaran.pembulatan;
  //   // Ubah rincian summaryPayroll menjadi array
  //   summaryPayroll.rincian = Object.entries(summaryPayroll.rincian).map(
  //     ([label, { jumlah, nilai, total }]) => ({ label, jumlah, nilai, total })
  //   );

  return { summaryPayroll, detailAbsensi };
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

// Fungsi untuk membulatkan sesuai aturan
function pembulatanAngka(angka) {
  // Ambil dua digit terakhir
  const duaDigitTerakhir = angka % 100;

  // Jika dua digit terakhir adalah 00, tidak perlu pembulatan
  if (duaDigitTerakhir === 0) {
    return { nilai: angka, pembulatan: false };
  }

  // Tentukan hasil pembulatan
  let hasil =
    duaDigitTerakhir >= 50
      ? angka + (100 - duaDigitTerakhir) // Dibulatkan ke atas
      : angka - duaDigitTerakhir; // Dibulatkan ke bawah

  return { nilai: hasil, pembulatan: hasil !== angka };
}

function hitungTahunDari(tanggal) {
  const sekarang = new Date(); // Tanggal hari ini
  const tanggalTertentu = new Date(tanggal); // Format tanggal: YYYY-MM-DD

  const selisihTahun = sekarang.getFullYear() - tanggalTertentu.getFullYear();

  // Periksa apakah bulan dan hari sudah dilewati tahun ini
  const belumLewat =
    sekarang.getMonth() < tanggalTertentu.getMonth() ||
    (sekarang.getMonth() === tanggalTertentu.getMonth() &&
      sekarang.getDate() < tanggalTertentu.getDate());

  return belumLewat ? 0 : selisihTahun;
}

module.exports = payrollController;
