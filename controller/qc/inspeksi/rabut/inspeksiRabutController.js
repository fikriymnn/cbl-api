const { Op, Sequelize } = require("sequelize");

const InspeksiRabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabut = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const InspeksiRabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const MasterKodeMasalahRabut = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahSamplingHasilRabutModel");
const User = require("../../../../model/userModel");

const inspeksiRabutController = {
  getInspeksiRabut: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const length = await InspeksiRabut.count({ where: obj });
        const data = await InspeksiRabut.findAll({
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
        const data = await InspeksiRabut.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiRabut.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl || mesin) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiRabut.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiRabut.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiRabut.findByPk(id, {
          include: {
            model: InspeksiRabutPoint,
            as: "inspeksi_rabut_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiRabutDefect,
                as: "inspeksi_rabut_defect",
              },
            ],
          },
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiRabut.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiRabut: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      mesin,
      operator,
      shift,
      nama_produk,
      customer,
    } = req.body;

    try {
      const inspeksiRabut = await InspeksiRabut.create({
        tanggal,
        no_jo,
        no_io,
        mesin,
        operator,
        shift,
        nama_produk,
        customer,
      });

      const masterKodeRabut = await MasterKodeMasalahRabut.findAll({
        where: { status: "active" },
      });

      const rabutPoint = await InspeksiRabutPoint.create({
        id_inspeksi_rabut: inspeksiRabut.id,
      });
      for (let i = 0; i < masterKodeRabut.length; i++) {
        await InspeksiRabutDefect.create({
          id_inspeksi_rabut_point: rabutPoint.id,
          kode: masterKodeRabut[i].kode,
          masalah: masterKodeRabut[i].masalah,
        });
      }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  doneInspeksiRabut: async (req, res) => {
    const _id = req.params.id;

    try {
      const inspeksiRabutPoint = await InspeksiRabutPoint.findAll({
        where: { id_inspeksi_rabut: _id },
      });
      const jumlahPeriode = inspeksiRabutPoint.length;
      let totalWaktuCheck = inspeksiRabutPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiRabut.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "history",
        },
        { where: { id: _id } }
      );

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiRabutController;
