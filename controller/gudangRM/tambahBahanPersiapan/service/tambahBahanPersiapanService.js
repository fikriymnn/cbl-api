const { Op, Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const TambahBahanPersiapan = require("../../../../model/gudangRM/tambahBahanPersiapan/tambahBahanPersiapanModel");
const TambahBahanPersiapanDefect = require("../../../../model/gudangRM/tambahBahanPersiapan/tambahBahanPersiapanDefectModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");

const TambahBahanPersiapanService = {
  getTambahBahanPersiapanService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    status_tiket,
    search,
    id_jo,
    id_kertas,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = { is_active: true };

    if (search) {
      obj = {
        ...obj,
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { nama_kertas: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status) obj.status = status;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (id_jo) obj.id_jo = id_jo;
    if (id_kertas) obj.id_kertas = id_kertas;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_request = { [Op.between]: [startDate, endDate] };
    }

    const include = [
      { model: JobOrder, as: "job_order" },
      { model: MasterBarang, as: "detail_kertas" },
      { model: Users, as: "user_request" },
      { model: Users, as: "user_qc" },
      { model: Users, as: "user_gudang" },
      {
        model: TambahBahanPersiapanDefect,
        as: "tambah_bahan_persiapan_defect",
        where: { is_active: true },
        required: false,
      },
    ];

    try {
      if (page && limit) {
        const length = await TambahBahanPersiapan.count({ where: obj });
        const data = await TambahBahanPersiapan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await TambahBahanPersiapan.findOne({
          where: { id, is_active: true },
          include,
        });
        return {
          status: 200,
          success: true,
          data,
        };
      } else {
        const data = await TambahBahanPersiapan.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
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

  createTambahBahanPersiapanService: async ({
    id_jo,
    id_kertas,
    id_user_request,
    qty_tambah_bahan,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataJo = await JobOrder.findByPk(id_jo);
      if (!dataJo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data JO Tidak Ditemukan",
        };
      }

      const dataKertas = await MasterBarang.findByPk(id_kertas);
      if (!dataKertas) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Kertas Tidak Ditemukan",
        };
      }

      const dataTambahBahan = await TambahBahanPersiapan.create(
        {
          id_jo,
          id_kertas,
          id_user_request,
          no_jo: dataJo?.no_jo || null,
          nama_kertas: dataKertas?.nama_barang || null,
          qty_tambah_bahan: qty_tambah_bahan || 0,
          note: note || null,
          status: "request qc",
          status_tiket: "incoming",
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: dataTambahBahan,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  editTambahBahanPersiapanService: async ({
    id,
    id_jo,
    id_kertas,
    id_user_request,
    id_user_qc,
    id_user_gudang,
    qty_tambah_bahan,
    qty_pakai_tambah_bahan,
    note,
    note_qc,
    note_gudang,
    status,
    status_tiket,
    tambah_bahan_defect = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      let no_jo = dataTambahBahan.no_jo;
      let nama_kertas = dataTambahBahan.nama_kertas;

      if (id_jo) {
        const dataJo = await JobOrder.findByPk(id_jo);
        if (!dataJo) {
          if (!transaction) await t.rollback();
          return {
            status_code: 404,
            success: false,
            message: "Data JO Tidak Ditemukan",
          };
        }
        no_jo = dataJo?.no_jo || null;
      }

      if (id_kertas) {
        const dataKertas = await MasterBarang.findByPk(id_kertas);
        if (!dataKertas) {
          if (!transaction) await t.rollback();
          return {
            status_code: 404,
            success: false,
            message: "Data Kertas Tidak Ditemukan",
          };
        }
        nama_kertas = dataKertas?.nama_barang || null;
      }

      await TambahBahanPersiapan.update(
        {
          id_jo: id_jo ?? dataTambahBahan.id_jo,
          id_kertas: id_kertas ?? dataTambahBahan.id_kertas,
          id_user_request: id_user_request ?? dataTambahBahan.id_user_request,
          id_user_qc: id_user_qc ?? dataTambahBahan.id_user_qc,
          id_user_gudang: id_user_gudang ?? dataTambahBahan.id_user_gudang,
          no_jo,
          nama_kertas,
          qty_tambah_bahan:
            qty_tambah_bahan ?? dataTambahBahan.qty_tambah_bahan,
          qty_pakai_tambah_bahan:
            qty_pakai_tambah_bahan ?? dataTambahBahan.qty_pakai_tambah_bahan,
          note: note ?? dataTambahBahan.note,
          note_qc: note_qc ?? dataTambahBahan.note_qc,
          note_gudang: note_gudang ?? dataTambahBahan.note_gudang,
          status: status ?? dataTambahBahan.status,
          status_tiket: status_tiket ?? dataTambahBahan.status_tiket,
        },
        { where: { id }, transaction: t },
      );

      // sync child tambah_bahan_persiapan_defect
      if (tambah_bahan_defect && tambah_bahan_defect.length >= 0) {
        const existingDefects = await TambahBahanPersiapanDefect.findAll({
          where: { id_tambah_bahan_persiapan: id, is_active: true },
          transaction: t,
        });
        const existingIds = existingDefects.map((d) => d.id);
        const payloadIds = tambah_bahan_defect
          .filter((d) => d.id)
          .map((d) => d.id);

        for (const item of tambah_bahan_defect) {
          if (item.id) {
            await TambahBahanPersiapanDefect.update(
              {
                id_kode_produksi: item.id_kode_produksi ?? null,
                kode: item.kode ?? null,
                deskripsi: item.deskripsi ?? null,
                qty_tambah_bahan: item.qty_tambah_bahan ?? 0,
              },
              { where: { id: item.id }, transaction: t },
            );
          } else {
            await TambahBahanPersiapanDefect.create(
              {
                id_tambah_bahan_persiapan: id,
                id_kode_produksi: item.id_kode_produksi || null,
                kode: item.kode || null,
                deskripsi: item.deskripsi || null,
                qty_tambah_bahan: item.qty_tambah_bahan || 0,
              },
              { transaction: t },
            );
          }
        }

        const removedIds = existingIds.filter(
          (eid) => !payloadIds.includes(eid),
        );
        if (removedIds.length > 0) {
          await TambahBahanPersiapanDefect.update(
            { is_active: false },
            { where: { id: removedIds }, transaction: t },
          );
        }
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "edit success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveQcTambahBahanPersiapanService: async ({
    id,
    id_user_qc,
    note_qc,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPersiapan.update(
        {
          id_user_qc,
          note_qc,
          status: "approve qc",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve qc success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveGudangTambahBahanPersiapanService: async ({
    id,
    id_user_gudang,
    note_gudang,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPersiapan.update(
        {
          id_user_gudang,
          note_gudang,
          status: "approve gudang",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve gudang success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  rejectQcTambahBahanPersiapanService: async ({
    id,
    id_user_qc,
    note_qc,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPersiapan.update(
        {
          id_user_qc,
          note_qc,
          status: "reject qc",
          status_tiket: "history",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject qc success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  rejectGudangTambahBahanPersiapanService: async ({
    id,
    id_user_gudang,
    note_gudang,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPersiapan.update(
        {
          id_user_gudang,
          note_gudang,
          status: "reject gudang",
          status_tiket: "history",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject gudang success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  pakaiTambahBahanTambahBahanPersiapanService: async ({
    id,
    tambah_bahan_defect = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      if (!tambah_bahan_defect || tambah_bahan_defect.length === 0) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "Data Tambah Bahan Defect Tidak Boleh Kosong",
        };
      }

      // buat record defect baru untuk tiap item yang dipakai
      const payload = tambah_bahan_defect.map((item) => ({
        id_tambah_bahan_persiapan: id,
        id_kode_produksi: item.id_kode_produksi || null,
        kode: item.kode || null,
        deskripsi: item.deskripsi || null,
        qty_tambah_bahan: item.qty_tambah_bahan || 0,
      }));

      await TambahBahanPersiapanDefect.bulkCreate(payload, {
        transaction: t,
      });

      // jumlahkan seluruh qty_tambah_bahan defect aktif (termasuk yang sebelumnya, jika ada pemakaian bertahap)
      const totalQtyPakai = await TambahBahanPersiapanDefect.sum(
        "qty_tambah_bahan",
        {
          where: { id_tambah_bahan_persiapan: id, is_active: true },
          transaction: t,
        },
      );

      await TambahBahanPersiapan.update(
        {
          qty_pakai_tambah_bahan: totalQtyPakai || 0,
          status: "done",
          status_tiket: "history",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "pakai tambah bahan success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  deleteTambahBahanPersiapanService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPersiapan.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPersiapan.update(
        { is_active: false },
        { where: { id }, transaction: t },
      );

      await TambahBahanPersiapanDefect.update(
        { is_active: false },
        { where: { id_tambah_bahan_persiapan: id }, transaction: t },
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

module.exports = TambahBahanPersiapanService;
