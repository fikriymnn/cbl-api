const { Op, Sequelize } = require("sequelize");
const InspeksiBahan = require("../../../../model/qc/inspeksi/bahan/inspeksiBahanModel");
const InspeksiBahanResult = require("../../../../model/qc/inspeksi/bahan/inspeksiBahanResultModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const inspeksiBahanController = {
  getInspeksiBahan: async (req, res) => {
    try {
      const { status, search, page, limit, start_date, end_date } = req.query;
      const { id } = req.params;
      let obj = {};
      if (status) obj.status = status;
      if (search)
        obj = {
          [Op.or]: [
            { no_lot: { [Op.like]: `%${search}%` } },
            { no_surat_jalan: { [Op.like]: `%${search}%` } },
            { no_jo: { [Op.like]: `%${search}%` } },
            { supplier: { [Op.like]: `%${search}%` } },
            { jenis_kertas: { [Op.like]: `%${search}%` } },
            { ukuran: { [Op.like]: `%${search}%` } },
            { jumlah: { [Op.like]: `%${search}%` } },
          ],
        };
      if (start_date && end_date) {
        obj.createdAt = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      } else if (start_date) {
        obj.tgl = {
          [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0), // Set jam startDate ke 00:00:00:00
        };
      } else if (end_date) {
        obj.tgl = {
          [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
        };
      }
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (page && limit) {
        const data = await InspeksiBahan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiBahan.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiBahan.findByPk(id, {
          include: { model: InspeksiBahanResult, as: "inspeksi_bahan_result" },
        });

        let array = [];
        data.inspeksi_bahan_result.forEach((value) => {
          value.metode = value.metode?.split("|");
          value.target = value.target?.split("|");
          array.push(value);
        });
        if (array.length == 9) {
          data.inspeksi_bahan_result = array;
        }
        return res.status(200).json({ data });
      } else {
        const data = await InspeksiBahan.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createInspeksiBahan: async (req, res) => {
    try {
      const {
        tanggal,
        no_surat_jalan,
        supplier,
        jenis_kertas,
        ukuran,
        jam,
        jumlah,
        jumlah_pallet,
        no_jo,
      } = req.body;

      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      else if (!no_surat_jalan)
        return res.status(400).json({ msg: "Field no_surat_jalan kosong!" });
      else if (!supplier)
        return res.status(400).json({ msg: "Field supplier kosong!" });
      else if (!jenis_kertas)
        return res.status(400).json({ msg: "Field jenis_kertas kosong!" });
      else if (!ukuran)
        return res.status(400).json({ msg: "Field ukuran kosong!" });
      else if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      else if (!jumlah)
        return res.status(400).json({ msg: "Field jumlah kosong!" });

      const data = await InspeksiBahan.create({
        tanggal,
        no_surat_jalan,
        no_jo,
        supplier,
        jenis_kertas,
        ukuran,
        jam,
        jumlah,
        jumlah_pallet,
      });

      if (data) {
        const array = [];
        master_result_fix.forEach((value) => {
          value.id_inspeksi_bahan = data.id;
          array.push(value);
        });
        if (array.length == 9) {
          await InspeksiBahanResult.bulkCreate(array);
        }
      }
      return res.status(200).json({ data, msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  updateInspeksiBahan: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        hasil_rumus,
        no_lot,
        verifikasi,
        catatan,
        total_skor,
        jumlah_pallet,
      } = req.body;
      // console.log(req.body);
      let obj = {
        status: "history",
      };
      if (hasil_rumus) obj.hasil_rumus = hasil_rumus;
      if (no_lot) obj.no_lot = no_lot;
      if (verifikasi) obj.verifikasi = verifikasi;
      if (catatan) obj.catatan = catatan;
      if (total_skor) obj.total_skor = total_skor;
      if (jumlah_pallet) obj.jumlah_pallet = jumlah_pallet;

      const noDoc = await MasterKodeDoc.findByPk(1);
      if (noDoc) obj.no_doc = noDoc.kode;

      await InspeksiBahan.update(obj, {
        where: { id: id },
      });
      // const inspeksi = await InspeksiBahan.findByPk(id);
      // if (verifikasi == "Diterima") {
      //   const request = await axios.post(
      //     `${process.env.LINK_P1}/api/approve-incoming-bahan/${inspeksi.no_surat_jalan}`,
      //     {}
      //   );
      // }
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  deleteInspeksiBahan: async (req, res) => {
    const id = req.params.id;
    try {
      await InspeksiBahan.destroy({ where: { id: id } }),
        res.status(200).json({ msg: "delete successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  startInspeksiBahan: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await InspeksiBahan.update(
        {
          waktu_mulai: date,
          inspector: req.user.name,
          id_inspektor: req.user.id,
        },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  stopInspeksiBahan: async (req, res) => {
    const id = req.params.id;
    const lama_pengerjaan = req.body.lama_pengerjaan;
    const date = new Date();
    try {
      const data = await InspeksiBahanResult.findAll({
        where: {
          id_inspeksi_bahan: id,
        },
      });
      let total_skor = 0;
      let counter = 0;
      data.forEach((v, i) => {
        if (v.keterangan_hasil == "sesuai") {
          total_skor += v.bobot;
        }
        counter++;
      });

      if (data.length == counter) {
        await InspeksiBahan.update(
          { waktu_selesai: date, lama_pengerjaan, total_skor },
          { where: { id: id } }
        );
      }

      res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

const master_result_fix = [
  {
    no: 1,
    keterangan: "Jenis Kertas",
    alat_ukur: "-",
    metode: "Visual",
    target: "Sesuai Surat Jalan",
    bobot: 25,
  },
  {
    no: 2,
    keterangan: "Gramatur",
    alat_ukur: "Timbangan digital",
    metode:
      "Potongan kertas ukuran 10x10cm area KIRI,TENGAH, KANAN|Timbang masing-masing beratnya|Jumlahkan dan hitung nilai rata ratanya (KIRI<TENGAH<KANAN:3)",
    target: "Gramatur sesuai surat jalan|Toleransi +-4%",
    bobot: 20,
  },
  {
    no: 3,
    keterangan: "Thickness",
    alat_ukur: "Thickness Gauge",
    metode: "Ukur ketebalan masing-masing kertas yang sudah di point-2",
    target: "-",
    bobot: 15,
  },
  {
    no: 4,
    keterangan: "Arah Serat",
    alat_ukur: "Label Tercantum",
    metode: "Lihat Ukuran",
    target: "Sesuai arah serat di surat jalan",
    bobot: 10,
  },
  {
    no: 5,
    keterangan: "Coating Depan",
    alat_ukur: "Kaca Pembesar",
    metode: "Visual",
    target: "Permukaan Bersih",
    bobot: 10,
  },
  {
    no: 6,
    keterangan: "Ukuran",
    alat_ukur: "Mistar/Penggaris",
    metode: "Diukur Panjang dan Lebar",
    target: "Sesuai Size di surat jalan, toleransi tidak boleh <= 2mm",
    bobot: 5,
  },
  {
    no: 7,
    keterangan: "Gelombang",
    alat_ukur: "Penggaris",
    metode: "Toleransi melengkung",
    target: "Sesuai Size di surat jalan, toleransi tidak boleh <= 2mm",
    bobot: 5,
  },
  {
    no: 8,
    keterangan: "Warna",
    alat_ukur: "Color Tolerance/Sample",
    metode: "Visual",
    target: "Warna Dasar Sesuai",
    bobot: 5,
  },
  {
    no: 9,
    keterangan: "Quantity",
    alat_ukur: "Hitung Manual",
    metode: "Sampling Sesuai Standar Per Pack AQL",
    target: "Sesuai Per Pack",
    bobot: 5,
  },
];

module.exports = inspeksiBahanController;
