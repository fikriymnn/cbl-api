const { Op, Sequelize } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiCetakController = {
  getInspeksiCetak: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const length = await InspeksiCetak.count({ where: obj });
        const data = await InspeksiCetak.findAll({
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
        const data = await InspeksiCetak.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiCetak.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl || mesin) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiCetak.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiCetak.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiCetak.findByPk(id, {
          include: [
            {
              model: InspeksiCetakAwal,
              as: "inspeksi_cetak_awal",
              include: [
                {
                  model: InspeksiCetakAwalPoint,
                  as: "inspeksi_cetak_awal_point",
                  include: {
                    model: User,
                    as: "inspektor",
                  },
                },
              ],
            },
            {
              model: InspeksiCetakPeriode,
              as: "inspeksi_cetak_periode",
              include: [
                {
                  model: InspeksiCetakPeriodePoint,
                  as: "inspeksi_cetak_periode_point",
                  include: [
                    {
                      model: User,
                      as: "inspektor",
                    },
                    {
                      model: InspeksiCetakPeriodeDefect,
                      as: "inspeksi_cetak_periode_defect",
                    },
                  ],
                },
              ],
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiCetak.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiCetak: async (req, res) => {
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
      warna_depan,
      warna_belakang,
      nama_produk,
      customer,
    } = req.body;

    try {
      const inspeksicetak = await InspeksiCetak.create({
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
        warna_depan,
        warna_belakang,
        nama_produk,
        customer,
      });

      const inspeksiCetakAwal = await InspeksiCetakAwal.create({
        id_inspeksi_cetak: inspeksicetak.id,
      });
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.create({
        id_inspeksi_cetak_awal: inspeksiCetakAwal.id,
      });

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakController;