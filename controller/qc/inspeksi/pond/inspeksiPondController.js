const { Op, Sequelize } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiPondController = {
  getInspeksiPond: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const length = await InspeksiPond.count({ where: obj });
        const data = await InspeksiPond.findAll({
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
        const data = await InspeksiPond.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiPond.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl || mesin) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiPond.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiPond.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiPond.findByPk(id, {
          include: [
            {
              model: InspeksiPondAwal,
              as: "inspeksi_pond_awal",
              include: [
                {
                  model: InspeksiPondAwalPoint,
                  as: "inspeksi_pond_awal_point",
                  include: {
                    model: User,
                    as: "inspektor",
                  },
                },
              ],
            },
            {
              model: InspeksiPondPeriode,
              as: "inspeksi_pond_periode",
              include: [
                {
                  model: InspeksiPondPeriodePoint,
                  as: "inspeksi_pond_periode_point",
                  include: [
                    {
                      model: User,
                      as: "inspektor",
                    },
                    {
                      model: InspeksiPondPeriodeDefect,
                      as: "inspeksi_pond_periode_defect",
                    },
                  ],
                },
              ],
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiPond.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiPond: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      mesin,
      operator,
      shift,
      jumlah_druk,
      mata,
      jenis_kertas,
      jenis_gramatur,
      ukuran_jadi,
      nama_produk,
      customer,
    } = req.body;

    try {
      const inspeksiPond = await InspeksiPond.create({
        tanggal,
        no_jo,
        no_io,
        mesin,
        operator,
        shift,
        jumlah_druk,
        mata,
        jenis_kertas,
        jenis_gramatur,
        ukuran_jadi,
        nama_produk,
        customer,
      });

      const inspeksiPondAwal = await InspeksiPondAwal.create({
        id_inspeksi_pond: inspeksiPond.id,
      });
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.create({
        id_inspeksi_pond_awal: inspeksiPondAwal.id,
      });

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondController;