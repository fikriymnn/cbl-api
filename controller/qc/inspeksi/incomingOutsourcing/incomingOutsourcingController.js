const IncomingOutsourcing = require("../../../../model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingModel");
const IncomingOutsourcingResult = require("../../../../model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingResultModel");
const { Op, Sequelize } = require("sequelize");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
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
      const {
        status,
        no_jo,
        mesin,
        page,
        limit,
        search,
        start_date,
        end_date,
      } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (no_jo) obj.no_jo = no_jo;
      if (mesin) obj.mesin = mesin;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
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

      //console.log(search);
      if (page && limit) {
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
          where: obj,
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
        status_jo,
        qty_jo,
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

      const checkData = await IncomingOutsourcing.findOne({
        where: { no_jo: no_jo, status: "incoming" },
      });

      // if (checkData) {
      //   res.status(200).json({
      //     msg: "JO sedang di proses oleh QC pada Incoming Outourcing",
      //   });
      // } else {
      //   const data = await IncomingOutsourcing.create({
      //     tanggal,
      //     no_io,
      //     no_jo,
      //     nama_produk,
      //     jam,
      //     customer,
      //     jumlah_druk,
      //     jumlah_pcs,
      //     isi_mata,
      //   });

      //   if (data) {
      //     let array = [];

      //     master_data_fix.forEach((value) => {
      //       value.id_incoming_outsourcing = data.id;
      //       array.push(value);
      //     });

      //     if (array.length == 10) {
      //       await IncomingOutsourcingResult.bulkCreate(array);
      //     }
      //   }

      //   res.status(200).json({ msg: "OK" });
      // }
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
        status_jo,
        qty_jo,
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
      const noDoc = await MasterKodeDoc.findByPk(12);
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
        no_doc: noDoc.kode,
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
