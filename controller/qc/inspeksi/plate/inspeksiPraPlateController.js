const InspeksiPrePress = require("../../../../model/qc/inspeksi/plate/inspeksiPrePressModel");
const InspeksiPraPlate = require("../../../../model/qc/inspeksi/plate/inspeksiPraPlateModel");
const InspeksiKelengkapanPlate = require("../../../../model/qc/inspeksi/plate/inspeksiKelengkapanPlate");
const InspeksiPraPlateResult = require("../../../../model/qc/inspeksi/plate/inspeksiPraPlateResultModel");
const { Op, Sequelize } = require("sequelize");
const Users = require("../../../../model/userModel");

const inspeksiPraPlateController = {
  getInspeksiPraPlateMesin: async (req, res) => {
    try {
      const mesin = await InspeksiPraPlate.findAll({
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

  getInspeksiPraPlate: async (req, res) => {
    try {
      const { status, no_jo, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || no_jo || mesin)) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;
        const data = await InspeksiPraPlate.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiPraPlate.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiPraPlate.findAll({
          include: {
            model: Users,
            as: "inspektor",
          },
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiPraPlate.count();
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || no_jo || mesin) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiPraPlate.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          where: obj,
        });
        const length = await InspeksiPraPlate.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiPraPlate.findByPk(id, {
          include: [
            {
              model: InspeksiPraPlateResult,
              as: "inspeksi_pra_plate_result",
            },
            {
              model: Users,
              as: "inspektor",
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiPraPlate.findAll({
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
  createInpeksiPlate: async (req, res) => {
    try {
      const {
        status_jo,
        tanggal,
        no_io,
        no_jo,
        nama_produk,
        jam,
        customer,
        mesin,
        keterangan,
        total_warna,
      } = req.body;

      if (!status_jo)
        return res.status(400).json({ msg: "Field status jo kosong!" });
      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      if (!no_io) return res.status(400).json({ msg: "Field no_io kosong!" });
      if (!no_jo) return res.status(400).json({ msg: "Field no_jo kosong!" });
      if (!mesin) return res.status(400).json({ msg: "Field mesin kosong!" });
      if (!nama_produk)
        return res.status(400).json({ msg: "Field nama produk kosong!" });
      if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      if (!customer)
        return res.status(400).json({ msg: "Field customer kosong!" });

      // const data_exist = await InspeksiPraPlate.findAll({
      //   order: [["createdAt", "DESC"]],
      //   limit: 1,
      // });
      // console.log(data_exist);
      // if (
      //   (data_exist || data_exist.length > 0) &&
      //   mesin == data_exist[0].mesin
      // ) {
      //   await InspeksiPraPlate.update(
      //     { status: "history" },
      //     { where: { id: data_exist[0].id } }
      //   );
      // }
      await InspeksiPrePress.create({
        status_jo,
        tanggal,
        no_io,
        no_jo,
        nama_produk,
        jam,
        customer,
        mesin,
        keterangan,
        total_warna,
      });

      res.status(200).json({ msg: "OK" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  updateInspeksiPraPlate: async (req, res) => {
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

      await InspeksiPraPlate.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  startInspeksiPraPlate: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await InspeksiPraPlate.update(
        { waktu_mulai: date, id_inspektor: req.user.id },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  stopInspeksiPraPlate: async (req, res) => {
    const id = req.params.id;
    const lama_pengerjaan = req.body.lama_pengerjaan;
    const date = new Date();
    try {
      await InspeksiPraPlate.update(
        { waktu_selesai: date, lama_pengerjaan },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  doneInspeksiPraPlate: async (req, res) => {
    try {
      const { id } = req.params;
      const { hasil_check, lama_pengerjaan, catatan, hasil } = req.body;
      const date = new Date();
      let obj = {
        status: "history",
        waktu_selesai: date,
        lama_pengerjaan: lama_pengerjaan,
        catatan: catatan,
        hasil_check: hasil,
      };

      await InspeksiPraPlate.update(obj, {
        where: { id: id },
      });

      for (let i = 0; i < hasil_check.length; i++) {
        await InspeksiPraPlateResult.update(
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

      const inspeksiPraPlate = await InspeksiPraPlate.findByPk(id);

      await InspeksiKelengkapanPlate.create({
        status_jo: inspeksiPraPlate.status_jo,
        tanggal: inspeksiPraPlate.tanggal,
        no_io: inspeksiPraPlate.no_io,
        no_jo: inspeksiPraPlate.no_jo,
        nama_produk: inspeksiPraPlate.nama_produk,
        jam: inspeksiPraPlate.jam,
        customer: inspeksiPraPlate.customer,
        mesin: inspeksiPraPlate.mesin,
        keterangan: inspeksiPraPlate.keterangan,
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
};

const master_data_fix = [
  {
    no: 1,
    point_check: "Redaksi",
    acuan: "Acc Artwork",
  },
  {
    no: 2,
    point_check: "Design",
    acuan: "Acc Artwork",
  },
  {
    no: 3,
    point_check: "Bleed",
    acuan: "Film Pisau",
  },
  {
    no: 4,
    point_check: "Mounting",
    acuan: "Job Order",
  },
  {
    no: 5,
    point_check: "Kross Potong",
    acuan: "Berdasarkan Potong Bahan",
  },
];

module.exports = inspeksiPraPlateController;
