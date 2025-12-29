const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const InvoiceModel = require("../../../../model/akunting/invoice/invoiceModel");
const InvoiceProdukModel = require("../../../../model/akunting/invoice/invoiceProdukModel");
const ReturModel = require("../../../../model/akunting/retur/returModel");
const ReturProdukModel = require("../../../../model/akunting/retur/returProdukModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const Users = require("../../../../model/userModel");

const InvoiceService = {
  getInvoiceService: async ({
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
        const length = await InvoiceModel.count({ where: obj });
        const data = await InvoiceModel.findAll({
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
        const data = await InvoiceModel.findByPk(id, {
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
              model: InvoiceProdukModel,
              as: "invoice_produk",
            },
            {
              model: ReturModel,
              as: "retur",
              include: [
                {
                  model: ReturProdukModel,
                  as: "retur_produk",
                },
              ],
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await InvoiceModel.findAll({
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

  getNoInvoiceService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastInvoice = await InvoiceModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SI00001/CBL/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_invoice, 5), '/', 1) AS UNSIGNED)`
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
        const lastNo = lastInvoice.no_invoice; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newInvoiceNumber = `SI${paddedNumber}/CBL/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_invoice: lastInvoice?.no_invoice,
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

  creteInvoiceService: async ({
    id_customer,
    id_create,
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
    sub_total,
    dpp,
    diskon,
    ppn,
    total,
    dp,
    balance_due,
    note,
    is_show_dpp,
    invoice_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await InvoiceModel.create(
        {
          id_customer: id_customer,
          id_create: id_create,
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
          sub_total: sub_total,
          dpp: dpp,
          diskon: diskon,
          ppn: ppn,
          total: total,
          dp: dp,
          balance_due: balance_due,
          note: note,
          is_show_dpp: is_show_dpp,
        },
        { transaction: t }
      );

      let dataProdukInvoice = [];
      for (let i = 0; i < invoice_produk.length; i++) {
        const e = invoice_produk[i];
        dataProdukInvoice.push({
          id_invoice: dataInvoice.id,
          id_produk: e.id_produk,
          nama_produk: e.nama_produk,
          kode_produk: e.kode_produk,
          qty: e.qty,
          unit: e.unit,
          harga: e.harga,
          dpp: e.dpp,
          total: e.total,
          pajak: e.pajak,
          diskon_produk: e.diskon_produk,
        });
      }

      await InvoiceProdukModel.bulkCreate(dataProdukInvoice, {
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

  updateInvoiceService: async ({
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
    sub_total,
    dpp,
    diskon,
    ppn,
    total,
    dp,
    balance_due,
    note,
    is_show_dpp,
    invoice_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await InvoiceModel.update(
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
          sub_total: sub_total,
          dpp: dpp,
          diskon: diskon,
          ppn: ppn,
          total: total,
          dp: dp,
          balance_due: balance_due,
          note: note,
          is_show_dpp: is_show_dpp,
        },
        { where: { id: id }, transaction: t }
      );

      for (let i = 0; i < invoice_produk.length; i++) {
        const e = invoice_produk[i];
        await InvoiceProdukModel.update(
          {
            id_produk: e.id_produk,
            nama_produk: e.nama_produk,
            kode_produk: e.kode_produk,
            qty: e.qty,
            unit: e.unit,
            harga: e.harga,
            dpp: e.dpp,
            total: e.total,
            pajak: e.pajak,
            diskon_produk: e.diskon_produk,
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

  requestInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
        {
          status: "requested",
          status_proses: "requested",
        },
        { where: { id: id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "request success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveInvoiceService: async ({ id, id_approve, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };

      await InvoiceModel.update(
        {
          status: "approved",
          status_proses: "done",
          id_approve: id_approve,
        },
        { where: { id: id }, transaction: t }
      );

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

  rejectInvoiceService: async ({ id, id_reject, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
        {
          status: "draft",
          status_proses: "rejected",
          id_reject: id_reject,
        },
        { where: { id: id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  deleteInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
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

module.exports = InvoiceService;
