const { Op, fn, col, literal } = require("sequelize");
const BomModel = require("../../../model/ppic/bom/bomModel");
const BomPpicModel = require("../../../model/ppic/bomPpic/bomPpicModel");
const BomKertasModel = require("../../../model/ppic/bom/bomKertasModel");
const BomTintaModel = require("../../../model/ppic/bom/bomTintaModel");
const BomTintaDetailModel = require("../../../model/ppic/bom/bomTintaDetailModel");
const BomCorrugatedModel = require("../../../model/ppic/bom/bomCorrugatedModel");
const BomPolibanModel = require("../../../model/ppic/bom/bomPolibanModel");
const BomCoatingModel = require("../../../model/ppic/bom/bomCoatingModel");
const BomLemModel = require("../../../model/ppic/bom/bomLemModel");
const BomLainLain = require("../../../model/ppic/bom/bomLainLainModel");
const BomUserAction = require("../../../model/ppic/bom/bomUserActionModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const soModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");

const BomController = {
  getBomModel: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      is_bom_ppic_done,
      is_active,
      status,
      status_proses,
      search,
    } = req.query;
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
    if (is_active) obj.is_active = is_active == "true" ? true : false;
    if (is_bom_ppic_done)
      obj.is_bom_ppic_done = is_bom_ppic_done == "true" ? true : false;
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
          include: [
            {
              model: BomPpicModel,
              as: "bom_ppic",
            },
          ],
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
              model: BomLainLain,
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
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await BomModel.findAll({
          order: [["tgl_pembuatan_bom", "DESC"]],
          include: [
            {
              model: BomPpicModel,
              as: "bom_ppic",
            },
          ],
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

  getBomJumlahData: async (req, res) => {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini
      const length = await BomModel.count({
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
      lain_lain,
    } = req.body;
    const t = await db.transaction();

    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      //get data untuk no bom
      const lastdataBom = await BomModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SDP00001/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_bom, 4), '/', 1) AS UNSIGNED)`,
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
      let nextNumberBom = 1;
      if (lastdataBom) {
        const lastNo = lastdataBom.no_bom; // contoh: "BM-00001/09/25"

        // Ambil "00001" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumberBom = lastSeq + 1;
      }
      const paddedNumberBom = String(nextNumberBom).padStart(4, "0");
      const newBomNumber = `BM-${paddedNumberBom}/${currentMonth}/${shortYear}`;

      //cek apakah sudah punya jo
      let idJo = null;
      let noJo = null;
      let checkJo = null;
      if (id_so) {
        checkJo = await JobOrder.findOne({
          where: { id_so: id_so, is_active: true },
        });
      }

      if (checkJo) {
        idJo = checkJo.id;
        noJo = checkJo.no_jo;
      }

      const dataBomModel = await BomModel.create(
        {
          id_jo: idJo,
          id_io,
          id_so,
          id_io_mounting,
          id_create_bom: req.user.id,
          nama_mounting,
          no_jo: noJo,
          no_bom: newBomNumber,
          no_io,
          no_so,
          customer,
          produk,
        },
        { transaction: t },
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
            { transaction: t },
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
                qty_tinta_detail: e.qty_tinta_detail,
              },
              { transaction: t },
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
            id_coating: e.id_coating,
            nama_coating: e.nama_coating,
            tipe_coating: e.tipe_coating,
            rumus_coating: e.rumus_coating,
            qty_coating: e.qty_coating,
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
            qty_lem: e.qty_lem,
            tipe: e.tipe,
            is_selected: e.is_selected,
          });
        }
        await BomLemModel.bulkCreate(dataBomLem, {
          transaction: t,
        });
      }

      if (lain_lain && lain_lain.length > 0) {
        let dataBomLainLain = [];
        for (let i = 0; i < lain_lain.length; i++) {
          const e = lain_lain[i];
          dataBomLainLain.push({
            id_bom: dataBomModel.id,
            nama_item: e.nama_item,
            qty: e.qty,
          });
        }
        await BomLainLain.bulkCreate(dataBomLainLain, {
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
      lain_lain,
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
        { transaction: t },
      );

      // === Fungsi util untuk update child ===
      async function syncChild(
        model,
        tableName,
        foreignKey,
        newData,
        idField = "id",
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
          (eid) => !incomingIds.includes(eid),
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
          bom_corrugated,
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
      if (lain_lain) {
        await syncChild(BomLainLain, "lain_lain", "id_bom", lain_lain);
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
          (eid) => !incomingTintaIds.includes(eid),
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
              { transaction: t },
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
            (eid) => !incomingDetailIds.includes(eid),
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
                { transaction: t },
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
      (await BomModel.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await BomUserAction.create(
          { id_bom: checkData.id, id_user: req.user.id, status: "requested" },
          { transaction: t },
        ));
      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Request Successful" }));
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
      const checkBomPpic = await BomPpicModel.findOne({
        where: { id_bom: _id, is_active: true },
        transaction: t,
      });
      (await BomModel.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_bom: req.user.id,
          tgl_approve_bom: new Date(),
          is_bom_ppic_done: false,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await soModel.update(
          { is_bom_done: true },
          { where: { id: checkData.id_so } },
          { transaction: t },
        ));
      await BomUserAction.create(
        { id_bom: checkData.id, id_user: req.user.id, status: "approve" },
        { transaction: t },
      );

      if (checkBomPpic) {
        await BomPpicModel.update(
          {
            status_proses: "draft",
          },
          {
            where: { id: checkBomPpic.id },
            transaction: t,
          },
        );
      }

      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" }));
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
      (await BomModel.update(
        {
          status_proses: "reject kabag",
          status: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await BomUserAction.create(
          {
            id_bom: checkData.id,
            id_user: req.user.id,
            status: "kabag reject",
          },
          { transaction: t },
        ));
      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "reject Successful" }));
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = BomController;
