const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const PerubahanInvoiceModel = require("../../../../model/akunting/perubahanInvoice/perubahanInvoiceModel");
const PerubahanInvoiceProdukModel = require("../../../../model/akunting/perubahanInvoice/perubahanInvoiceProdukModel");
const InvoiceModel = require("../../../../model/akunting/invoice/invoiceModel");
const InvoiceProdukModel = require("../../../../model/akunting/invoice/invoiceProdukModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const Users = require("../../../../model/userModel");
const { get } = require("../../../../routes/userRoutes");

const PerubahanInvoiceService = {
  getPerubahanInvoiceService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_invoice,
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
          { no_invoice: { [Op.like]: `%${search}%` } },
          { no_perubahan_invoice: { [Op.like]: `%${search}%` } },
          { no_po: { [Op.like]: `%${search}%` } },
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
        const length = await PerubahanInvoiceModel.count({ where: obj });
        const data = await PerubahanInvoiceModel.findAll({
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
        const data = await PerubahanInvoiceModel.findByPk(id, {
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
              model: PerubahanInvoiceProdukModel,
              as: "perubahan_invoice_produk",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await PerubahanInvoiceModel.findAll({
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

  getNoPerubahanInvoiceService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastPerubahanInvoice = await PerubahanInvoiceModel.findOne({
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

      if (lastPerubahanInvoice) {
        const lastNo = lastPerubahanInvoice.no_perubahan_invoice; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newPerubahanInvoiceNumber = `SPR${paddedNumber}/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_perubahan_invoice: lastPerubahanInvoice.no_perubahan_invoice,
        new_no_perubahan_invoice: newPerubahanInvoiceNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  cretePerubahanInvoiceService: async ({
    id_invoice,
    id_customer,
    id_create,
    nama_customer,
    no_perubahan_invoice,
    no_po,
    no_invoice,
    tgl_invoice,
    alamat,
    tgl_faktur,
    new_alamat,
    new_tgl_faktur,
    note,
    file,
    perubahan_invoice_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (perubahan_invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataPerubahanInvoice = await PerubahanInvoiceModel.create(
        {
          id_invoice: id_invoice,
          id_customer: id_customer,
          id_create: id_create,
          nama_customer: nama_customer,
          no_perubahan_invoice: no_perubahan_invoice,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_invoice: tgl_invoice,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          new_alamat: new_alamat,
          new_tgl_faktur: new_tgl_faktur,
          note: note,
          file: file,
        },
        { transaction: t }
      );

      let dataPerubahanProdukInvoice = [];
      for (let i = 0; i < perubahan_invoice_produk.length; i++) {
        const e = perubahan_invoice_produk[i];
        dataPerubahanProdukInvoice.push({
          id_perubahan_invoice: dataPerubahanInvoice.id,
          id_invoice_produk: e.id_invoice_produk,
          id_produk: e.id_produk,
          nama_produk: e.nama_produk,
          qty: e.qty,
          harga: e.harga,
          new_qty: e.new_qty,
          new_harga: e.new_harga,
        });
      }

      await PerubahanInvoiceProdukModel.bulkCreate(dataPerubahanProdukInvoice, {
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

  updatePerubahanInvoiceService: async ({
    id,
    id_invoice,
    id_customer,
    id_create,
    nama_customer,
    no_perubahan_invoice,
    no_po,
    no_invoice,
    tgl_invoice,
    alamat,
    tgl_faktur,
    new_alamat,
    new_tgl_faktur,
    note,
    file,
    perubahan_invoice_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (perubahan_invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await PerubahanInvoiceModel.update(
        {
          id_invoice: id_invoice,
          id_customer: id_customer,
          id_create: id_create,
          nama_customer: nama_customer,
          no_perubahan_invoice: no_perubahan_invoice,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_invoice: tgl_invoice,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          new_alamat: new_alamat,
          new_tgl_faktur: new_tgl_faktur,
          note: note,
          file: file,
        },
        { where: { id: id }, transaction: t }
      );

      for (let i = 0; i < perubahan_invoice_produk.length; i++) {
        const e = perubahan_invoice_produk[i];
        await PerubahanInvoiceProdukModel.update(
          {
            qty: e.qty,
            harga: e.harga,
            new_qty: e.new_qty,
            new_harga: e.new_harga,
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

  requestPerubahanInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await PerubahanInvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await PerubahanInvoiceModel.update(
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

  approvePerubahanInvoiceService: async ({
    id,
    id_approve,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataPerubahanInvoice = await PerubahanInvoiceModel.findByPk(id, {
        include: [
          {
            model: PerubahanInvoiceProdukModel,
            as: "perubahan_invoice_produk",
          },
        ],
      });
      if (!getDataPerubahanInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data perubahan invoice tidak di temukan",
        };

      const getDataInvoice = await InvoiceModel.findByPk(
        getDataPerubahanInvoice.id_invoice
      );
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data  invoice tidak di temukan",
        };

      await PerubahanInvoiceModel.update(
        {
          status: "approved",
          status_proses: "done",
          id_approve: id_approve,
        },
        { where: { id: id }, transaction: t }
      );

      //rubah data di invoice produk
      let newSubTotal = 0;
      let newDpp = 0;
      let newPpn = 0;
      let newTotal = 0;

      for (
        let i = 0;
        i < getDataPerubahanInvoice.perubahan_invoice_produk.length;
        i++
      ) {
        const e = getDataPerubahanInvoice.perubahan_invoice_produk[i];
        const dataInvoiceProduk = await InvoiceProdukModel.findByPk(
          e.id_invoice_produk
        );
        const valueDpp = (11 / 12) * 100;
        const qtyNew = e.new_qty;
        const hargaNew = e.new_harga;
        const newTotalProduk =
          qtyNew * hargaNew - dataInvoiceProduk.diskon_produk;
        const newDppProduk = (11 / 12) * newTotalProduk;
        const newPajakProduk = newDppProduk * 0.12;
        const newTotalAll = newTotalProduk + newPajakProduk;
        newSubTotal += newTotalProduk;
        newDpp += newDppProduk;
        newPpn += newPajakProduk;
        newTotal += newTotalAll;
        await InvoiceProdukModel.update(
          {
            qty: qtyNew,
            harga: hargaNew,
            dpp: newDppProduk,
            total: newTotalProduk,
            pajak: newPajakProduk,
          },
          { where: { id: e.id_invoice_produk }, transaction: t }
        );
      }

      //rubah data di invoice
      await InvoiceModel.update(
        {
          alamat: getDataPerubahanInvoice.new_alamat,
          tgl_faktur: getDataPerubahanInvoice.new_tgl_faktur,
          sub_total: newSubTotal,
          dpp: newDpp,
          ppn: newPpn,
          total: newTotal - getDataInvoice.dp || 0,
          balance_due: newTotal - getDataInvoice.dp || 0,
        },
        { where: { id: getDataPerubahanInvoice.id_invoice }, transaction: t }
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

  rejectPerubahanInvoiceService: async ({
    id,
    id_reject,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataPerubahanInvoice = await PerubahanInvoiceModel.findByPk(id);
      if (!getDataPerubahanInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data perubahan invoice tidak di temukan",
        };
      await PerubahanInvoiceModel.update(
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

  deletePerubahanInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await PerubahanInvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data perubahan invoice tidak di temukan",
        };
      await PerubahanInvoiceModel.update(
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

module.exports = PerubahanInvoiceService;
