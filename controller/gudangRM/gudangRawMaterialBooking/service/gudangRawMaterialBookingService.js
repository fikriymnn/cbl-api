const db = require("../../../../config/database");
const { Op } = require("sequelize");
const GudangRawMaterialBooking = require("../../../../model/gudangRM/gudangRawMaterialBookingModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");
const MutasiBarangRawMaterialService = require("../../../gudangRM/mutasiBarangRawMaterial/service/mutasiBarangRawMaterialService");

// NOTE: sesuaikan path require di atas dengan lokasi file model/service kamu yang sebenarnya.

const GudangRawMaterialBookingService = {
  getGudangRawMaterialBookingService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_jo,
    id_item,
    tipe_barang,
    status,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
          { nama_item: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (id_jo) obj.id_jo = id_jo;
    if (id_item) obj.id_item = id_item;
    if (tipe_barang) obj.tipe_barang = tipe_barang;
    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (page && limit) {
        const length = await GudangRawMaterialBooking.count({ where: obj });
        const data = await GudangRawMaterialBooking.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: JobOrder,
              as: "job_order",
            },
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: Users,
              as: "user_approve",
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
        const data = await GudangRawMaterialBooking.findByPk(id, {
          include: [
            {
              model: JobOrder,
              as: "job_order",
            },
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: Users,
              as: "user_approve",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await GudangRawMaterialBooking.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: JobOrder,
              as: "job_order",
            },
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: Users,
              as: "user_approve",
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

  // create booking single
  // jika sudah ada data dengan id_item, id_jo, status "incoming" -> update (qty ditambah, tgl_masuk diperbarui)
  // jika belum ada -> create baru
  createGudangRawMaterialBookingService: async ({
    id_jo,
    id_item,
    qty,
    rencana_cetak = null,
    tipe_barang,
    satuan,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!id_jo || !id_item) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_jo dan id_item tidak boleh kosong",
        };
      }

      const dataJo = await JobOrder.findByPk(id_jo, { transaction: t });
      if (!dataJo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data JO Tidak Ditemukan",
        };
      }

      const dataItem = await MasterBarang.findByPk(id_item, {
        transaction: t,
      });
      if (!dataItem) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Barang Tidak Ditemukan",
        };
      }

      // cek data existing berdasarkan id_item, id_jo, status incoming
      const existingData = await GudangRawMaterialBooking.findOne({
        where: {
          id_jo,
          id_item,
          status: "incoming",
          is_active: true,
        },
        transaction: t,
      });

      if (existingData) {
        const newQty = (existingData.qty || 0) + (qty || 0);

        await GudangRawMaterialBooking.update(
          {
            qty: newQty,
            tgl_masuk: new Date(),
            rencana_cetak: rencana_cetak || existingData.rencana_cetak,
          },
          { where: { id: existingData.id }, transaction: t },
        );

        if (!transaction) await t.commit();
        return {
          status_code: 200,
          success: true,
          message: "update success",
          data: { id: existingData.id, qty: newQty },
        };
      } else {
        const newData = await GudangRawMaterialBooking.create(
          {
            id_jo,
            id_item,
            no_jo: dataJo?.no_jo || null,
            customer: dataJo.customer || null,
            produk: dataJo.produk || null,
            nama_item: dataItem?.nama_barang || null,
            qty: qty || 0,
            tipe_barang: tipe_barang || null,
            satuan: satuan || null,
            rencana_cetak: rencana_cetak || null,
            tgl_masuk: new Date(),
            status: "incoming",
            is_active: true,
          },
          { transaction: t },
        );

        if (!transaction) await t.commit();
        return {
          status_code: 200,
          success: true,
          message: "create success",
          data: newData,
        };
      }
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // approve -> status "history", id_user_approve, tgl_approve
  // lalu buat mutasi barang raw material dengan type_mutasi "keluar"
  approveGudangRawMaterialBookingService: async ({
    id,
    id_user_approve,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataBooking = await GudangRawMaterialBooking.findByPk(id, {
        transaction: t,
      });
      if (!dataBooking) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Booking Tidak Ditemukan",
        };
      }

      await GudangRawMaterialBooking.update(
        {
          id_user_approve,
          status: "history",
          tgl_approve: new Date(),
        },
        { where: { id }, transaction: t },
      );

      if (dataBooking.qty > 0) {
        const createMutasiBarang =
          await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
            {
              id_item: dataBooking.id_item,
              id_user: id_user_approve,
              id_jo_booking: dataBooking.id_jo,
              jumlah_qty: dataBooking.qty,
              type_mutasi: "keluar",
              sumber_mutasi: "normal",
              note: null,
              tgl_mutasi: new Date(),
              transaction: t,
            },
          );

        if (createMutasiBarang.success === false) {
          throw {
            success: false,
            status_code: 400,
            message: createMutasiBarang.message,
          };
        }
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = GudangRawMaterialBookingService;
