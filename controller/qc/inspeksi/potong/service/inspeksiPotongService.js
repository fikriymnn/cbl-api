const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiPotong = require("../../../../../model/qc/inspeksi/potong/inspeksiPotongModel");
const InspeksiPotongResult = require("../../../../../model/qc/inspeksi/potong/inspeksiPotongResultModel");
const MasterKodeDoc = require("../../../../../model/masterData/qc/inspeksi/masterKodeDocModel");

const IspeksiPotongService = {
  getInspeksiPotongService: async ({
    id,
    status,
    jenis_potong,
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
      if (jenis_potong) obj.jenis_potong = jenis_potong;
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
        const data = await InspeksiPotong.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiPotong.count({ where: obj });
        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await InspeksiPotong.findByPk(id, {
          include: {
            model: InspeksiPotongResult,
            as: "inspeksi_potong_result",
          },
        });

        return {
          status_code: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await InspeksiPotong.findAll({
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

  creteInspeksiPotongService: async ({
    jenis_potong,
    tanggal,
    periode_tiket,
    no_io,
    no_jo,
    operator,
    shift,
    jam,
    item,
    mesin,
    customer,
    status_jo,
    qty_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const data = await InspeksiPotong.create(
        {
          jenis_potong,
          periode_tiket,
          tanggal,
          no_io,
          no_jo,
          mesin,
          operator,
          shift,
          jam,
          item,
          customer,
          status_jo,
          qty_jo,
        },
        { transaction: t }
      );

      if (data) {
        let array = [];
        if (jenis_potong == "potong jadi") {
          master_data_fix_jadi.forEach((value) => {
            value.id_inspeksi_potong = data.id;
            array.push(value);
          });
        } else {
          master_data_fix.forEach((value) => {
            value.id_inspeksi_potong = data.id;
            array.push(value);
          });
        }

        await InspeksiPotongResult.bulkCreate(array, { transaction: t });
      }
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

const master_data_fix = [
  {
    no: 1,
    point_check: "Jenis Kertas",
  },
  {
    no: 2,
    point_check: "Gramatur",
  },
  {
    no: 3,
    point_check: "Ukuran Potong",
  },
  {
    no: 4,
    point_check: "Arah Serat",
    standar: "Mounting di BOM",
  },
  {
    no: 5,
    point_check: "Hasil Timbang (10 X 10 cm)",
  },
];
const master_data_fix_jadi = [
  {
    no: 1,
    point_check: "Register",
  },
  {
    no: 2,
    point_check: "Ukuran",
  },
  {
    no: 3,
    point_check: "Ketajaman Pisau",
  },
  {
    no: 4,
    point_check: "Bentuk Jadi",
    standar: "Mounting di BOM",
  },
];

module.exports = IspeksiPotongService;
