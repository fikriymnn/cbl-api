const IncomingOutsourcing = require("../../../../model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingModel");
const IncomingOutsourcingResult = require("../../../../model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingResultModel");
const { Op, Sequelize } = require("sequelize");
const Users = require("../../../../model/userModel");

const IncomingOutsourcingController = {
  getIncomingOutsourcingMesin: async (req, res) => {
    try {
      const mesin = await IncomingOutsourcing.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        where: { status: "incoming" },
        group: ["mesin"],
        order: [[Sequelize.col("count"), "DESC"]],
      });
      res.status(200).json(mesin);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getIncomingOutsourcing: async (req, res) => {
    try {
      const { status, no_jo, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || no_jo || mesin)) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;
        const data = await IncomingOutsourcing.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await IncomingOutsourcing.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await IncomingOutsourcing.findAll({
          include: {
            model: Users,
            as: "inspektor",
          },
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await IncomingOutsourcing.count();
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || no_jo || mesin) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;

        const data = await IncomingOutsourcing.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          where: obj,
        });
        const length = await IncomingOutsourcing.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await IncomingOutsourcing.findByPk(id, {
          include: [
            {
              model: IncomingOutsourcingResult,
              as: "incoming_outsourcing_result",
            },
            {
              model: Users,
              as: "inspektor",
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await IncomingOutsourcing.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createIncomingOutsourcing: async (req, res) => {
    try {
      const {
        tanggal,
        no_io,
        no_jo,
        isi_mata,
        nama_produk,
        jam,
        customer,
        jumlah_druk,
        jumlah_pcs,
      } = req.body;

      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      if (!no_io) return res.status(400).json({ msg: "Field no_io kosong!" });
      if (!no_jo) return res.status(400).json({ msg: "Field no_jo kosong!" });
      if (!jumlah_druk)
        return res.status(400).json({ msg: "Field jumlah druk kosong!" });
      if (!nama_produk)
        return res.status(400).json({ msg: "Field nama produk kosong!" });
      if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      if (!customer)
        return res.status(400).json({ msg: "Field customer kosong!" });

      const data = await IncomingOutsourcing.create({
        tanggal,
        no_io,
        no_jo,
        nama_produk,
        jam,
        customer,
        jumlah_druk,
        jumlah_pcs,
        isi_mata,
      });

      if (data) {
        let array = [];

        master_data_fix.forEach((value) => {
          value.id_incoming_outsourcing = data.id;
          array.push(value);
        });

        if (array.length == 10) {
          await IncomingOutsourcingResult.bulkCreate(array);
        }
      }

      res.status(200).json({ msg: "OK" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  updateIncomingOutsourcing: async (req, res) => {
    try {
      const { id } = req.params;
      const { mesin, foto, lama_pengerjaan, waktu_selesai, catatan, merk } =
        req.body;
      let obj = {
        status: "history",
      };

      if (mesin) obj.mesin = mesin;
      if (foto) obj.foto = foto;
      if (lama_pengerjaan) obj.lama_pengerjaan = lama_pengerjaan;
      if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
      if (catatan) obj.catatan = catatan;
      if (merk) obj.merk = merk;

      await IncomingOutsourcing.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  startIncomingOutsourcing: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await IncomingOutsourcing.update(
        { waktu_mulai: date, id_inspektor: req.user.id },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  stopIncomingOutsourcing: async (req, res) => {
    const id = req.params.id;
    const lama_pengerjaan = req.body.lama_pengerjaan;
    const date = new Date();
    try {
      await IncomingOutsourcing.update(
        { waktu_selesai: date, lama_pengerjaan },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  doneIncomingOutsourcing: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        hasil_check,
        lama_pengerjaan,
        catatan,
        hasil,
        outsourcing,
        jenis,
        jenis_hasil,
        status_jo,
        waktu_sortir,
      } = req.body;
      const date = new Date();
      let obj = {
        status: "history",
        waktu_selesai: date,
        lama_pengerjaan: lama_pengerjaan,
        catatan: catatan,
        hasil_check: hasil,
        outsourcing: outsourcing,
        jenis: jenis,
        jenis_hasil: jenis_hasil,
        status_jo: status_jo,
        waktu_sortir: waktu_sortir,
      };

      await IncomingOutsourcing.update(obj, {
        where: { id: id },
      });

      for (let i = 0; i < hasil_check.length; i++) {
        await IncomingOutsourcingResult.update(
          {
            hasil_check: hasil_check[i].hasil_check,
            keterangan: hasil_check[i].keterangan,
            send: true,
          },
          {
            where: { id: hasil_check[i].id },
          }
        );
      }

      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
};

const master_data_fix = [
  {
    no: 1,
    point_check: "Warna",
    standard: "Color Tolerance",
  },
  {
    no: 2,
    point_check: "Kasar/Kulit Jeruk",
    standard: "Visual",
  },
  {
    no: 3,
    point_check: "Kotor/Bared",
    standard: "Visual",
  },
  {
    no: 4,
    point_check: "Retak",
    standard: "Lipatan di pond",
  },
  {
    no: 5,
    point_check: "Lengket",
    standard: "Visual",
  },
  {
    no: 6,
    point_check: "Keriput",
    standard: "Visual",
  },
  {
    no: 7,
    point_check: "FOIL (Hasil)",
    standard: "Job Order",
  },
  {
    no: 8,
    point_check: "FOIL (Presisi)",
    standard: "Job Order",
  },
  {
    no: 9,
    point_check: "EMBOS (Hasil)",
    standard: "Job Order",
  },
  {
    no: 10,
    point_check: "EMBOS (Presisi)",
    standard: "Job Order",
  },
];

module.exports = IncomingOutsourcingController;
