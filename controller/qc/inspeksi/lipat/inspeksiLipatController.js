const InspeksiLipat = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatResult = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");
const { Op, Sequelize } = require("sequelize");

const inspeksiLipatController = {
  getInspeksiLipatMesin: async (req, res) => {
    try {
      const mesin = await InspeksiLipat.findAll({
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

  getInspeksiLipat: async (req, res) => {
    try {
      const { status, jenis_potong, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || jenis_potong || mesin)) {
        if (status) obj.status = status;
        if (jenis_potong) obj.jenis_potong = jenis_potong;
        if (mesin) obj.mesin = mesin;
        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiLipat.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiLipat.count();
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || jenis_potong || mesin) {
        if (status) obj.status = status;
        if (jenis_potong) obj.jenis_potong = jenis_potong;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiLipat.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id && req.user.name) {
        const data = await InspeksiLipat.findByPk(id, {
          include: {
            model: InspeksiLipatResult,
            as: "inspeksi_lipat_result",
          },
        });

        // if (data && !data?.inspector) {
        //   await InspeksiLipat.update(
        //     { inspector: req.user.name },
        //     { where: { id } }
        //   );
        // }

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createInpeksiPotong: async (req, res) => {
    try {
      const { tanggal, no_io, no_jo, operator, shift, jam, item, mesin } =
        req.body;

      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      if (!no_io) return res.status(400).json({ msg: "Field no_io kosong!" });
      if (!no_jo) return res.status(400).json({ msg: "Field no_jo kosong!" });
      if (!mesin) return res.status(400).json({ msg: "Field mesin kosong!" });
      if (!operator)
        return res.status(400).json({ msg: "Field operator kosong!" });
      if (!shift) return res.status(400).json({ msg: "Field shift kosong!" });
      if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      if (!item) return res.status(400).json({ msg: "Field item kosong!" });

      // const data_exist = await InspeksiLipat.findAll({
      //   order: [["createdAt", "DESC"]],
      //   limit: 1,
      // });
      // console.log(data_exist);
      // if (
      //   (data_exist || data_exist.length > 0) &&
      //   mesin == data_exist[0].mesin
      // ) {
      //   await InspeksiLipat.update(
      //     { status: "history" },
      //     { where: { id: data_exist[0].id } }
      //   );
      // }

      const data = await InspeksiLipat.create({
        tanggal,
        no_io,
        no_jo,
        mesin,
        operator,
        shift,
        jam,
        item,
      });

      if (data) {
        let array = [];

        master_data_fix.forEach((value) => {
          value.id_inspeksi_lipat = data.id;
          array.push(value);
        });

        if (array.length == 5) {
          await InspeksiLipatResult.bulkCreate(array);
        }
      }
      res.status(200).json({ data, msg: "OK" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  updateInspeksiLipat: async (req, res) => {
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

      await InspeksiLipat.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  startInspeksiLipat: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await InspeksiLipat.update({ waktu_mulai: date }, { where: { id: id } }),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  stopInspeksiLipat: async (req, res) => {
    const id = req.params.id;
    const lama_pengerjaan = req.body.lama_pengerjaan;
    const date = new Date();
    try {
      await InspeksiLipat.update(
        { waktu_selesai: date, lama_pengerjaan },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  doneInspeksiLipat: async (req, res) => {
    try {
      const { id } = req.params;
      const { hasil_check, lama_pengerjaan, catatan, merk } = req.body;
      const date = new Date();
      let obj = {
        status: "history",
        waktu_selesai: date,
        lama_pengerjaan: lama_pengerjaan,
        catatan: catatan,
        merk: merk,
      };

      const inspeksi = await InspeksiLipat.update(obj, {
        where: { id: id },
      });

      for (let i = 0; i < hasil_check.length; i++) {
        await InspeksiLipatResult.update(
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
    point_check: "Keriput",
    acuan: "Visual",
  },
  {
    no: 2,
    point_check: "Presisis Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 3,
    point_check: "Kotor",
    acuan: "Visual",
  },
  {
    no: 4,
    point_check: "Karatan Hasil Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 5,
    point_check: "Serat Tercampur",
    acuan: "Sample / Dumy",
  },
];

module.exports = inspeksiLipatController;