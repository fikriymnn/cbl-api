const { getAbsensiFunction } = require("../../helper/absenFunction");
const Karyawan = require("../../model/hr/karyawanModel");
const BiodataKaryawan = require("../../model/hr/karyawan/karyawanBiodataModel");
const MasterDepartment = require("../../model/masterData/hr/masterDeprtmentModel");
const MasterDivisi = require("../../model/masterData/hr/masterDivisiModel");
const MasterBagianHr = require("../../model/masterData/hr/masterBagianModel");
const MasterJabatan = require("../../model/masterData/hr/masterJabatanModel");
const { Op, fn, col, literal, Sequelize } = require("sequelize");

const AbsensiController = {
  getAbsensi: async (req, res) => {
    const { idDepartment, is_active, startDate, endDate } = req.query;

    console.log(req.query);

    let obj = {};
    if (idDepartment) obj.id_department = idDepartment;
    // if (is_active && is_active == "true") {
    //   console.log(1);
    //   obj.is_active = true;
    // } else if (is_active && is_active == "false") {
    //   obj.is_active = false;
    //   console.log(2);
    // }

    if (startDate === endDate) obj.is_active = true;
    try {
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);
      res.status(200).json({ data: absenResult });
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
      const dataKaryawan = await BiodataKaryawan.findAll({ where: obj });

      let dataResult = [];
      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        const karyawanData = await BiodataKaryawan.findOne({
          where: { id_karyawan: data.id_karyawan },
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

        //ambil data dari absensi
        const absenResult = await getAbsensiFunction(startDate, endDate, obj);

        dataResult.push({
          nama_karyawan: karyawanData.karyawan.name,
          id_department: karyawanData.id_department,
          divisi:
            karyawanData.divisi == null
              ? null
              : karyawanData.divisi?.nama_divisi,
          department:
            karyawanData.department == null
              ? null
              : karyawanData.department.nama_department,
          jabatan:
            karyawanData.jabatan == null
              ? null
              : karyawanData.jabatan.nama_jabatan,
          absensi: absenResult,
        });
      }
      res.status(200).json({ data: dataResult });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AbsensiController;
