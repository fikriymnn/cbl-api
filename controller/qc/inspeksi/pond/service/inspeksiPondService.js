const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const InspeksiPondPeriode = require("../../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const User = require("../../../../../model/userModel");
const InspeksiPondService = {
  getInspeksiPondService: async ({
    id,
    status,
    tahapan,
    periode_tiket,
    no_jo,
    shift,
    operator,
    mesin,
    page,
    limit,
    search,
    start_date,
    end_date,
  }) => {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { item: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (status) obj.status = status;
      if (tahapan) obj.tahapan = tahapan;
      if (periode_tiket) obj.periode_tiket = periode_tiket;
      if (no_jo) obj.no_jo = no_jo;
      if (shift) obj.shift = shift;
      if (operator) obj.operator = operator;
      if (mesin) obj.mesin = mesin;
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
        const length = await InspeksiPond.count({ where: obj });
        const data = await InspeksiPond.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiPondAwal,
              as: "inspeksi_pond_awal",
              attributes: ["id"],
              include: [
                {
                  model: InspeksiPondAwalPoint,
                  as: "inspeksi_pond_awal_point",
                  attributes: ["id"],
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
              attributes: ["id"],
              include: [
                {
                  model: InspeksiPondPeriodePoint,
                  as: "inspeksi_pond_periode_point",
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

        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
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

        const checkInspeksiPond = await InspeksiPond.findOne({
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
          where: {
            no_jo: data.no_jo,
            id: {
              [Op.ne]: data.id,
            },
          },
        });

        const pointDefect = await InspeksiPondPeriodeDefect.findAll({
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
          where: { id_inspeksi_pond: id, hasil: "not ok" },
        });
        return {
          status_code: 200,
          success: true,
          data: data,
          history: checkInspeksiPond,
          defect: pointDefect,
        };
      } else {
        const data = await InspeksiPond.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteInspeksiPondService: async ({
    tahapan,
    periode_tiket,
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
    ukuran_jadi,
    nama_produk,
    customer,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkInspeksipond = await InspeksiPond.findOne({
        where: {
          no_jo: no_jo,
          status: "pending",
        },
      });
      if (checkInspeksipond) {
        await InspeksiPond.update(
          {
            status: "history",
          },
          {
            where: {
              id: checkInspeksipond.id,
            },
            transaction: t,
          },
        );
      }
      const inspeksiPond = await InspeksiPond.create(
        {
          tahapan,
          periode_tiket,
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
          ukuran_jadi,
          nama_produk,
          customer,
          status_jo,
          qty_jo,
        },
        { transaction: t },
      );

      const inspeksiPondAwal = await InspeksiPondAwal.create(
        {
          id_inspeksi_pond: inspeksiPond.id,
        },
        { transaction: t },
      );
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.create(
        {
          id_inspeksi_pond_awal: inspeksiPondAwal.id,
        },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      // Ubah dari throw object ke throw Error
      throw new Error(error.message || "Failed to create inspeksi pond");
    }
  },
};

module.exports = InspeksiPondService;
