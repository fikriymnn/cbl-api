const masterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");
const Department = require("../../../../model/masterData/qc/department/masterDepartmentModel");
const DepartmentCetakModel = require("../../../../model/masterData/qc/department/departmentCetakModel");

const masterKodeMasalahCetakController = {
  getMasterKodeMasalahCetak: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, masalah, status } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (status) obj.status = status;

    try {
      if (!_id) {
        const response = await masterKodeMasalahCetak.findAll({
          where: obj,
        });
        res.status(200).json(response);
      } else {
        const response = await masterKodeMasalahCetak.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMasalahCetak: async (req, res) => {
    const {
      kode,
      masalah,
      sumber_masalah,
      kriteria,
      persen_kriteria,
      department,
    } = req.body;
    if (!kode || !masalah || !sumber_masalah || !kriteria || !persen_kriteria)
      return res.status(404).json({ msg: "incomplete data!!" });

    // for (let index = 0; index < department.length; index++) {
    //   const dataDepartment = department[index];
    //   if (dataDepartment.id_department == null)
    //     return res
    //       .status(404)
    //       .json({ msg: "id department tidak boleh kosong" });
    //   if (dataDepartment.nama_department == null)
    //     return res
    //       .status(404)
    //       .json({ msg: "nama department tidak boleh kosong" });
    // }

    try {
      const response = await masterKodeMasalahCetak.create({
        kode,
        masalah,
        sumber_masalah,
        kriteria,
        persen_kriteria,
      });

      // for (let index = 0; index < department.length; index++) {
      //   await DepartmentCetakModel.create({
      //     id_masalah_cetak: response.id,
      //     id_department: department[index].id,
      //   });
      // }

      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKodeMasalahCetak: async (req, res) => {
    const _id = req.params.id;
    const {
      kode,
      masalah,
      sumber_masalah,
      kriteria,
      persen_kriteria,
      department,
    } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (sumber_masalah) obj.sumber_masalah = sumber_masalah;
    if (kriteria) obj.kriteria = kriteria;
    if (persen_kriteria) obj.persen_kriteria = persen_kriteria;

    try {
      await masterKodeMasalahCetak.update(obj, { where: { id: _id } });

      // for (let index = 0; index < department.length; index++) {
      //   await DepartmentCetakModel.create({
      //     id_department: department[index].id,
      //   });
      // }
      res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahCetak: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterKodeMasalahCetak.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahCetakDepartment: async (req, res) => {
    const _id = req.params.id;
    try {
      await DepartmentCetakModel.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  addMasterKodeMasalahCetakDepartment: async (req, res) => {
    const _id = req.params.id;
    const { id_department } = req.body;
    try {
      await DepartmentCetakModel.create({
        //id_department: id_department,
        id_masalah_cetak: _id,
      }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKodeMasalahCetakController;
