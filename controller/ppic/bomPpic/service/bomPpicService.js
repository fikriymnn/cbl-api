const { Op, literal } = require("sequelize");
const BomModel = require("../../../../model/ppic/bom/bomModel");
const BomPpicModel = require("../../../../model/ppic/bomPpic/bomPpicModel");
const BomPpicKertasModel = require("../../../../model/ppic/bomPpic/bomPpicKertasModel");
const BomPpicTintaModel = require("../../../../model/ppic/bomPpic/bomPpicTintaModel");
const BomPpicTintaDetailModel = require("../../../../model/ppic/bomPpic/bomPpicTintaDetailModel");
const BomPpicCorrugatedModel = require("../../../../model/ppic/bomPpic/bomPpicCorrugatedModel");
const BomPpicPolibanModel = require("../../../../model/ppic/bomPpic/bomPpicPolibanModel");
const BomPpicCoatingModel = require("../../../../model/ppic/bomPpic/bomPpicCoatingModel");
const BomPpicLemModel = require("../../../../model/ppic/bomPpic/bomPpicLemModel");
const BomPpicUserAction = require("../../../../model/ppic/bomPpic/bomPpicUserActionModel");
const BomPpicLainLain = require("../../../../model/ppic/bomPpic/bomPpicLainLainModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const Users = require("../../../../model/userModel");
const db = require("../../../../config/database");
const soModel = require("../../../../model/marketing/so/soModel");
const OutstandingStockRawMaterialService = require("../../../gudangRM/outstandingStockRawMaterial/service/outstandingStockRawMaterialService");

// NOTE: sesuaikan path require di atas dengan lokasi file model kamu yang sebenarnya.
// NOTE: OutstandingStockRawMaterialService di-import di controller asli tapi tidak
// dipakai di method manapun -> tetap saya sertakan di sini kalau memang dipakai
// di bagian lain yang tidak ke-include di potongan kode yang kamu kirim.

// Bangun payload item raw material (per kategori qty_stok > 0) dari data BOM PPIC
// yang sudah di-include kertas/tinta/corrugated/poliban/coating/lem.
// checkData = hasil BomPpicModel.findByPk(id, { include: [...] })
function buildOutstandingItemsFromBomPpic(checkData) {
  const common = {
    id_jo: checkData.id_jo,
    id_so: checkData.id_so,
    id_io: checkData.id_io,
    id_bom_ppic: checkData.id,
    no_jo: checkData.no_jo,
    no_io: checkData.no_io,
    no_so: checkData.no_so,
    no_bom_ppic: checkData.no_bom_ppic,
    customer: checkData.customer,
    produk: checkData.produk,
    rencana_cetak: checkData.tgl_rencana_cetak,
  };

  const kertas = (checkData.bom_ppic_kertas || [])
    .filter((e) => e.qty_stok > 0)
    .map((e) => ({
      ...common,
      id_item: e.id_kertas,
      nama_item: e.nama_kertas,
      qty: e.qty_stok,
      tipe_barang: "Kertas",
      satuan: "rim",
    }));

  const tinta = (checkData.bom_ppic_tinta || [])
    .flatMap((t) => t.tinta_detail || [])
    .filter((d) => d.qty_stok > 0)
    .map((d) => ({
      ...common,
      id_item: d.id_item_tinta,
      nama_item: d.nama_item_tinta,
      qty: d.qty_stok,
      tipe_barang: "Tinta",
      satuan: "Kg",
    }));

  const corrugated = (checkData.bom_ppic_corrugated || [])
    .filter((e) => e.qty_stok > 0)
    .map((e) => ({
      ...common,
      id_item: e.id_corrugated,
      nama_item: e.nama_corrugated,
      qty: e.qty_stok,
      tipe_barang: "Corrugated",
      satuan: "pcs",
    }));

  const poliban = (checkData.bom_ppic_poliban || [])
    .filter((e) => e.qty_stok > 0)
    .map((e) => ({
      ...common,
      id_item: e.id_item_poliban,
      nama_item: e.nama_item_poliban,
      qty: e.qty_stok,
      tipe_barang: "Poliban",
      satuan: "",
    }));

  const coating = (checkData.bom_ppic_coating || [])
    .filter((e) => e.qty_stok > 0)
    .map((e) => ({
      ...common,
      id_item: e.id_coating,
      nama_item: e.nama_coating,
      qty: e.qty_stok,
      tipe_barang: "Coating",
      satuan: "Kg",
    }));

  const lem = (checkData.bom_ppic_lem || [])
    .filter((e) => e.qty_stok > 0)
    .map((e) => ({
      ...common,
      id_item: e.id_lem,
      nama_item: e.nama_lem,
      qty: e.qty_stok,
      tipe_barang: "Lem",
      satuan: "Kg",
    }));

  const dataItem = [
    ...kertas,
    ...tinta,
    ...corrugated,
    ...poliban,
    ...coating,
    ...lem,
  ];

  return { kertas, tinta, corrugated, poliban, coating, lem, dataItem };
}

const BomPpicService = {
  // get list / get by id BOM PPIC
  getBomPpicModelService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    status_proses,
    search,
    is_request_purchase,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { no_bom_ppic_ppic: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { no_bom: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
          { status_bom_ppic: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // NOTE: di kode asli ada bug -> `obj.status_tiket = status_tiket` (variable
    // status_tiket tidak pernah dideklarasikan). Saya perbaiki jadi status_proses
    // sesuai nama query param yang diterima. Kalau nama kolom di model beda,
    // tinggal sesuaikan key-nya.
    if (status_proses) obj.status_proses = status_proses;
    if (status) obj.status = status;
    if (is_request_purchase)
      obj.is_request_purchase = is_request_purchase == "true" ? true : false;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom_ppic = { [Op.between]: [startDate, endDate] };
    }

    try {
      if (page && limit) {
        const length = await BomPpicModel.count({ where: obj });
        const data = await BomPpicModel.findAll({
          order: [["tgl_pembuatan_bom_ppic", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: BomPpicKertasModel,
              as: "bom_ppic_kertas",
            },
          ],
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
        const data = await BomPpicModel.findByPk(id, {
          include: [
            {
              model: soModel,
              as: "so",
            },
            {
              model: BomPpicKertasModel,
              as: "bom_ppic_kertas",
            },
            {
              model: BomPpicTintaModel,
              as: "bom_ppic_tinta",
              include: [
                {
                  model: BomPpicTintaDetailModel,
                  as: "tinta_detail",
                },
              ],
            },
            {
              model: BomPpicCorrugatedModel,
              as: "bom_ppic_corrugated",
            },
            {
              model: BomPpicPolibanModel,
              as: "bom_ppic_poliban",
            },
            {
              model: BomPpicCoatingModel,
              as: "bom_ppic_coating",
            },
            {
              model: BomPpicLemModel,
              as: "bom_ppic_lem",
            },
            {
              model: BomPpicLainLain,
              as: "lain_lain",
            },
            {
              model: Users,
              as: "user_create",
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
        const data = await BomPpicModel.findAll({
          order: [["tgl_pembuatan_bom_ppic", "DESC"]],
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

  // hitung jumlah data BOM PPIC tahun berjalan
  getBomPpicJumlahDataService: async () => {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      const length = await BomPpicModel.count({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
      });

      return {
        status_code: 200,
        success: true,
        total_data: length,
      };
    } catch (error) {
      return {
        status_code: 400,
        success: false,
        message: error.message,
      };
    }
  },

  // create BOM PPIC beserta semua child-nya
  createBomPpicModelService: async ({
    id_io,
    id_so,
    id_bom,
    no_bom_ppic,
    no_io,
    no_so,
    no_bom,
    no_jo,
    customer,
    produk,
    tgl_rencana_cetak,
    tgl_kirim_customer,
    bom_ppic_kertas,
    bom_ppic_tinta,
    bom_ppic_corrugated,
    bom_ppic_poliban,
    bom_ppic_coating,
    bom_ppic_lem,
    lain_lain,
    qty_po,
    qty_fg,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      // get data terakhir untuk penomoran no_bom_ppic
      const lastdataBomPpic = await BomPpicModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format BP-00001/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_bom_ppic, 4), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
        transaction: t,
      });

      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      const shortYear = String(currentYear).slice(2);

      let nextNumberBom = 1;
      if (lastdataBomPpic) {
        const lastNo = lastdataBomPpic.no_bom_ppic;
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);
        nextNumberBom = lastSeq + 1;
      }
      const paddedNumberBomPpic = String(nextNumberBom).padStart(4, "0");
      const newBomPpicNumber = `BP-${paddedNumberBomPpic}/${currentMonth}/${shortYear}`;

      // cek apakah sudah punya JO
      let idJo = null;
      let noJo = null;
      let checkJo = null;
      if (id_so) {
        checkJo = await JobOrder.findOne({
          where: { id_so: id_so, is_active: true },
          transaction: t,
        });
      } else {
        checkJo = await JobOrder.findOne({
          where: { id_io: id_io, is_active: true },
          transaction: t,
        });
      }

      if (checkJo) {
        idJo = checkJo.id;
        noJo = checkJo.no_jo;
      }

      const dataBomPpicModel = await BomPpicModel.create(
        {
          id_jo: idJo,
          id_io,
          id_so,
          id_bom,
          id_create_bom_ppic: id_user,
          no_jo: noJo,
          no_bom_ppic: newBomPpicNumber,
          no_io,
          no_so,
          no_bom,
          customer,
          produk,
          tgl_rencana_cetak: tgl_rencana_cetak || null,
          tgl_kirim_customer: tgl_kirim_customer || null,
          qty_fg,
          qty_po,
        },
        { transaction: t },
      );

      if (bom_ppic_kertas && bom_ppic_kertas.length > 0) {
        const dataPpicBomKertas = bom_ppic_kertas.map((e) => ({
          id_bom_ppic: dataBomPpicModel.id,
          id_kertas: e.id_kertas,
          nama_kertas: e.nama_kertas,
          qty_lembar_plano: e.qty_lembar_plano,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicKertasModel.bulkCreate(dataPpicBomKertas, {
          transaction: t,
        });
      }

      if (bom_ppic_tinta && bom_ppic_tinta.length > 0) {
        for (let iTinta = 0; iTinta < bom_ppic_tinta.length; iTinta++) {
          const e = bom_ppic_tinta[iTinta];
          const dataBomTinta = await BomPpicTintaModel.create(
            {
              id_bom_ppic: dataBomPpicModel.id,
              warna_tinta: e.warna_tinta,
              id_jenis_tinta: e.id_jenis_tinta,
              id_jenis_kertas: e.id_jenis_kertas,
              id_jenis_warna_tinta: e.id_jenis_warna_tinta,
              jenis_mesin_cetak: e.jenis_mesin_cetak,
              area_cetak: e.area_cetak,
              qty_tinta: e.qty_tinta,
            },
            { transaction: t },
          );

          const tintaDetailList = bom_ppic_tinta[iTinta].tinta_detail || [];
          for (
            let iTintaDetail = 0;
            iTintaDetail < tintaDetailList.length;
            iTintaDetail++
          ) {
            const d = tintaDetailList[iTintaDetail];
            await BomPpicTintaDetailModel.create(
              {
                id_bom_ppic_tinta: dataBomTinta.id,
                id_item_tinta: d.id_item_tinta,
                nama_item_tinta: d.nama_item_tinta,
                persentase_tinta: d.persentase_tinta,
                qty_tinta: d.qty_tinta,
                qty_beli: d.qty_beli,
                qty_stok: d.qty_stok,
              },
              { transaction: t },
            );
          }
        }
      }

      if (bom_ppic_corrugated && bom_ppic_corrugated.length > 0) {
        const dataBomPpicCorrugated = bom_ppic_corrugated.map((e) => ({
          id_bom_ppic: dataBomPpicModel.id,
          id_corrugated: e.id_corrugated,
          nama_corrugated: e.nama_corrugated,
          isi_per_pack: e.isi_per_pack,
          qty_corrugated: e.qty_corrugated,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicCorrugatedModel.bulkCreate(dataBomPpicCorrugated, {
          transaction: t,
        });
      }

      if (bom_ppic_poliban && bom_ppic_poliban.length > 0) {
        const dataBomPpicPoliban = bom_ppic_poliban.map((e) => ({
          id_bom_ppic: dataBomPpicModel.id,
          id_item_poliban: e.id_item_poliban,
          nama_item_poliban: e.nama_item_poliban,
          item_poliban: e.item_poliban,
          isi_satu_ikat: e.isi_satu_ikat,
          lembar_poliban: e.lembar_poliban,
          qty_poliban: e.qty_poliban,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicPolibanModel.bulkCreate(dataBomPpicPoliban, {
          transaction: t,
        });
      }

      if (bom_ppic_coating && bom_ppic_coating.length > 0) {
        const dataBomPpicCoating = bom_ppic_coating.map((e) => ({
          id_bom_ppic: dataBomPpicModel.id,
          id_coating: e.id_coating,
          id_brand: e.id_brand,
          nama_coating: e.nama_coating,
          nama_brand: e.nama_brand,
          qty_coating: e.qty_coating,
          uv_wb: e.uv_wb,
          varnish_doff: e.varnish_doff,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicCoatingModel.bulkCreate(dataBomPpicCoating, {
          transaction: t,
        });
      }

      if (bom_ppic_lem && bom_ppic_lem.length > 0) {
        const dataBomPpicLem = bom_ppic_lem.map((e) => ({
          id_bom_ppic: dataBomPpicModel.id,
          id_lem: e.id_lem,
          nama_lem: e.nama_lem,
          rumus_lem: e.rumus_lem,
          qty_konstanta: e.qty_konstanta,
          qty_lem: e.qty_lem,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicLemModel.bulkCreate(dataBomPpicLem, { transaction: t });
      }

      if (lain_lain && lain_lain.length > 0) {
        // NOTE: kode asli pakai key `id_bom` di sini (bukan `id_bom_ppic` seperti
        // child lainnya) -> saya pertahankan apa adanya, cek lagi apakah ini
        // memang kolom yang benar di BomPpicLainLainModel.
        const dataBomPpicLainLain = lain_lain.map((e) => ({
          id_bom: dataBomPpicModel.id,
          nama_item: e.nama_item,
          harga: e.harga,
          qty_beli: e.qty_beli,
          qty_stok: e.qty_stok,
        }));
        await BomPpicLainLain.bulkCreate(dataBomPpicLainLain, {
          transaction: t,
        });
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "Create Successfully",
        data: dataBomPpicModel,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // update BOM PPIC beserta sinkronisasi child (kertas, tinta, corrugated, dst)
  updateBomPpicModelService: async ({
    id,
    id_io,
    id_so,
    id_io_mounting,
    nama_mounting,
    no_bom,
    no_io,
    no_so,
    customer,
    produk,
    bom_ppic_kertas,
    bom_ppic_tinta,
    bom_ppic_corrugated,
    bom_ppic_poliban,
    bom_ppic_coating,
    bom_ppic_lem,
    lain_lain,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataBom = await BomPpicModel.findByPk(id, { transaction: t });
      if (!dataBom) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data BOM PPIC tidak ditemukan",
        };
      }

      await dataBom.update(
        {
          id_io,
          id_so,
          id_io_mounting,
          nama_mounting,
          no_bom,
          no_io,
          no_so,
          customer,
          produk,
        },
        { transaction: t },
      );

      // === util untuk sinkronisasi child (delete yang hilang, update/insert sisanya) ===
      async function syncChild(model, foreignKey, newData, idField = "id") {
        const existing = await model.findAll({
          where: { [foreignKey]: id },
          transaction: t,
        });
        const existingIds = existing.map((e) => e[idField]);
        const incomingIds = newData
          .filter((d) => d[idField])
          .map((d) => d[idField]);

        const deletedIds = existingIds.filter(
          (eid) => !incomingIds.includes(eid),
        );
        if (deletedIds.length > 0) {
          await model.destroy({
            where: { [idField]: deletedIds },
            transaction: t,
          });
        }

        for (const item of newData) {
          if (item[idField]) {
            await model.update(item, {
              where: { [idField]: item[idField] },
              transaction: t,
            });
          } else {
            item[foreignKey] = id;
            await model.create(item, { transaction: t });
          }
        }
      }

      if (bom_ppic_kertas) {
        await syncChild(BomPpicKertasModel, "id_bom_ppic", bom_ppic_kertas);
      }

      if (bom_ppic_corrugated) {
        await syncChild(
          BomPpicCorrugatedModel,
          "id_bom_ppic",
          bom_ppic_corrugated,
        );
      }

      if (bom_ppic_poliban) {
        await syncChild(BomPpicPolibanModel, "id_bom_ppic", bom_ppic_poliban);
      }

      if (bom_ppic_coating) {
        await syncChild(BomPpicCoatingModel, "id_bom_ppic", bom_ppic_coating);
      }

      if (bom_ppic_lem) {
        await syncChild(BomPpicLemModel, "id_bom_ppic", bom_ppic_lem);
      }

      if (lain_lain) {
        await syncChild(BomPpicLainLain, "id_bom_ppic", lain_lain);
      }

      // khusus bom_ppic_tinta karena ada child tinta_detail
      if (bom_ppic_tinta) {
        const existingTinta = await BomPpicTintaModel.findAll({
          where: { id_bom_ppic: id },
          include: [{ model: BomPpicTintaDetailModel, as: "tinta_detail" }],
          transaction: t,
        });

        const existingTintaIds = existingTinta.map((e) => e.id);
        const incomingTintaIds = bom_ppic_tinta
          .filter((e) => e.id)
          .map((e) => e.id);

        const deletedTintaIds = existingTintaIds.filter(
          (eid) => !incomingTintaIds.includes(eid),
        );
        if (deletedTintaIds.length > 0) {
          await BomPpicTintaDetailModel.destroy({
            where: { id_bom_ppic_tinta: deletedTintaIds },
            transaction: t,
          });
          await BomPpicTintaModel.destroy({
            where: { id: deletedTintaIds },
            transaction: t,
          });
        }

        for (const tinta of bom_ppic_tinta) {
          let tintaModel;
          if (tinta.id) {
            tintaModel = await BomPpicTintaModel.findByPk(tinta.id, {
              transaction: t,
            });
            await tintaModel.update(tinta, { transaction: t });
          } else {
            tintaModel = await BomPpicTintaModel.create(
              { ...tinta, id_bom_ppic: id },
              { transaction: t },
            );
          }

          const detail = tinta.tinta_detail || [];
          const existingDetail = await BomPpicTintaDetailModel.findAll({
            where: { id_bom_ppic_tinta: tintaModel.id },
            transaction: t,
          });

          const existingDetailIds = existingDetail.map((d) => d.id);
          const incomingDetailIds = detail.filter((d) => d.id).map((d) => d.id);
          const deletedDetailIds = existingDetailIds.filter(
            (eid) => !incomingDetailIds.includes(eid),
          );

          if (deletedDetailIds.length > 0) {
            await BomPpicTintaDetailModel.destroy({
              where: { id: deletedDetailIds },
              transaction: t,
            });
          }

          for (const d of detail) {
            if (d.id) {
              await BomPpicTintaDetailModel.update(d, {
                where: { id: d.id },
                transaction: t,
              });
            } else {
              await BomPpicTintaDetailModel.create(
                { ...d, id_bom_ppic_tinta: tintaModel.id },
                { transaction: t },
              );
            }
          }
        }
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "Update BOM berhasil",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // submit request BOM PPIC ke kabag
  submitRequestBomPpicService: async ({ id, id_user, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await BomPpicModel.findByPk(id, { transaction: t });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data tidak ditemukan",
        };
      }

      await BomPpicModel.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        { where: { id }, transaction: t },
      );

      await BomPpicUserAction.create(
        { id_bom: checkData.id, id_user, status: "requested" },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "Request Successful",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // approve BOM PPIC
  approveBomPpicService: async ({ id, id_user, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await BomPpicModel.findByPk(id, {
        include: [
          {
            model: BomPpicKertasModel,
            as: "bom_ppic_kertas",
          },
          {
            model: BomPpicTintaModel,
            as: "bom_ppic_tinta",
            include: [
              {
                model: BomPpicTintaDetailModel,
                as: "tinta_detail",
              },
            ],
          },
          {
            model: BomPpicCorrugatedModel,
            as: "bom_ppic_corrugated",
          },
          {
            model: BomPpicPolibanModel,
            as: "bom_ppic_poliban",
          },
          {
            model: BomPpicCoatingModel,
            as: "bom_ppic_coating",
          },
          {
            model: BomPpicLemModel,
            as: "bom_ppic_lem",
          },
          {
            model: BomPpicLainLain,
            as: "lain_lain",
          },
          {
            model: Users,
            as: "user_create",
          },
          {
            model: Users,
            as: "user_approve",
          },
        ],
        transaction: t,
      });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data tidak ditemukan",
        };
      }

      // kumpulkan item per kategori yang qty_stok nya > 0, dipetakan ke bentuk
      // yang siap dipakai OutstandingStockRawMaterialService
      const { dataItem } = buildOutstandingItemsFromBomPpic(checkData);

      await BomPpicModel.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_bom_ppic: id_user,
          tgl_approve_bom_ppic: new Date(),
        },
        { where: { id }, transaction: t },
      );

      await BomModel.update(
        { is_bom_ppic_done: true },
        { where: { id: checkData.id_bom }, transaction: t },
      );

      await BomPpicUserAction.create(
        {
          id_bom_ppic: checkData.id,
          id_user,
          status: "approve",
        },
        { transaction: t },
      );

      // create outstanding stock raw material untuk setiap item (qty_stok > 0)
      // dalam transaksi yang sama, biar rollback bareng kalau ada yang gagal
      const createdOutstandingStock = [];
      for (const item of dataItem) {
        const resultCreate =
          await OutstandingStockRawMaterialService.createOutstandingStockRawMaterialService(
            { ...item, transaction: t },
          );

        if (!resultCreate.success) {
          if (!transaction) await t.rollback();
          return {
            status_code: resultCreate.status_code || 500,
            success: false,
            message: `Gagal membuat outstanding stock untuk item "${item.nama_item}": ${resultCreate.message}`,
          };
        }

        createdOutstandingStock.push(resultCreate.data);
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "Approve Successful",
        data: createdOutstandingStock,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // reject BOM PPIC
  rejectBomPpicService: async ({
    id,
    id_user,
    note_reject,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await BomPpicModel.findByPk(id, { transaction: t });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data tidak ditemukan",
        };
      }

      await BomPpicModel.update(
        {
          status_proses: "reject kabag",
          status: "draft",
          note_reject: note_reject,
        },
        { where: { id }, transaction: t },
      );

      await BomPpicUserAction.create(
        {
          id_bom: checkData.id,
          id_user,
          status: "kabag reject",
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject Successful",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // kembalikan BOM PPIC ke proses BOM
  backToProcessBomService: async ({ id, id_user, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await BomPpicModel.findByPk(id, { transaction: t });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data tidak ditemukan",
        };
      }

      await BomPpicModel.update(
        {
          status_proses: "kembali ke BOM",
          status: "draft",
        },
        { where: { id }, transaction: t },
      );

      await BomModel.update(
        { status_proses: "kembali dari BOM PPIC", status: "draft" },
        { where: { id: checkData.id_bom }, transaction: t },
      );

      await BomPpicUserAction.create(
        {
          id_bom: checkData.id,
          id_user,
          status: "kembali ke BOM",
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject Successful",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = BomPpicService;
