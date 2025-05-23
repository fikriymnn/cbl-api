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
      const { status, tgl, mesin, page, limit, search, start_date, end_date } =
        req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (tgl) obj.tanggal = tgl;
      if (mesin) obj.mesin = mesin;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
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
        const length = await InspeksiLem.count({ where: obj });
        const data = await InspeksiLem.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiLemAwal,
              as: "inspeksi_lem_awal",
              attributes: ["id"],
              include: [
                {
                  model: InspeksiLemAwalPoint,
                  as: "inspeksi_lem_awal_point",
                  attributes: ["id"],
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
              attributes: ["id"],
              include: [
                {
                  model: InspeksiLemPeriodePoint,
                  as: "inspeksi_lem_periode_point",
                  attributes: ["id"],
                  include: [
                    {
                      model: User,
                      as: "inspektor",
                    },
                  ],
                },
              ],
            },
          ],
        });

        return res.status(200).json({
          data: data,
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

        const checkInspeksiLem = await InspeksiLem.findOne({
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
          where: {
            no_jo: data.no_jo,
            id: {
              [Op.ne]: data.id,
            },
          },
        });

        const pointDefect = await InspeksiLemPeriodeDefect.findAll({
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
          where: { id_inspeksi_lem: id, hasil: "not ok" },
        });

        return res
          .status(200)
          .json({ data: data, history: checkInspeksiLem, defect: pointDefect });
      } else {
        const data = await InspeksiLem.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
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
      jumlah_pcs,
      nama_produk,
      customer,
      status_jo,
      qty_jo,
    } = req.body;

    try {
      const checkInspeksiIncoming = await InspeksiLem.findOne({
        where: {
          no_jo: no_jo,
          status: "incoming",
        },
      });
      // if (checkInspeksiIncoming) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Lem" });
      // } else {
      //   const checkInspeksiLem = await InspeksiLem.findOne({
      //     where: {
      //       no_jo: no_jo,
      //       status: "pending",
      //     },
      //   });
      //   if (checkInspeksiLem) {
      //     await InspeksiLem.update(
      //       {
      //         status: "history",
      //       },
      //       {
      //         where: {
      //           id: checkInspeksiLem.id,
      //         },
      //       }
      //     );
      //   }
      //   const inspeksiLem = await InspeksiLem.create({
      //     tanggal,
      //     no_jo,
      //     no_io,
      //     mesin,
      //     operator,
      //     shift,
      //     jumlah,
      //     jumlah_pcs,
      //     nama_produk,
      //     customer,
      //     status_jo,
      //   });

      //   const inspeksiLemAwal = await InspeksiLemAwal.create({
      //     id_inspeksi_lem: inspeksiLem.id,
      //   });
      //   const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.create({
      //     id_inspeksi_lem_awal: inspeksiLemAwal.id,
      //   });

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const checkInspeksiLem = await InspeksiLem.findOne({
        where: {
          no_jo: no_jo,
          status: "pending",
        },
      });
      if (checkInspeksiLem) {
        await InspeksiLem.update(
          {
            status: "history",
          },
          {
            where: {
              id: checkInspeksiLem.id,
            },
          }
        );
      }
      const inspeksiLem = await InspeksiLem.create({
        tanggal,
        no_jo,
        no_io,
        mesin,
        operator,
        shift,
        jumlah,
        jumlah_pcs,
        nama_produk,
        customer,
        status_jo,
        qty_jo,
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
