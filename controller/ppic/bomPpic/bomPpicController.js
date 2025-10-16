const { Op, Sequelize, where } = require("sequelize");
const BomPpicModel = require("../../../model/ppic/bomPpic/bomPpicModel");
const BomPpicKertasModel = require("../../../model/ppic/bomPpic/bomPpicKertasModel");
const BomPpicTintaModel = require("../../../model/ppic/bomPpic/bomPpicTintaModel");
const BomPpicTintaDetailModel = require("../../../model/ppic/bomPpic/bomPpicTintaDetailModel");
const BomPpicCorrugatedModel = require("../../../model/ppic/bomPpic/bomPpicCorrugatedModel");
const BomPpicPolibanModel = require("../../../model/ppic/bomPpic/bomPpicPolibanModel");
const BomPpicCoatingModel = require("../../../model/ppic/bomPpic/bomPpicCoatingModel");
const BomPpicLemModel = require("../../../model/ppic/bomPpic/bomPpicLemModel");
const BomPpicUserAction = require("../../../model/ppic/bomPpic/bomPpicUserActionModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const soModel = require("../../../model/marketing/so/soModel");

const BomPpicController = {
  getBomPpicModel: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, status, status_proses, search } =
      req.query;
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
          { status_bom_ppic_ppic: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status_proses) obj.status_tiket = status_tiket;
    if (status) obj.status = status;
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

          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await BomPpicModel.findByPk(_id, {
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
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await BomPpicModel.findAll({
          order: [["tgl_pembuatan_bom_ppic", "DESC"]],
          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getBomPpicJumlahData: async (req, res) => {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini
      const length = await BomPpicModel.count({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
      });

      return res.status(200).json({
        succes: true,
        status_code: 200,
        total_data: length,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createBomPpicModel: async (req, res) => {
    const {
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
      tgl_kirim_customer,
      bom_ppic_kertas,
      bom_ppic_tinta,
      bom_ppic_corrugated,
      bom_ppic_poliban,
      bom_ppic_coating,
      bom_ppic_lem,
      lain_lain,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataBomPpicModel = await BomPpicModel.create(
        {
          id_io,
          id_so,
          id_bom,
          id_create_bom_ppic: req.user.id,
          no_bom_ppic,
          no_io,
          no_so,
          no_bom,
          no_jo,
          customer,
          produk,
          tgl_kirim_customer,
        },
        { transaction: t }
      );

      if (bom_ppic_kertas && bom_ppic_kertas.length > 0) {
        let dataPpicBomKertas = [];
        for (let iKertas = 0; iKertas < bom_ppic_kertas.length; iKertas++) {
          const e = bom_ppic_kertas[iKertas];
          dataPpicBomKertas.push({
            id_bom_ppic: dataBomPpicModel.id,
            id_kertas: e.id_kertas,
            nama_kertas: e.nama_kertas,
            qty_lembar_plano: e.qty_lembar_plano,
            qty_beli: e.qty_beli,
            qty_stok: e.qty_stok,
          });
        }
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
            { transaction: t }
          );

          for (
            let iTintaDetail = 0;
            iTintaDetail < bom_ppic_tinta[iTinta].tinta_detail.length;
            iTintaDetail++
          ) {
            const e = bom_ppic_tinta[iTinta].tinta_detail[iTintaDetail];
            await BomPpicTintaDetailModel.create(
              {
                id_bom_ppic_tinta: dataBomTinta.id,
                id_item_tinta: e.id_item_tinta,
                nama_item_tinta: e.nama_item_tinta,
                persentase_tinta: e.persentase_tinta,
                qty_tinta: e.qty_tinta,
                qty_beli: e.qty_beli,
                qty_stok: e.qty_stok,
              },
              { transaction: t }
            );
          }
        }
      }

      if (bom_ppic_corrugated && bom_ppic_corrugated.length > 0) {
        let dataBomPpicCorrugated = [];
        for (
          let iCorrugated = 0;
          iCorrugated < bom_ppic_corrugated.length;
          iCorrugated++
        ) {
          const e = bom_ppic_corrugated[iCorrugated];
          dataBomPpicCorrugated.push({
            id_bom_ppic: dataBomPpicModel.id,
            id_corrugated: e.id_corrugated,
            nama_corrugated: e.nama_corrugated,
            isi_per_pack: e.isi_per_pack,
            qty_corrugated: e.qty_corrugated,
            qty_beli: e.qty_beli,
            qty_stok: e.qty_stok,
          });
        }
        await BomPpicCorrugatedModel.bulkCreate(dataBomPpicCorrugated, {
          transaction: t,
        });
      }

      if (bom_ppic_poliban && bom_ppic_poliban.length > 0) {
        let dataBomPpicPoliban = [];
        for (let iPoliban = 0; iPoliban < bom_ppic_poliban.length; iPoliban++) {
          const e = bom_ppic_poliban[iPoliban];
          dataBomPpicPoliban.push({
            id_bom_ppic: dataBomPpicModel.id,
            item_poliban: e.item_poliban,
            isi_satu_ikat: e.isi_satu_ikat,
            lembar_poliban: e.lembar_poliban,
            qty_poliban: e.qty_poliban,
            qty_beli: e.qty_beli,
            qty_stok: e.qty_stok,
          });
        }
        await BomPpicPolibanModel.bulkCreate(dataBomPpicPoliban, {
          transaction: t,
        });
      }

      if (bom_ppic_coating && bom_ppic_coating.length > 0) {
        let dataBomPpicCoating = [];
        for (let iCoating = 0; iCoating < bom_ppic_coating.length; iCoating++) {
          const e = bom_ppic_coating[iCoating];
          dataBomPpicCoating.push({
            id_bom_ppic: dataBomPpicModel.id,
            id_coating_depan: e.id_coating_depan,
            id_coating_belakang: e.id_coating_belakang,
            nama_coating_depan: e.nama_coating_depan,
            nama_coating_belakang: e.nama_coating_belakang,
            qty_coating_depan: e.qty_coating_depan,
            qty_coating_belakang: e.qty_coating_belakang,
            uv_wb: e.uv_wb,
            varnish_doff: e.varnish_doff,
            qty_beli_coating_depan: e.qty_beli_coating_depan,
            qty_stok_coating_depan: e.qty_stok_coating_depan,
            qty_beli_coating_belakang: e.qty_beli_coating_belakang,
            qty_stok_coating_belakang: e.qty_stok_coating_belakang,
          });
        }
        await BomPpicCoatingModel.bulkCreate(dataBomPpicCoating, {
          transaction: t,
        });
      }

      if (bom_ppic_lem && bom_ppic_lem.length > 0) {
        let dataBomPpicLem = [];
        for (let iLem = 0; iLem < bom_ppic_lem.length; iLem++) {
          const e = bom_ppic_lem[iLem];
          dataBomPpicLem.push({
            id_bom_ppic: dataBomPpicModel.id,
            id_lem: e.id_lem,
            nama_lem: e.nama_lem,
            rumus_lem: e.rumus_lem,
            qty_konstanta: e.qty_konstanta,
            qty_lem: e.qty_lem,
            qty_beli: e.qty_beli,
            qty_stok: e.qty_stok,
          });
        }
        await BomPpicLemModel.bulkCreate(dataBomPpicLem, {
          transaction: t,
        });
      }

      await t.commit();
      res.status(200).json({
        msg: "Create Successfully",
        data: dataBomPpicModel,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateBomPpicModel: async (req, res) => {
    const { id } = req.params; // id bom utama
    const {
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
    } = req.body;

    const t = await db.transaction();
    try {
      // Update BOM utama
      const dataBom = await BomPpicModel.findByPk(id);
      if (!dataBom)
        return res.status(404).json({ msg: "Data BOM tidak ditemukan" });

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
        { transaction: t }
      );

      // === Fungsi util untuk update child ===
      async function syncChild(
        model,
        tableName,
        foreignKey,
        newData,
        idField = "id"
      ) {
        const existing = await model.findAll({
          where: { [foreignKey]: id },
          transaction: t,
        });
        const existingIds = existing.map((e) => e[idField]);
        const incomingIds = newData
          .filter((d) => d[idField])
          .map((d) => d[idField]);

        // 🔸 Hapus data yang tidak ada lagi di frontend
        const deletedIds = existingIds.filter(
          (eid) => !incomingIds.includes(eid)
        );
        if (deletedIds.length > 0) {
          await model.destroy({
            where: { [idField]: deletedIds },
            transaction: t,
          });
        }

        // 🔸 Update & Insert
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

      // === Sinkronisasi setiap bagian ===
      if (bom_ppic_kertas) {
        await syncChild(
          BomPpicKertasModel,
          "bom_ppic_kertas",
          "id_bom_ppic",
          bom_ppic_kertas
        );
      }

      if (bom_ppic_corrugated) {
        await syncChild(
          BomPpicCorrugatedModel,
          "bom_ppic_corrugated",
          "id_bom_ppic",
          bom_ppic_corrugated
        );
      }

      if (bom_ppic_poliban) {
        await syncChild(
          BomPpicPolibanModel,
          "bom_ppic_poliban",
          "id_bom_ppic",
          bom_ppic_poliban
        );
      }

      if (bom_ppic_coating) {
        await syncChild(
          BomPpicCoatingModel,
          "bom_ppic_coating",
          "id_bom_ppic",
          bom_ppic_coating
        );
      }

      if (bom_ppic_lem) {
        await syncChild(
          BomPpicLemModel,
          "bom_ppic_lem",
          "id_bom_ppic",
          bom_ppic_lem
        );
      }

      // === Khusus bom_ppic_tinta karena ada child tinta_detail ===
      if (bom_ppic_tinta) {
        // Ambil data tinta lama
        const existingTinta = await BomPpicTintaModel.findAll({
          where: { id_bom_ppic: id },
          include: [{ model: BomPpicTintaDetailModel, as: "tinta_detail" }],
          transaction: t,
        });

        const existingTintaIds = existingTinta.map((e) => e.id);
        const incomingTintaIds = bom_ppic_tinta
          .filter((e) => e.id)
          .map((e) => e.id);

        // Hapus tinta yang dihapus
        const deletedTintaIds = existingTintaIds.filter(
          (eid) => !incomingTintaIds.includes(eid)
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

        // Update / Insert tinta baru
        for (const tinta of bom_ppic_tinta) {
          let tintaModel;
          if (tinta.id) {
            tintaModel = await BomPpicTintaModel.findByPk(tinta.id, {
              transaction: t,
            });
            await tintaModel.update(tinta, { transaction: t });
          } else {
            tintaModel = await BomPpicTintaModel.create(
              { ...tinta, id_bom: id },
              { transaction: t }
            );
          }

          // Sinkronisasi tinta_detail
          const detail = tinta.tinta_detail || [];
          const existingDetail = await BomPpicTintaDetailModel.findAll({
            where: { id_bom_ppic_tinta: tintaModel.id },
            transaction: t,
          });

          const existingDetailIds = existingDetail.map((d) => d.id);
          const incomingDetailIds = detail.filter((d) => d.id).map((d) => d.id);
          const deletedDetailIds = existingDetailIds.filter(
            (eid) => !incomingDetailIds.includes(eid)
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
                { transaction: t }
              );
            }
          }
        }
      }

      await t.commit();
      res.status(200).json({ msg: "Update BOM berhasil" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  submitRequestBomPpic: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await BomPpicModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomPpicModel.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await BomUserAction.create(
          { id_bom: checkData.id, id_user: req.user.id, status: "requested" },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Request Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveBomPpic: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await BomPpicModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomPpicModel.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_bom_ppic: req.user.id,
          tgl_approve_bom_ppic: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await BomPpicUserAction.create(
          {
            id_bom_ppic: checkData.id,
            id_user: req.user.id,
            status: "approve",
          },
          { transaction: t }
        );

      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  rejectBomPpic: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await BomPpicModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomPpicModel.update(
        {
          status_proses: "reject kabag",
          status: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await BomPpicUserAction.create(
          {
            id_bom: checkData.id,
            id_user: req.user.id,
            status: "kabag reject",
          },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "reject Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = BomPpicController;
