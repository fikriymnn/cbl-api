const { Op, Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const TambahBahanPemakaian = require("../../../../model/gudangRM/tambahBahanPemakaian/tambahBahanPemakaianModel");
const TambahBahanPemakaianDefect = require("../../../../model/gudangRM/tambahBahanPemakaian/tambahBahanPemakaianDefectModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");

const TambahBahanPemakaianService = {
  getTambahBahanPemakaianService: async ({
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
        model: TambahBahanPemakaianDefect,
        as: "tambah_bahan_pemakaian_defect",
        where: { is_active: true },
        required: false,
      },
    ];

    try {
      if (page && limit) {
        const length = await TambahBahanPemakaian.count({ where: obj });
        const data = await TambahBahanPemakaian.findAll({
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
        const data = await TambahBahanPemakaian.findOne({
          where: { id, is_active: true },
          include,
        });
        return {
          status: 200,
          success: true,
          data,
        };
      } else {
        const data = await TambahBahanPemakaian.findAll({
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

  createTambahBahanPemakaianService: async ({
    id_jo,
    id_kertas,
    id_user_request,
    qty_tambah_bahan,
    note,
    tambah_bahan_defect = [],
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

      const dataTambahBahan = await TambahBahanPemakaian.create(
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

      // defect langsung dibuat bareng parent (tidak ada fungsi "pakai" terpisah)
      if (tambah_bahan_defect && tambah_bahan_defect.length > 0) {
        const payload = tambah_bahan_defect.map((item) => ({
          id_tambah_bahan_pemakaian: dataTambahBahan.id,
          id_kode_produksi: item.id_kode_produksi || null,
          kode: item.kode || null,
          deskripsi: item.deskripsi || null,
          qty_tambah_bahan: item.qty_tambah_bahan || 0,
        }));
        await TambahBahanPemakaianDefect.bulkCreate(payload, {
          transaction: t,
        });
      }

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

  editTambahBahanPemakaianService: async ({
    id,
    id_jo,
    id_kertas,
    id_user_request,
    id_user_qc,
    id_user_gudang,
    qty_tambah_bahan,
    qty_tambah_bahan_qc,
    qty_tambah_bahan_gudang,
    note,
    note_qc,
    note_gudang,
    status,
    status_tiket,
    tambah_bahan_defect,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
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

      await TambahBahanPemakaian.update(
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
          qty_tambah_bahan_qc:
            qty_tambah_bahan_qc ?? dataTambahBahan.qty_tambah_bahan_qc,
          qty_tambah_bahan_gudang:
            qty_tambah_bahan_gudang ?? dataTambahBahan.qty_tambah_bahan_gudang,
          note: note ?? dataTambahBahan.note,
          note_qc: note_qc ?? dataTambahBahan.note_qc,
          note_gudang: note_gudang ?? dataTambahBahan.note_gudang,
          status: status ?? dataTambahBahan.status,
          status_tiket: status_tiket ?? dataTambahBahan.status_tiket,
        },
        { where: { id }, transaction: t },
      );

      // sync child defect (edit bisa ubah semuanya, termasuk defect)
      if (tambah_bahan_defect && tambah_bahan_defect.length >= 0) {
        const existingDefects = await TambahBahanPemakaianDefect.findAll({
          where: { id_tambah_bahan_pemakaian: id, is_active: true },
          transaction: t,
        });
        const existingIds = existingDefects.map((d) => d.id);
        const payloadIds = tambah_bahan_defect
          .filter((d) => d.id)
          .map((d) => d.id);

        for (const item of tambah_bahan_defect) {
          if (item.id) {
            await TambahBahanPemakaianDefect.update(
              {
                id_kode_produksi: item.id_kode_produksi ?? null,
                kode: item.kode ?? null,
                deskripsi: item.deskripsi ?? null,
                qty_tambah_bahan: item.qty_tambah_bahan ?? 0,
              },
              { where: { id: item.id }, transaction: t },
            );
          } else {
            await TambahBahanPemakaianDefect.create(
              {
                id_tambah_bahan_pemakaian: id,
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
          await TambahBahanPemakaianDefect.update(
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

  approveQcTambahBahanPemakaianService: async ({
    id,
    id_user_qc,
    note_qc,
    qty_tambah_bahan_qc,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPemakaian.update(
        {
          id_user_qc,
          note_qc,
          qty_tambah_bahan_qc: qty_tambah_bahan_qc || 0,
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

  approveGudangTambahBahanPemakaianService: async ({
    id,
    id_user_gudang,
    note_gudang,
    qty_tambah_bahan_gudang,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPemakaian.update(
        {
          id_user_gudang,
          note_gudang,
          qty_tambah_bahan_gudang: qty_tambah_bahan_gudang || 0,
          status: "approve gudang",
          status_tiket: "history",
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

  rejectQcTambahBahanPemakaianService: async ({
    id,
    id_user_qc,
    note_qc,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPemakaian.update(
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

  rejectGudangTambahBahanPemakaianService: async ({
    id,
    id_user_gudang,
    note_gudang,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPemakaian.update(
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

  deleteTambahBahanPemakaianService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataTambahBahan = await TambahBahanPemakaian.findByPk(id);
      if (!dataTambahBahan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Tidak Ditemukan",
        };
      }

      await TambahBahanPemakaian.update(
        { is_active: false },
        { where: { id }, transaction: t },
      );

      await TambahBahanPemakaianDefect.update(
        { is_active: false },
        { where: { id_tambah_bahan_pemakaian: id }, transaction: t },
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

module.exports = TambahBahanPemakaianService;
