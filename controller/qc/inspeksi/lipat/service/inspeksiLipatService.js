const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiLipat = require("../../../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatResult = require("../../../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");
const InspeksiLipatPoint = require("../../../../../model/qc/inspeksi/lipat/inspeksiLipatPointModel");
const MasterKodeDoc = require("../../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const User = require("../../../../../model/userModel");
const InspeksiLipatService = {
  getInspeksiLipatService: async ({
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
        const data = await InspeksiLipat.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiLipatPoint,
              as: "inspeksi_lipat_point",
              attributes: ["id"],
              include: [{ model: User, as: "inspektor" }],
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
        const data = await InspeksiLipat.findByPk(id, {
          include: [
            { model: User, as: "inspektor" },
            {
              model: InspeksiLipatPoint,
              as: "inspeksi_lipat_point",
              include: [
                {
                  model: InspeksiLipatResult,
                  as: "inspeksi_lipat_result",
                },
                { model: User, as: "inspektor" },
              ],
            },
          ],
        });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await InspeksiLipat.findAll({
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

  creteInspeksiLipatService: async ({
    tahapan,
    periode_tiket,
    tanggal,
    customer,
    no_io,
    no_jo,
    operator,
    shift,
    nama_produk,
    mesin,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const data = await InspeksiLipat.create(
        {
          tahapan,
          periode_tiket,
          tanggal,
          customer,
          no_io,
          no_jo,
          status_jo,
          mesin,
          operator,
          shift,
          item: nama_produk,
          qty_jo,
        },
        { transaction: t },
      );

      if (data) {
        let array = [];
        const inspeksiLipatPoint = await InspeksiLipatPoint.create(
          {
            id_inspeksi_lipat: data.id,
          },
          { transaction: t },
        );

        master_data_fix.forEach((value) => {
          value.id_inspeksi_lipat_point = inspeksiLipatPoint.id;
          array.push(value);
        });

        if (array.length == 5) {
          await InspeksiLipatResult.bulkCreate(array, { transaction: t });
        }
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
      throw new Error(error.message || "Failed to create inspeksi cetak");
    }
  },
};

const master_data_fix = [
  {
    no: 1,
    point_check: "Keriput",
    acuan: "Visual",
  },
  {
    no: 2,
    point_check: "Presisi Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 3,
    point_check: "Kotor",
    acuan: "Visual",
  },
  {
    no: 4,
    point_check: "Kerataan Hasil Lipatan",
    acuan: "Sample / Dumy",
  },
  {
    no: 5,
    point_check: "Serat Tercampur",
    acuan: "Sample / Dumy",
  },
];

module.exports = InspeksiLipatService;
