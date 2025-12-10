const db = require("../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const DeliveryOrderGroup = require("../../../model/deliveryOrder/deliveryOrderGroupModel");
const DeliveryOrder = require("../../../model/deliveryOrder/deliveryOrderModel");
const IoModel = require("../../../model/marketing/io/ioModel");
const SoModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const e = require("express");

const DeliveryOrderGroupService = {
  getDeliveryOrderGroupService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    search,
    id_customer,
    id_io,
    id_so,
    id_produk,
    id_kendaraan,
    id_supir,
    id_kenek,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_do: { [Op.like]: `%${search}%` } },
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { no_po_customer: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status) obj.status = status;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;
    if (id_kendaraan) obj.id_kendaraan = id_kendaraan;
    if (id_supir) obj.id_supir = id_supir;
    if (id_kenek) obj.id_kenek = id_kenek;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await DeliveryOrderGroup.count({ where: obj });
        const data = await DeliveryOrderGroup.findAll({
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
        const data = await DeliveryOrderGroup.findByPk(id, {
          include: [
            {
              model: DeliveryOrder,
              as: "delivery_order",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await DeliveryOrderGroup.findAll({
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

  getNoDeliveryOrderGroupService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      //get data untuk type pajak
      const lastdataPajak = await DeliveryOrderGroup.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
          is_tax: true,
        },
        order: [
          // extract nomor urut pada format SDP00001/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_do, 4), '/', 1) AS UNSIGNED)`
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      //get data untuk type non pajak
      const lastdataNonPajak = await DeliveryOrderGroup.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
          is_tax: false,
        },
        order: [
          // extract nomor urut pada format SDP00001/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_do, 4), '-', 1) AS UNSIGNED)`
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      //tentukan no_do type tax dan non tax selanjutnya
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      const shortYear = String(currentYear).slice(2); // 2025 => "25"
      // 2. Tentukan nomor urut berikutnya
      let nextNumberTax = 1;
      let nextNumberNonTax = 1;

      //type tax
      if (lastdataPajak) {
        const lastNo = lastdataPajak.no_do; // contoh: "SD00001/CBL/1225"

        // Ambil "00001" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumberTax = lastSeq + 1;
      }

      //type non tax
      if (lastdataNonPajak) {
        const lastNo = lastdataNonPajak.no_do; // contoh: "SD50001-1225"

        // Ambil "00001" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("-")), 10);

        nextNumberNonTax = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 4 digit
      //untuk tax
      const paddedNumberTax = String(nextNumberTax).padStart(4, "0");
      //untuk non tax
      const paddedNumberNonTax = String(nextNumberNonTax).padStart(4, "0");

      // 4. Susun format akhir
      //type tax
      const newDoTaxNumberTax = `SD0${paddedNumberTax}/CBL/${currentMonth}${shortYear}`;
      // type non tax
      const newDoTaxNumberNonTax = `SD5${paddedNumberTax}-${currentMonth}${shortYear}`;

      return {
        status: 200,
        success: true,
        no_do_tax: lastdataPajak.no_do,
        no_do_tax_new: newDoTaxNumberTax,
        no_do_non_tax: lastdataNonPajak.no_do,
        no_do_non_tax_new: newDoTaxNumberNonTax,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteDeliveryOrderGroupService: async ({
    id_io,
    id_so,
    id_customer,
    id_produk,
    no_do,
    no_jo,
    no_po_customer,
    alamat,
    kota,
    is_tax,
    note,
    data_do,
    id_create,
    id_kendaraan,
    id_supir,
    id_kenek,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      //cek data io
      const dataIo = await IoModel.findByPk(id_io);
      if (!dataIo) {
        return {
          status_code: 404,
          success: false,
          message: "Data IO Tidak Ditemukan",
        };
      }
      //cek data so
      const dataSo = await SoModel.findByPk(id_so);
      if (!dataSo) {
        return {
          status_code: 404,
          success: false,
          message: "Data SO Tidak Ditemukan",
        };
      }
      //cek data customer
      const dataCustomer = await MasterCustomer.findByPk(id_customer);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataCustomer) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Customer Tidak Ditemukan",
      //     };
      //   }
      //cek data Produk
      const dataProduk = await MasterProduk.findByPk(id_produk);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataProduk) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Produk Tidak Ditemukan",
      //     };
      //   }

      if (!data_do || data_do.length == 0 || data_do == null) {
        return {
          status_code: 404,
          success: false,
          message: "Data DO Kosong",
        };
      }
      const dataDoGroup = await DeliveryOrderGroup.create(
        {
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_jo: no_jo,
          no_do: no_do,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          no_po_customer: no_po_customer,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
          alamat: alamat,
          kota: kota,
          is_tax: is_tax,
          note: note,
          tgl_pengiriman: dataSo?.tgl_pengiriman || null,
          id_create: id_create,
          id_kendaraan: id_kendaraan || null,
          id_supir: id_supir || null,
          id_kenek: id_kenek || null,
        },
        { transaction: t }
      );

      for (let i = 0; i < data_do.length; i++) {
        const e = data_do[i];
        await DeliveryOrder.update(
          {
            id_do_group: dataDoGroup.id,
            jumlah_qty: e.jumlah_qty,
            isi_1: e.isi_1,
            isi_2: e.isi_2,
            isi_3: e.isi_3,
            pack_1: e.pack_1,
            pack_2: e.pack_2,
            pack_3: e.pack_3,
            status: "done",
          },
          { where: { id: e.id }, transaction: t }
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
      throw { success: false, message: error.message };
    }
  },

  konfirmasiDeliveryOrderGroupService: async ({
    id,
    id_io,
    id_so,
    id_customer,
    id_produk,
    no_do,
    no_jo,
    no_po_customer,
    alamat,
    kota,
    is_tax,
    note,
    data_do,
    id_approve,
    id_kendaraan,
    id_supir,
    id_kenek,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      //cek data io
      const dataIo = await IoModel.findByPk(id_io);
      if (!dataIo) {
        return {
          status_code: 404,
          success: false,
          message: "Data IO Tidak Ditemukan",
        };
      }
      //cek data so
      const dataSo = await SoModel.findByPk(id_so);
      if (!dataSo) {
        return {
          status_code: 404,
          success: false,
          message: "Data SO Tidak Ditemukan",
        };
      }
      //cek data customer
      const dataCustomer = await MasterCustomer.findByPk(id_customer);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataCustomer) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Customer Tidak Ditemukan",
      //     };
      //   }
      //cek data Produk
      const dataProduk = await MasterProduk.findByPk(id_produk);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataProduk) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Produk Tidak Ditemukan",
      //     };
      //   }

      if (!data_do || data_do.length == 0 || data_do == null) {
        return {
          status_code: 404,
          success: false,
          message: "Data DO Kosong",
        };
      }
      await DeliveryOrderGroup.update(
        {
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_jo: no_jo,
          no_do: no_do,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          no_po_customer: no_po_customer,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
          alamat: alamat,
          kota: kota,
          is_tax: is_tax,
          note: note,
          tgl_pengiriman: dataSo?.tgl_pengiriman || null,
          status: "done",
          id_approve: id_approve,
          id_kendaraan: id_kendaraan,
          id_supir: id_supir,
          id_kenek: id_kenek,
        },
        { where: { id: id }, transaction: t }
      );

      for (let i = 0; i < data_do.length; i++) {
        const e = data_do[i];
        await DeliveryOrder.update(
          {
            jumlah_qty: e.jumlah_qty,
            isi_1: e.isi_1,
            isi_2: e.isi_2,
            isi_3: e.isi_3,
            pack_1: e.pack_1,
            pack_2: e.pack_2,
            pack_3: e.pack_3,
            status: "done",
          },
          { where: { id: e.id }, transaction: t }
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "konfirmasi success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = DeliveryOrderGroupService;
