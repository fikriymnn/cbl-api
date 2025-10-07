const { Op, Sequelize, where } = require("sequelize");
const BomModel = require("../../../model/ppic/bom/bomModel");
const BomKertasModel = require("../../../model/ppic/bom/bomKertasModel");
const BomTintaModel = require("../../../model/ppic/bom/bomTintaModel");
const BomTintaDetailModel = require("../../../model/ppic/bom/bomTintaDetailModel");
const BomCorrugatedModel = require("../../../model/ppic/bom/bomCorrugatedModel");
const BomPolibanModel = require("../../../model/ppic/bom/bomPolibanModel");
const BomCoatingModel = require("../../../model/ppic/bom/bomCoatingModel");
const BomLemModel = require("../../../model/ppic/bom/bomLemModel");
const BomUserAction = require("../../../model/ppic/bom/bomLemModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const BomController = {
  getBomModel: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, status, status_proses, search } =
      req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_bom: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
          { status_bom: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status_proses) obj.status_tiket = status_tiket;
    if (status) obj.status = status;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await BomModel.count({ where: obj });
        const data = await BomModel.findAll({
          order: [["tgl_pembuatan_bom", "DESC"]],
          limit: parseInt(limit),

          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await BomModel.findByPk(_id, {
          include: [
            {
              model: BomKertasModel,
              as: "bom_kertas",
            },
            {
              model: BomTintaModel,
              as: "bom_tinta",
              include: [
                {
                  model: BomTintaDetailModel,
                  as: "tinta_detail",
                },
              ],
            },
            {
              model: BomCorrugatedModel,
              as: "bom_corrugated",
            },

            {
              model: BomPolibanModel,
              as: "bom_poliban",
            },
            {
              model: BomCoatingModel,
              as: "bom_coating",
            },
            {
              model: BomLemModel,
              as: "bom_lem",
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
        const data = await BomModel.findAll({
          order: [["tgl_pembuatan_bom", "DESC"]],
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

  createBomModel: async (req, res) => {
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
      bom_kertas,
      bom_tinta,
      bom_corrugated,
      bom_poliban,
      bom_coating,
      bom_lem,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataBomModel = await BomModel.create(
        {
          id_io,
          id_so,
          id_io_mounting,
          id_create_bom: req.user.id,
          nama_mounting,
          no_bom,
          no_io,
          no_so,
          customer,
          produk,
        },
        { transaction: t }
      );
      if (bom_kertas && bom_kertas.length > 0) {
        let dataBomKertas = [];
        for (let iKertas = 0; iKertas < bom_kertas.length; iKertas++) {
          const e = bom_kertas[iKertas];
          dataBomKertas.push({
            id_bom: dataBomModel.id,
            id_kertas: e.id_kertas,
            nama_kertas: e.nama_kertas,
            qty_lembar_plano: e.qty_lembar_plano,

            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomKertasModel.bulkCreate(dataBomKertas, { transaction: t });
      }

      if (bom_tinta && bom_tinta.length > 0) {
        for (let iTinta = 0; iTinta < bom_tinta.length; iTinta++) {
          const e = bom_tinta[iTinta];
          const dataBomTinta = await BomTintaModel.create(
            {
              id_bom: dataBomModel.id,
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
            iTintaDetail < bom_tinta[iTinta].tinta_detail.length;
            iTintaDetail++
          ) {
            const e = bom_tinta[iTinta].tinta_detail[iTintaDetail];
            await BomTintaDetailModel.create(
              {
                id_bom_tinta: dataBomTinta.id,
                id_item_tinta: e.id_item_tinta,
                nama_item_tinta: e.nama_item_tinta,
                persentase_tinta: e.persentase_tinta,
              },
              { transaction: t }
            );
          }
        }
      }

      if (bom_corrugated && bom_corrugated.length > 0) {
        let dataBomCorrugated = [];
        for (
          let iCorrugated = 0;
          iCorrugated < bom_corrugated.length;
          iCorrugated++
        ) {
          const e = bom_corrugated[iCorrugated];
          dataBomCorrugated.push({
            id_bom: dataBomModel.id,
            id_corrugated: e.id_corrugated,
            nama_corrugated: e.nama_corrugated,
            isi_per_pack: e.isi_per_pack,
            qty_corrugated: e.qty_corrugated,
            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomCorrugatedModel.bulkCreate(dataBomCorrugated, {
          transaction: t,
        });
      }

      if (bom_poliban && bom_poliban.length > 0) {
        let dataBomPoliban = [];
        for (let iPoliban = 0; iPoliban < bom_poliban.length; iPoliban++) {
          const e = bom_poliban[iPoliban];
          dataBomPoliban.push({
            id_bom: dataBomModel.id,
            item_poliban: e.item_poliban,
            isi_satu_ikat: e.isi_satu_ikat,
            lembar_poliban: e.lembar_poliban,
            qty_poliban: e.qty_poliban,
            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomPolibanModel.bulkCreate(dataBomPoliban, {
          transaction: t,
        });
      }

      if (bom_coating && bom_coating.length > 0) {
        let dataBomCoating = [];
        for (let iCoating = 0; iCoating < bom_coating.length; iCoating++) {
          const e = bom_coating[iCoating];
          dataBomCoating.push({
            id_bom: dataBomModel.id,
            id_coating_depan: e.id_coating_depan,
            id_coating_belakang: e.id_coating_belakang,
            nama_coating_depan: e.nama_coating_depan,
            nama_coating_belakang: e.nama_coating_belakang,
            qty_coating_depan: e.qty_coating_depan,
            qty_coating_belakang: e.qty_coating_belakang,
            uv_wb: e.uv_wb,
            varnish_doff: e.varnish_doff,
            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomCoatingModel.bulkCreate(dataBomCoating, {
          transaction: t,
        });
      }

      if (bom_lem && bom_lem.length > 0) {
        let dataBomLem = [];
        for (let iLem = 0; iLem < bom_lem.length; iLem++) {
          const e = bom_lem[iLem];
          dataBomLem.push({
            id_bom: dataBomModel.id,
            id_lem: e.id_lem,
            nama_lem: e.nama_lem,
            rumus_lem: e.rumus_lem,
            qty_konstanta: e.qty_konstanta,
            qty_lock_bottom: e.qty_lock_bottom,
            qty_lem_samping: e.qty_lem_samping,
            qty_four_corner: e.qty_four_corner,
            qty_samping_lock_bottom: e.qty_samping_lock_bottom,
            qty_six_corner: e.qty_six_corner,
            qty_ujung_lock_bottom: e.qty_ujung_lock_bottom,
            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomLemModel.bulkCreate(dataBomLem, {
          transaction: t,
        });
      }

      await t.commit();
      res.status(200).json({
        msg: "Create Successfully",
        data: dataBomModel,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateBomModel: async (req, res) => {
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
      bom_kertas,
      bom_tinta,
      bom_corrugated,
      bom_poliban,
      bom_coating,
      bom_lem,
    } = req.body;

    const t = await db.transaction();
    try {
      // Update BOM utama
      const dataBom = await BomModel.findByPk(id);
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
      if (bom_kertas) {
        await syncChild(BomKertasModel, "bom_kertas", "id_bom", bom_kertas);
      }

      if (bom_corrugated) {
        await syncChild(
          BomCorrugatedModel,
          "bom_corrugated",
          "id_bom",
          bom_corrugated
        );
      }

      if (bom_poliban) {
        await syncChild(BomPolibanModel, "bom_poliban", "id_bom", bom_poliban);
      }

      if (bom_coating) {
        await syncChild(BomCoatingModel, "bom_coating", "id_bom", bom_coating);
      }

      if (bom_lem) {
        await syncChild(BomLemModel, "bom_lem", "id_bom", bom_lem);
      }

      // === Khusus bom_tinta karena ada child tinta_detail ===
      if (bom_tinta) {
        // Ambil data tinta lama
        const existingTinta = await BomTintaModel.findAll({
          where: { id_bom: id },
          include: [{ model: BomTintaDetailModel, as: "tinta_detail" }],
          transaction: t,
        });

        const existingTintaIds = existingTinta.map((e) => e.id);
        const incomingTintaIds = bom_tinta.filter((e) => e.id).map((e) => e.id);

        // Hapus tinta yang dihapus
        const deletedTintaIds = existingTintaIds.filter(
          (eid) => !incomingTintaIds.includes(eid)
        );
        if (deletedTintaIds.length > 0) {
          await BomTintaDetailModel.destroy({
            where: { id_bom_tinta: deletedTintaIds },
            transaction: t,
          });
          await BomTintaModel.destroy({
            where: { id: deletedTintaIds },
            transaction: t,
          });
        }

        // Update / Insert tinta baru
        for (const tinta of bom_tinta) {
          let tintaModel;
          if (tinta.id) {
            tintaModel = await BomTintaModel.findByPk(tinta.id, {
              transaction: t,
            });
            await tintaModel.update(tinta, { transaction: t });
          } else {
            tintaModel = await BomTintaModel.create(
              { ...tinta, id_bom: id },
              { transaction: t }
            );
          }

          // Sinkronisasi tinta_detail
          const detail = tinta.tinta_detail || [];
          const existingDetail = await BomTintaDetailModel.findAll({
            where: { id_bom_tinta: tintaModel.id },
            transaction: t,
          });

          const existingDetailIds = existingDetail.map((d) => d.id);
          const incomingDetailIds = detail.filter((d) => d.id).map((d) => d.id);
          const deletedDetailIds = existingDetailIds.filter(
            (eid) => !incomingDetailIds.includes(eid)
          );

          if (deletedDetailIds.length > 0) {
            await BomTintaDetailModel.destroy({
              where: { id: deletedDetailIds },
              transaction: t,
            });
          }

          for (const d of detail) {
            if (d.id) {
              await BomTintaDetailModel.update(d, {
                where: { id: d.id },
                transaction: t,
              });
            } else {
              await BomTintaDetailModel.create(
                { ...d, id_bom_tinta: tintaModel.id },
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

  submitRequestBom: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await BomModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomModel.update(
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

  approveBom: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await BomModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomModel.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_bom: req.user.id,
          tgl_approve_bom: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await BomUserAction.create(
          { id_bom: checkData.id, id_user: req.user.id, status: "approve" },
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

  rejectBom: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await BomModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await BomModel.update(
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
        await BomUserAction.create(
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

module.exports = BomController;
