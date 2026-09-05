const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const MutasiBarangRawMaterial = require("../../../../model/gudangRM/mutasiBarangRawMaterialModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");

const MutasiBarangRawMaterialService = {
  getMutasiBarangRawMaterialService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_item,
    id_jo_booking,
    sumber_mutasi,
    type_mutasi,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { kode_barang: { [Op.like]: `%${search}%` } },
          { nama_barang: { [Op.like]: `%${search}%` } },
          { no_jo_booking: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_item) obj.id_item = id_item;
    if (id_jo_booking) obj.id_jo_booking = id_jo_booking;
    if (sumber_mutasi) obj.sumber_mutasi = sumber_mutasi;
    if (type_mutasi) obj.type_mutasi = type_mutasi;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await MutasiBarangRawMaterial.count({ where: obj });
        const data = await MutasiBarangRawMaterial.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: JobOrder,
              as: "jo_booking",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await MutasiBarangRawMaterial.findByPk(id, {
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: JobOrder,
              as: "jo_booking",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await MutasiBarangRawMaterial.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: JobOrder,
              as: "jo_booking",
            },
          ],
        });
        return {
          status: 200,
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

  getMutasiBarangRawMaterialByItem: async ({
    page = "1",
    limit = "2",
    start_date,
    end_date,
    search,
    sumber_mutasi,
    type_mutasi,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereObj = {};

    if (search) {
      whereObj = {
        [Op.or]: [
          { kode_barang: { [Op.like]: `%${search}%` } },
          { nama_barang: { [Op.like]: `%${search}%` } },
          { no_jo_booking: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      whereObj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    if (sumber_mutasi) whereObj.sumber_mutasi = sumber_mutasi;

    if (type_mutasi) whereObj.type_mutasi = type_mutasi;

    try {
      // Hitung total distinct id_item untuk pagination
      const totalGroups = await MutasiBarangRawMaterial.count({
        where: whereObj,
        distinct: true,
        col: "id_item",
      });

      // Ambil grouped data per id_item dengan pagination
      const groupedData = await MutasiBarangRawMaterial.findAll({
        attributes: [
          "id_item",
          "kode_barang",
          "nama_barang",
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal(
                `CASE WHEN type_mutasi = 'masuk' THEN jumlah_qty ELSE 0 END`,
              ),
            ),
            "jumlah_qty_masuk",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal(
                `CASE WHEN type_mutasi = 'keluar' THEN jumlah_qty ELSE 0 END`,
              ),
            ),
            "jumlah_qty_keluar",
          ],
        ],
        where: whereObj,
        group: ["id_item", "kode_barang", "nama_barang"],
        order: [[Sequelize.fn("MAX", Sequelize.col("createdAt")), "DESC"]],
        limit: parseInt(limit),
        offset,
        raw: true,
      });

      // Ambil detail mutasi berdasarkan id_item yang ada di halaman ini
      const idItemList = groupedData.map((item) => item.id_item);

      const detailData = await MutasiBarangRawMaterial.findAll({
        where: {
          ...whereObj,
          id_item: { [Op.in]: idItemList },
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      // Gabungkan grouped data dengan detail mutasi
      const data = groupedData.map((group) => {
        const data_mutasi = detailData.filter(
          (d) => d.id_item === group.id_item,
        );

        return {
          id_item: group.id_item,
          kode_barang: group.kode_barang,
          nama_barang: group.nama_barang,
          jumlah_qty_masuk: parseFloat(group.jumlah_qty_masuk) || 0,
          jumlah_qty_keluar: parseFloat(group.jumlah_qty_keluar) || 0,
          data_mutasi,
        };
      });

      return {
        status: 200,
        success: true,
        data,
        total_page: Math.ceil(totalGroups / parseInt(limit)),
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteMutasiBarangRawMaterialService: async ({
    id_item,
    id_user,
    id_jo_booking = null,
    jumlah_qty,
    type_mutasi,
    sumber_mutasi = "normal",
    note = null,
    tgl_mutasi = null,
    no_surat_jalan = null,
    no_good_receipt = null,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data item
      const dataItem = await MasterBarang.findByPk(id_item);
      if (!dataItem) {
        return {
          status_code: 404,
          success: false,
          message: "Data Barang Tidak Ditemukan",
        };
      }

      // cek data jo booking (opsional)
      let dataJo = null;
      if (id_jo_booking) {
        dataJo = await JobOrder.findByPk(id_jo_booking);
        if (!dataJo) {
          return {
            status_code: 404,
            success: false,
            message: "Data JO Booking Tidak Ditemukan",
          };
        }
      }

      await MutasiBarangRawMaterial.create(
        {
          id_item: id_item,
          id_user: id_user,
          id_jo_booking: id_jo_booking,
          kode_barang: dataItem?.kode_barang || null,
          nama_barang: dataItem?.nama_barang || null,
          no_jo_booking: dataJo?.no_jo || null,
          jumlah_qty: jumlah_qty,
          type_mutasi: type_mutasi,
          sumber_mutasi: sumber_mutasi,
          tgl_mutasi: tgl_mutasi || new Date(),
          note: note || null,
          no_surat_jalan: no_surat_jalan || null,
          no_good_receipt: no_good_receipt || null,
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
      throw { success: false, message: error.message };
    }
  },
};

module.exports = MutasiBarangRawMaterialService;
