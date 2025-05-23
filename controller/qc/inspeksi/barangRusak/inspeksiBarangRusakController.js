const { Op, Sequelize } = require("sequelize");
const InspeksiBarangRusak = require("../../../../model/qc/inspeksi/barangRusak/inspeksiBarangRusakModel");
const InspeksiBarangRusakDefect = require("../../../../model/qc/inspeksi/barangRusak/inspeksiBarangRusakDefectModel");
const MasterBarangRusakDefect = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahBarangRusak");

const User = require("../../../../model/userModel");

const inspeksiBarangRusakController = {
  getInspeksiBarangRusak: async (req, res) => {
    try {
      const { status, tgl, page, limit, search } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};

      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;

        const length = await InspeksiBarangRusak.count({ where: obj });
        const data = await InspeksiBarangRusak.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiBarangRusak.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiBarangRusak.count({ where: obj });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;

        const data = await InspeksiBarangRusak.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiBarangRusak.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiBarangRusak.findByPk(id, {
          include: [
            {
              model: InspeksiBarangRusakDefect,
              as: "inspeksi_barang_rusak_defect",
            },
            {
              model: User,
              as: "inspektor",
            },
          ],
        });

        const pointDefect = await InspeksiBarangRusakDefect.findAll({
          attributes: [
            [
              Sequelize.fn("SUM", Sequelize.col("setting_awal")),
              "setting_awal",
            ],
            [Sequelize.fn("SUM", Sequelize.col("druk_awal")), "druk_awal"],
            [Sequelize.fn("SUM", Sequelize.col("sub_total")), "sub_total"],
          ],

          where: { id_inspeksi_barang_rusak: id },
        });
        const barangBaik = data.qty_rusak - pointDefect[0].sub_total;

        return res
          .status(200)
          .json({ data: data, defect: pointDefect, barangBaik: barangBaik });
      } else {
        const data = await InspeksiBarangRusak.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiBarangRusak: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      status_jo,
      operator,
      nama_produk,
      customer,
      qty_rusak,
      qty_jo,
    } = req.body;

    try {
      const checkData = await InspeksiBarangRusak.findOne({
        where: { no_jo: no_jo, status: "incoming" },
      });
      // if (checkData) {
      //   res
      //     .status(200)
      //     .json({
      //       msg: "JO sedang di proses oleh QC pada proses Sorting barang RS",
      //     });
      // } else {
      //   const inspeksiBarangRusak = await InspeksiBarangRusak.create({
      //     tanggal: new Date(),
      //     no_jo,
      //     no_io,
      //     operator,
      //     nama_produk,
      //     customer,
      //     qty_rusak,
      //     status_jo,
      //   });

      //   //   const masterBarangRusakDefect = await MasterBarangRusakDefect.findAll({
      //   //     where: { status: "aktif" },
      //   //   });

      //   //   for (let index = 0; index < masterBarangRusakDefect.length; index++) {
      //   //     const dataMaster = masterBarangRusakDefect[index];
      //   //     await InspeksiBarangRusakDefect.create({
      //   //       id_inspeksi_barang_rusak: inspeksiBarangRusak.id,
      //   //       kode: dataMaster.kode,
      //   //       masalah: dataMaster.masalah,
      //   //       asal_temuan: dataMaster.asal_temuan,
      //   //     });
      //   //   }

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const inspeksiBarangRusak = await InspeksiBarangRusak.create({
        tanggal: new Date(),
        no_jo,
        no_io,
        operator,
        nama_produk,
        customer,
        qty_rusak,
        status_jo,
        qty_jo,
      });

      //   const masterBarangRusakDefect = await MasterBarangRusakDefect.findAll({
      //     where: { status: "aktif" },
      //   });

      //   for (let index = 0; index < masterBarangRusakDefect.length; index++) {
      //     const dataMaster = masterBarangRusakDefect[index];
      //     await InspeksiBarangRusakDefect.create({
      //       id_inspeksi_barang_rusak: inspeksiBarangRusak.id,
      //       kode: dataMaster.kode,
      //       masalah: dataMaster.masalah,
      //       asal_temuan: dataMaster.asal_temuan,
      //     });
      //   }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  startBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiBarangRusak = await InspeksiBarangRusak.findByPk(_id);
      if (inspeksiBarangRusak.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiBarangRusak.update(
        { id_inspektor: req.user.id, waktu_sortir: new Date() },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Start Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  doneBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { catatan, lama_pengerjaan, barang_baik_aktual } = req.body;
    if (!catatan)
      return res.status(400).json({ msg: "Catatan tidak boleh kosong" });
    if (!lama_pengerjaan)
      return res
        .status(400)
        .json({ msg: "Lama pengerjaan tidak boleh kosong" });
    if (!barang_baik_aktual)
      return res
        .status(400)
        .json({ msg: "Barang Baik Aktual tidak boleh kosong" });
    try {
      await InspeksiBarangRusak.update(
        {
          status: "history",
          waktu_selesai_sortir: new Date(),
          catatan,
          lama_pengerjaan,
          barang_baik_aktual,
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      const barangRusak = await InspeksiBarangRusak.findByPk(_id);
      // await InspeksiCetakPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );

      await InspeksiBarangRusak.update(
        { status: "pending", jumlah_pending: barangRusak.jumlah_pending + 1 },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  istirahatBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiBarangRusak.update(
        {
          status: "istirahat",
          waktu_istirahat: new Date(),
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Istirahat Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  masukIstirahatBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { lama_istirahat } = req.body;
    try {
      await InspeksiBarangRusak.update(
        {
          status: "incoming",
          waktu_masuk_istirahat: new Date(),
          lama_istirahat: lama_istirahat,
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Istirahat masuk Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiBarangRusakController;
