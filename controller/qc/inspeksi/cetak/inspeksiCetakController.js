const { Op, Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const User = require("../../../../model/userModel");
const axios = require("axios");
const https = require("https");

const agent = new https.Agent({ rejectUnauthorized: false });
dotenv.config();

const inspeksiCetakController = {
  getInspeksiCetak: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit, search } = req.query;
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

        const checkInspeksiCetak = await InspeksiCetak.findOne({
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
          where: {
            no_jo: data.no_jo,
            id: {
              [Op.ne]: data.id,
            },
          },
        });

        const pointDefect = await InspeksiCetakPeriodeDefect.findAll({
          attributes: [
            "kode",
            "sumber_masalah",
            "persen_kriteria",
            "kriteria",
            "masalah",
            [
              Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
              "total_defect",
            ],
          ],
          group: ["kode"],
          where: { id_inspeksi_cetak: id, hasil: "not ok" },
          include: [
            {
              model: InspeksiCetakPeriodeDefectDepartment,
              as: "inspeksi_cetak_periode_defect_department",
            },
          ],
        });

        return res.status(200).json({
          data: data,
          history: checkInspeksiCetak,
          defect: pointDefect,
        });
      } else {
        const data = await InspeksiCetak.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data: data });
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
      jumlah_pcs,
      mata,
      jenis_kertas,
      jenis_gramatur,
      warna_depan,
      warna_belakang,
      nama_produk,
      customer,
      status_jo,
      qty_jo,
    } = req.body;

    try {
      const checkInspeksiIncoming = await InspeksiCetak.findOne({
        where: {
          no_jo: no_jo,
          status: "incoming",
        },
      });
      // if (checkInspeksiIncoming) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Cetak" });
      // } else {
      //   const checkInspeksiCetak = await InspeksiCetak.findOne({
      //     where: {
      //       no_jo: no_jo,
      //       status: "pending",
      //     },
      //   });
      //   if (checkInspeksiCetak) {
      //     await InspeksiCetak.update(
      //       {
      //         status: "history",
      //       },
      //       {
      //         where: {
      //           id: checkInspeksiCetak.id,
      //         },
      //       }
      //     );
      //   }
      //   const inspeksicetak = await InspeksiCetak.create({
      //     tanggal,
      //     no_jo,
      //     no_io,
      //     mesin,
      //     operator,
      //     shift,
      //     jumlah_druk,
      //     jumlah_pcs,
      //     mata,
      //     jenis_kertas,
      //     jenis_gramatur,
      //     warna_depan,
      //     warna_belakang,
      //     nama_produk,
      //     customer,
      //     status_jo,
      //   });

      //   const inspeksiCetakAwal = await InspeksiCetakAwal.create({
      //     id_inspeksi_cetak: inspeksicetak.id,
      //   });
      //   const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.create({
      //     id_inspeksi_cetak_awal: inspeksiCetakAwal.id,
      //   });
      //   res.status(200).json({ msg: "create Successful" });
      // }
      const checkInspeksiCetak = await InspeksiCetak.findOne({
        where: {
          no_jo: no_jo,
          status: "pending",
        },
      });
      if (checkInspeksiCetak) {
        await InspeksiCetak.update(
          {
            status: "history",
          },
          {
            where: {
              id: checkInspeksiCetak.id,
            },
          }
        );
      }
      const inspeksicetak = await InspeksiCetak.create({
        tanggal,
        no_jo,
        no_io,
        mesin,
        operator,
        shift,
        jumlah_druk,
        jumlah_pcs,
        mata,
        jenis_kertas,
        jenis_gramatur,
        warna_depan,
        warna_belakang,
        nama_produk,
        customer,
        status_jo,
        qty_jo,
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

  testingApi: async (req, res) => {
    try {
      const masterKodeCetak = await axios.get(
        `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=3`,
        {
          httpsAgent: agent,
        }
      );
      //console.log(masterKodeCetak.data);
      let iii = masterKodeCetak.data;

      res.status(200).json({ msg: "Done Successful", data: iii });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakController;
