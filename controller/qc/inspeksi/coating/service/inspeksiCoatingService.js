const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiCoating = require("../../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const InspeksiCoatingPointMasterPeriode = require("../../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoatingPeriodeDefectDepartment = require("../../../../../model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");
const User = require("../../../../../model/userModel");
const InspeksiCoatingService = {
  getInspeksiCoatingService: async ({
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
    jenis_pengecekan,
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
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
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
      if (page && limit && (status || jenis_pengecekan)) {
        if (status) obj.status = status;

        const data = await InspeksiCoating.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiCoatingResultPeriode,
              as: "inspeksi_coating_result_periode",
              attributes: ["id"],
              include: [
                {
                  model: InspeksiCoatingResultPointPeriode,
                  as: "inspeksi_coating_result_point_periode",
                  attributes: ["id"],
                },
                {
                  model: User,
                  as: "inspektor",
                },
              ],
            },

            {
              model: InspeksiCoatingResultAwal,
              as: "inspeksi_coating_result_awal",
              attributes: ["id"],
              include: {
                model: User,
                as: "inspektor",
              },
            },
          ],
        });
        const length = await InspeksiCoating.count({ where: obj });
        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        if (jenis_pengecekan == "awal") {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
          });
          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
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
          });
          return {
            status_code: 200,
            success: true,
            data: data,
            history: checkInspeksiCoating,
            defect: data2,
          };
        } else if (jenis_pengecekan == "periode") {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
            ],
          });
          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
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
          });
          return {
            status_code: 200,
            success: true,
            data: data,
            history: checkInspeksiCoating,
            defect: data2,
          };
        } else {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
          });

          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
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
          });

          return {
            status_code: 200,
            success: true,
            data: data,
            history: checkInspeksiCoating,
            defect: data2,
          };
        }
      } else if (status || jenis_pengecekan) {
        if (status) obj.status = status;
        if (jenis_pengecekan) obj.jenis_pengecekan = jenis_pengecekan;
        const data = await InspeksiCoating.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiCoating.count({ where: obj });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await InspeksiCoating.findAll({
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

  creteInspeksiCoatingService: async ({
    tahapan,
    periode_tiket,
    tanggal,
    jenis_kertas,
    jenis_gramatur,
    coating,
    no_jo,
    no_io,
    jumlah_druk,
    jumlah_pcs,
    mata,
    nama_produk,
    customer,
    shift,
    mesin,
    operator,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkInspeksiCoating = await InspeksiCoating.findOne({
        where: {
          no_jo: no_jo,
          status: "pending",
        },
      });

      if (checkInspeksiCoating) {
        await InspeksiCoating.update(
          {
            status: "history",
          },
          {
            where: {
              id: checkInspeksiCoating.id,
            },
            transaction: t,
          },
        );
      }

      const data = await InspeksiCoating.create(
        {
          tahapan,
          periode_tiket,
          tanggal,
          jenis_kertas,
          jenis_gramatur,
          no_jo,
          no_io,
          jumlah_druk,
          jumlah_pcs,
          mata,
          nama_produk,
          customer,
          shift,
          mesin,
          operator,
          status_jo,
          qty_jo,
          coating,
        },
        { transaction: t },
      );
      if (data?.id) {
        await InspeksiCoatingResultAwal.create(
          {
            id_inspeksi_coating: data?.id,
          },
          { transaction: t },
        );
        await InspeksiCoatingSubAwal.create(
          {
            id_inspeksi_coating: data?.id,
          },
          { transaction: t },
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      // Ubah dari throw object ke throw Error
      throw new Error(error.message || "Failed to create inspeksi coating");
    }
  },
};

module.exports = InspeksiCoatingService;
