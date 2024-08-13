const { Op, Sequelize } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiLemController = {
  getInspeksiLem: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const length = await InspeksiLem.count({ where: obj });
        const data = await InspeksiLem.findAll({
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
        const data = await InspeksiLem.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiLem.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl || mesin) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiLem.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiLem.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiLem.findByPk(id, {
          include: [
            {
              model: InspeksiLemAwal,
              as: "inspeksi_lem_awal",
              include: [
                {
                  model: InspeksiLemAwalPoint,
                  as: "inspeksi_lem_awal_point",
                  include: {
                    model: User,
                    as: "inspektor",
                  },
                },
              ],
            },
            {
              model: InspeksiLemPeriode,
              as: "inspeksi_lem_periode",
              include: [
                {
                  model: InspeksiLemPeriodePoint,
                  as: "inspeksi_lem_periode_point",
                  include: [
                    {
                      model: User,
                      as: "inspektor",
                    },
                    {
                      model: InspeksiLemPeriodeDefect,
                      as: "inspeksi_lem_periode_defect",
                    },
                  ],
                },
              ],
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiLem.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiLem: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      mesin,
      operator,
      shift,
      jumlah,
      nama_produk,
      customer,
    } = req.body;

    try {
      const inspeksiLem = await InspeksiLem.create({
        tanggal,
        no_jo,
        no_io,
        mesin,
        operator,
        shift,
        jumlah,
        nama_produk,
        customer,
      });

      const inspeksiLemAwal = await InspeksiLemAwal.create({
        id_inspeksi_lem: inspeksiLem.id,
      });
      const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.create({
        id_inspeksi_lem_awal: inspeksiLemAwal.id,
      });

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemController;
