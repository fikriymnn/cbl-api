const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiAmparLemPoint = require("../../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const InspeksiAmparLem = require("../../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const InspeksiAmparLemDefect = require("../../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");

const InspeksiAmparLemPeriodeDefectDepartment = require("../../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPeriodeDefectDepartmentModel");
const NcrTicket = require("../../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const MasterKodeDoc = require("../../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const User = require("../../../../../model/userModel");
const InspeksiAmparLemService = {
  getInspeksiAmparLemService: async ({
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
        const data = await InspeksiAmparLem.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
          where: obj,
          include: {
            model: InspeksiAmparLemPoint,
            as: "inspeksi_ampar_lem_point",
            attributes: ["id"],
            include: [
              {
                model: User,
                as: "inspektor",
              },
            ],
          },
        });
        const length = await InspeksiAmparLem.count({ where: obj });
        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await InspeksiAmparLem.findByPk(id, {
          include: {
            model: InspeksiAmparLemPoint,
            as: "inspeksi_ampar_lem_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiAmparLemDefect,
                as: "inspeksi_ampar_lem_defect",
              },
            ],
          },
        });
        const checkInspeksiAmparLem = await InspeksiAmparLem.findOne({
          include: {
            model: InspeksiAmparLemPoint,
            as: "inspeksi_ampar_lem_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiAmparLemDefect,
                as: "inspeksi_ampar_lem_defect",
              },
            ],
          },
          where: {
            no_jo: data.no_jo,
            id: {
              [Op.ne]: data.id,
            },
          },
        });

        const inspeksiAmparLemPoint = await InspeksiAmparLemPoint.sum(
          "qty_pallet",
          {
            where: { id_inspeksi_ampar_lem: id },
          },
        );

        const inspeksiAmparLemPointDefect =
          await InspeksiAmparLemDefect.findAll({
            attributes: [
              "kode",
              [Sequelize.fn("SUM", Sequelize.col("hasil")), "total_defect"],
            ],
            group: ["kode"],
            where: { id_inspeksi_ampar_lem: id },
          });

        const totalDefect = await InspeksiAmparLemDefect.sum("hasil", {
          where: { id_inspeksi_ampar_lem: id },
        });

        return {
          status_code: 200,
          success: true,
          data: data,
          history: checkInspeksiAmparLem,
          sumQtyPallet: inspeksiAmparLemPoint,
          totalPointDefect: inspeksiAmparLemPointDefect,
          totalDefect: totalDefect,
        };
      } else {
        const data = await InspeksiAmparLem.findAll({
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

  creteInspeksiAmparLemService: async ({
    tahapan,
    periode_tiket,
    tanggal,
    no_jo,
    no_io,
    jumlah_pcs,
    mesin,
    operator,
    shift,
    nama_produk,
    customer,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const inspeksiAmparLem = await InspeksiAmparLem.create(
        {
          tahapan,
          periode_tiket,
          tanggal,
          no_jo,
          no_io,
          jumlah_pcs,
          mesin,
          operator,
          shift,
          nama_produk,
          customer,
          status_jo,
          qty_jo,
        },
        { transaction: t },
      );
      const rabutPoint = await InspeksiAmparLemPoint.create(
        {
          id_inspeksi_ampar_lem: inspeksiAmparLem.id,
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
      throw new Error(error.message || "Failed to create inspeksi ampar lem");
    }
  },
};

module.exports = InspeksiAmparLemService;
