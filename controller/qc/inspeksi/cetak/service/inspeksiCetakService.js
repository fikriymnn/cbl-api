const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const InspeksiCetakPeriode = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const User = require("../../../../../model/userModel");
const InspeksiCetakService = {
  getInspeksiCetakService: async ({
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
        const length = await InspeksiCetak.count({ where: obj });
        const data = await InspeksiCetak.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiCetakAwal,
              as: "inspeksi_cetak_awal",
              attributes: ["id"],
              include: [
                {
                  model: InspeksiCetakAwalPoint,
                  as: "inspeksi_cetak_awal_point",
                  attributes: ["id"],
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
              attributes: ["id"],
              include: [
                {
                  model: InspeksiCetakPeriodePoint,
                  as: "inspeksi_cetak_periode_point",
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

        return {
          status_code: 200,
          success: true,
          data: data,
          history: checkInspeksiCetak,
          defect: pointDefect,
        };
      } else {
        const data = await InspeksiCetak.findAll({
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

  creteInspeksiCetakService: async ({
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
    warna_depan,
    warna_belakang,
    nama_produk,
    customer,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
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
            transaction: t,
          }
        );
      }
      const inspeksicetak = await InspeksiCetak.create(
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
          warna_depan,
          warna_belakang,
          nama_produk,
          customer,
          status_jo,
          qty_jo,
        },
        { transaction: t }
      );

      const inspeksiCetakAwal = await InspeksiCetakAwal.create(
        {
          id_inspeksi_cetak: inspeksicetak.id,
        },
        { transaction: t }
      );
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.create(
        {
          id_inspeksi_cetak_awal: inspeksiCetakAwal.id,
        },
        { transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = InspeksiCetakService;
