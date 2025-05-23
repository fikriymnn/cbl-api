const InspeksiLipat = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatResult = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");
const InspeksiLipatPoint = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatPointModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
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
      const {
        status,
        jenis_potong,
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
      if (jenis_potong) obj.jenis_potong = jenis_potong;
      if (mesin) obj.mesin = mesin;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { item: { [Op.like]: `%${search}%` } },
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
      if (page && limit) {
        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiLipatPoint,
              as: "inspeksi_lipat_point",
              attributes: ["id"],
              include: [{ model: User, as: "inspektor" }],
            },
          ],
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
          where: obj,
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
        status_jo,
        qty_jo,
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

      const checkData = await InspeksiLipat.findOne({
        where: { no_jo: no_jo, status: "incoming" },
      });

      // if (checkData) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Lipat" });
      // } else {
      //   const data = await InspeksiLipat.create({
      //     tanggal,
      //     customer,
      //     no_io,
      //     no_jo,
      //     status_jo,
      //     mesin,
      //     operator,
      //     shift,
      //     jam,
      //     item,
      //   });

      //   if (data) {
      //     let array = [];
      //     const inspeksiLipatPoint = await InspeksiLipatPoint.create({
      //       id_inspeksi_lipat: data.id,
      //     });

      //     master_data_fix.forEach((value) => {
      //       value.id_inspeksi_lipat_point = inspeksiLipatPoint.id;
      //       array.push(value);
      //     });

      //     if (array.length == 5) {
      //       await InspeksiLipatResult.bulkCreate(array);
      //     }
      //   }
      //   res.status(200).json({ data, msg: "OK" });
      // }
      const data = await InspeksiLipat.create({
        tanggal,
        customer,
        no_io,
        no_jo,
        status_jo,
        mesin,
        operator,
        shift,
        jam,
        item,
        qty_jo,
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
    const { hasil_check, lama_pengerjaan, qty } = req.body;

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
          qty: qty,
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

      const noDoc = await MasterKodeDoc.findByPk(10);
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
        no_doc: noDoc.kode,
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
    point_check: "Presisi Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 3,
    point_check: "Kotor",
    acuan: "Visual",
  },
  {
    no: 4,
    point_check: "Kerataan Hasil Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 5,
    point_check: "Serat Tercampur",
    acuan: "Sample / Dumy",
  },
];

module.exports = inspeksiLipatController;
