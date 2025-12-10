const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const ReturModel = require("../../../../model/akunting/retur/returModel");
const ReturProdukModel = require("../../../../model/akunting/retur/returProdukModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const Users = require("../../../../model/userModel");

const ReturService = {
  getReturService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_customer,
    status,
    status_proses,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { nama_customer: { [Op.like]: `%${search}%` } },
          { no_po: { [Op.like]: `%${search}%` } },
          { no_invoice: { [Op.like]: `%${search}%` } },
          { no_retur: { [Op.like]: `%${search}%` } },
          { no_do: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_customer) obj.id_customer = id_customer;
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await ReturModel.count({ where: obj });
        const data = await ReturModel.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await ReturModel.findByPk(id, {
          include: [
            {
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },
            {
              model: Users,
              as: "user_reject",
            },
            {
              model: ReturProdukModel,
              as: "retur_produk",
              //   include: [
              //     {
              //       model: MasterProduk,
              //       as: "produk",
              //     },
              //   ],
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await ReturModel.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
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

  getNoReturService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastInvoice = await ReturModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SI00001/CBL/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_retur, 5), '/', 1) AS UNSIGNED)`
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      //tentukan no selanjutnya
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      const shortYear = String(currentYear).slice(2); // 2025 => "25"
      // 2. Tentukan nomor urut berikutnya
      let nextNumber = 1;

      if (lastInvoice) {
        const lastNo = lastInvoice.no_retur; // contoh: SR-00001/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newInvoiceNumber = `SR-${paddedNumber}/CBL/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_retur: lastInvoice.no_retur,
        new_no_invoice: newInvoiceNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteReturService: async ({
    id_invoice,
    id_customer,
    id_create,
    nama_customer,
    no_po,
    no_invoice,
    no_retur,
    tgl_po,
    no_do,
    tgl_kirim,
    alamat,
    tgl_faktur,
    tgl_jatuh_tempo,
    waktu_jatuh_tempo,
    total,
    note,
    retur_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (retur_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataRetur = await ReturModel.create(
        {
          id_invoice: id_invoice,
          id_customer: id_customer,
          id_create: id_create,
          nama_customer: nama_customer,
          no_po: no_po,
          no_invoice: no_invoice,
          no_retur: no_retur,
          tgl_po: tgl_po,
          no_do: no_do,
          tgl_kirim: tgl_kirim,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          tgl_jatuh_tempo: tgl_jatuh_tempo,
          waktu_jatuh_tempo: waktu_jatuh_tempo,
          total: total,
          note: note,
          status: "done",
          status_proses: "done",
        },
        { transaction: t }
      );

      let dataProdukRetur = [];
      for (let i = 0; i < retur_produk.length; i++) {
        const e = retur_produk[i];
        dataProdukRetur.push({
          id_retur: dataRetur.id,
          id_produk: e.id_produk,
          nama_produk: e.nama_produk,
          kode_produk: e.kode_produk,
          qty: e.qty,
          qty_produk: e.qty_produk,
          unit: e.unit,
          harga: e.harga,
          dpp: e.dpp,
          total: e.total,
          pajak: e.pajak,
        });
      }

      await ReturProdukModel.bulkCreate(dataProdukRetur, {
        transaction: t,
      });
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

  updateReturService: async ({
    id,
    id_customer,
    nama_customer,
    no_po,
    no_invoice,
    tgl_po,
    no_do,
    tgl_kirim,
    alamat,
    tgl_faktur,
    tgl_jatuh_tempo,
    waktu_jatuh_tempo,
    total,
    note,
    retur_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (retur_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await ReturModel.update(
        {
          id_customer: id_customer,
          nama_customer: nama_customer,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_po: tgl_po,
          no_do: no_do,
          tgl_kirim: tgl_kirim,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          tgl_jatuh_tempo: tgl_jatuh_tempo,
          waktu_jatuh_tempo: waktu_jatuh_tempo,
          total: total,
          note: note,
        },
        { where: { id: id }, transaction: t }
      );

      for (let i = 0; i < retur_produk.length; i++) {
        const e = array[i];
        await ReturProdukModel.update(
          {
            id_produk: e.id_produk,
            nama_produk: e.nama_produk,
            kode_produk: e.kode_produk,
            qty: e.qty,
            qty_produksi: e.qty_produksi,
            unit: e.unit,
            harga: e.harga,
            dpp: e.dpp,
            total: e.total,
            pajak: e.pajak,
          },
          { where: { id: e.id }, transaction: t }
        );
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "update success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  //   requestReturService: async ({ id, transaction = null }) => {
  //     const t = transaction || (await db.transaction());

  //     try {
  //       const getDataInvoice = await ReturModel.findByPk(id);
  //       if (!getDataInvoice)
  //         throw {
  //           success: false,
  //           status_code: 404,
  //           message: "data invoice tidak di temukan",
  //         };
  //       await ReturModel.update(
  //         {
  //           status: "requested",
  //           status_proses: "requested",
  //         },
  //         { where: { id: id }, transaction: t }
  //       );
  //       if (!transaction) await t.commit();
  //       return {
  //         status_code: 200,
  //         success: true,
  //         message: "request success",
  //       };
  //     } catch (error) {
  //       if (!transaction) await t.rollback();
  //       throw { success: false, message: error.message };
  //     }
  //   },

  //   approveReturService: async ({ id, id_approve, transaction = null }) => {
  //     const t = transaction || (await db.transaction());

  //     try {
  //       const getDataInvoice = await ReturModel.findByPk(id);
  //       if (!getDataInvoice)
  //         throw {
  //           success: false,
  //           status_code: 404,
  //           message: "data invoice tidak di temukan",
  //         };

  //       await ReturModel.update(
  //         {
  //           status: "approved",
  //           status_proses: "done",
  //           id_approve: id_approve,
  //         },
  //         { where: { id: id }, transaction: t }
  //       );

  //       if (!transaction) await t.commit();
  //       return {
  //         status_code: 200,
  //         success: true,
  //         message: "approve success",
  //       };
  //     } catch (error) {
  //       if (!transaction) await t.rollback();
  //       throw { success: false, message: error.message };
  //     }
  //   },

  //   rejectReturService: async ({ id, id_reject, transaction = null }) => {
  //     const t = transaction || (await db.transaction());

  //     try {
  //       const getDataInvoice = await ReturModel.findByPk(id);
  //       if (!getDataInvoice)
  //         throw {
  //           success: false,
  //           status_code: 404,
  //           message: "data invoice tidak di temukan",
  //         };
  //       await ReturModel.update(
  //         {
  //           status: "draft",
  //           status_proses: "rejected",
  //           id_reject: id_reject,
  //         },
  //         { where: { id: id }, transaction: t }
  //       );
  //       if (!transaction) await t.commit();
  //       return {
  //         status_code: 200,
  //         success: true,
  //         message: "reject success",
  //       };
  //     } catch (error) {
  //       if (!transaction) await t.rollback();
  //       throw { success: false, message: error.message };
  //     }
  //   },

  deleteReturService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await ReturModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await ReturModel.update(
        {
          is_active: false,
        },
        { where: { id: id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = ReturService;
