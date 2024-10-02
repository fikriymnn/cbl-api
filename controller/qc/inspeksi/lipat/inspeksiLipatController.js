const InspeksiLipat = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatResult = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");
const InspeksiLipatPoint = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatPointModel");
const { Op, Sequelize } = require("sequelize");
const User = require("../../../../model/userModel");

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
          include: { model: User, as: "inspektor" },
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
          include: { model: User, as: "inspektor" },
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
          include: { model: User, as: "inspektor" },
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiLipat.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiLipat.findByPk(id, {
          include: [
            { model: User, as: "inspektor" },
            {
              model: InspeksiLipatPoint,
              as: "inspeksi_lipat_point",
              include: [
                {
                  model: InspeksiLipatResult,
                  as: "inspeksi_lipat_result",
                },
                { model: User, as: "inspektor" },
              ],
            },
          ],
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
      const {
        tanggal,
        customer,
        no_io,
        no_jo,
        operator,
        shift,
        jam,
        item,
        mesin,
      } = req.body;

      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      // if (!customer)
      //   return res.status(400).json({ msg: "Field customer kosong!" });
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
        customer,
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
        const inspeksiLipatPoint = await InspeksiLipatPoint.create({
          id_inspeksi_lipat: data.id,
        });

        master_data_fix.forEach((value) => {
          value.id_inspeksi_lipat_point = inspeksiLipatPoint.id;
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
      const inspeksiLipatPoint = await InspeksiLipatPoint.findByPk(id);
      if (inspeksiLipatPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiLipatPoint.update(
        {
          waktu_mulai: new Date(),
          id_inspektor: req.user.id,
          status: "on progress",
        },
        { where: { id: id } }
      );
      res.status(200).json({ msg: "Start Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  stopLipatPoint: async (req, res) => {
    const _id = req.params.id;
    const { hasil_check, lama_pengerjaan } = req.body;

    try {
      for (let i = 0; i < hasil_check.length; i++) {
        if (hasil_check[i].hasil_check == null)
          return res.status(400).json({
            msg: `Point  ${hasil_check[i].point_check} wajib di isi`,
          });
      }

      await InspeksiLipatPoint.update(
        {
          status: "done",
          lama_pengerjaan: lama_pengerjaan,
          waktu_selesai: new Date(),
        },
        { where: { id: _id } }
      );
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

      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  tambahPointLipat: async (req, res) => {
    const id = req.params.id;

    try {
      let array = [];
      const inspeksiLipatPoint = await InspeksiLipatPoint.create({
        id_inspeksi_lipat: id,
      });

      master_data_fix.forEach((value) => {
        value.id_inspeksi_lipat_point = inspeksiLipatPoint.id;
        array.push(value);
      });

      if (array.length == 5) {
        await InspeksiLipatResult.bulkCreate(array);
      }
      res.status(200).json({ msg: "add successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  saveInspeksiLipatPoint: async (req, res) => {
    try {
      const { id } = req.params;
      const { hasil_check } = req.body;

      await InspeksiLipatPoint.update(
        { status: "done" },
        { where: { id: id } }
      );
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

  doneInspeksiLipat: async (req, res) => {
    try {
      const { id } = req.params;
      const { catatan } = req.body;

      const inspeksiLipatPoint = await InspeksiLipatPoint.findAll({
        where: { id_inspeksi_lipat: id },
      });
      const jumlahPeriode = inspeksiLipatPoint.length;
      let totalWaktuCheck = inspeksiLipatPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      let obj = {
        status: "history",
        jumlah_periode: jumlahPeriode,
        waktu_check: totalWaktuCheck,
        catatan: catatan,
      };

      await InspeksiLipat.update(obj, {
        where: { id: id },
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
