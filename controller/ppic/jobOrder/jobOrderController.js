const { Op, Sequelize, where } = require("sequelize");
const SoModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const soModel = require("../../../model/marketing/so/soModel");

const BomController = {
  getJobOrder: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, status, status_proses, search } =
      req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
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
        const length = await JobOrder.count({ where: obj });
        const data = await JobOrder.findAll({
          order: [["tgl_pembuatan_jo", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: JobOrderMounting,
              as: "jo_mounting",
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
        const data = await JobOrder.findByPk(_id, {
          include: [
            {
              model: JobOrderMounting,
              as: "jo_mounting",
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
        const data = await JobOrder.findAll({
          order: [["tgl_pembuatan_jo", "DESC"]],
          include: [
            {
              model: JobOrderMounting,
              as: "jo_mounting",
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

  getJobOrderJumlahData: async (req, res) => {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini
      const length = await JobOrder.count({
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

  createJobOrder: async (req, res) => {
    const {
      id_io,
      id_so,
      id_customer,
      id_produk,
      no_jo,
      no_io,
      no_so,
      customer,
      produk,
      status_kalkulasi,
      status_jo,
      stok_fg,
      qty,
      po_qty,
      spesifikasi,
      keterangan_pengerjaan,
      toleransi,
      alamat_pengiriman,
      tgl_kirim,
      standar_warna,
      tipe_jo,
      jo_mounting,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataJobOrder = await JobOrder.create(
        {
          id_io,
          id_so,
          id_customer,
          id_produk,
          id_create_jo: req.user.id,
          no_jo,
          no_io,
          no_so,
          customer,
          produk,
          status_kalkulasi,
          status_jo,
          stok_fg,
          qty,
          po_qty,
          spesifikasi,
          keterangan_pengerjaan,
          toleransi,
          alamat_pengiriman,
          tgl_kirim,
          standar_warna,
          tipe_jo,
        },
        { transaction: t }
      );

      if (jo_mounting && jo_mounting.length > 0) {
        let dataJoMounting = [];
        for (let i = 0; i < jo_mounting.length; i++) {
          const e = jo_mounting[i];
          dataJoMounting.push({
            id_jo: dataJobOrder.id,
            id_io_mounting: e.id_io_mounting,
            id_kertas: e.id_kertas,
            nama_kertas: e.nama_kertas,
            gramature_kertas: e.gramature_kertas,
            panjang_kertas: e.panjang_kertas,
            lebar_kertas: e.lebar_kertas,
            jumlah_kertas: e.jumlah_kertas,
            ukuran_cetak_panjang_1: e.ukuran_cetak_panjang_1,
            ukuran_cetak_lebar_1: e.ukuran_cetak_lebar_1,
            ukuran_cetak_bagian_1: e.ukuran_cetak_bagian_1,
            ukuran_cetak_isi_1: e.ukuran_cetak_isi_1,
            jumlah_cetak_1: e.jumlah_cetak_1,
            tambahan_insheet_1: e.tambahan_insheet_1,
            ukuran_cetak_panjang_2: e.ukuran_cetak_panjang_2,
            ukuran_cetak_lebar_2: e.ukuran_cetak_lebar_2,
            ukuran_cetak_bagian_2: e.ukuran_cetak_bagian_2,
            ukuran_cetak_isi_2: e.ukuran_cetak_isi_2,
            jumlah_cetak_2: e.jumlah_cetak_2,
            tambahan_insheet_2: e.tambahan_insheet_2,
            jumlah_druk_cetak: e.jumlah_druk_cetak,
            jumlah_insheet_cetak: e.jumlah_insheet_cetak,
            jumlah_druk_pond: e.jumlah_druk_pond,
            jumlah_insheet_pond: e.jumlah_insheet_pond,
            jumlah_druk_finishing: e.jumlah_druk_finishing,
            jumlah_insheet_finishing: e.jumlah_insheet_finishing,
            total_insheet: e.total_insheet,
            is_selected: e.is_selected,
          });
        }

        await JobOrderMounting.bulkCreate(dataJoMounting, { transaction: t });
      }

      await SoModel.update(
        { is_jo_done: true },
        { where: { id: id_so }, transaction: t }
      );

      await t.commit();
      res.status(200).json({
        msg: "Create Successfully",
        data: dataJobOrder,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateJobOrder: async (req, res) => {
    const { id } = req.params; // id bom utama
    const {
      id_io,
      id_so,
      id_customer,
      id_produk,
      no_jo,
      no_io,
      no_so,
      customer,
      produk,
      tgl_pembuatan_jo,
      status_kalkulasi,
      status_jo,
      stok_fg,
      qty,
      po_qty,
      spesifikasi,
      keterangan_pengerjaan,
      toleransi,
      alamat_pengiriman,
      tgl_kirim,
      standar_warna,
      tipe_jo,
      jo_mounting,
    } = req.body;

    const t = await db.transaction();
    try {
      // Update BOM utama
      const dataJo = await JobOrder.findByPk(id);
      if (!dataJo)
        return res.status(404).json({ msg: "Data JO tidak ditemukan" });

      await JobOrder.update(
        {
          status_kalkulasi,
          status_jo,
          stok_fg,
          qty,
          po_qty,
          spesifikasi,
          keterangan_pengerjaan,
          toleransi,
          alamat_pengiriman,
          tgl_kirim,
          standar_warna,
          tipe_jo,
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
      if (jo_mounting) {
        await syncChild(JobOrderMounting, "jo_mounting", "id_jo", jo_mounting);
      }

      await t.commit();
      res.status(200).json({ msg: "Update JO berhasil" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  submitRequestJobOrder: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await JobOrder.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await JobOrder.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await JobOrderUserAction.create(
          { id_jo: checkData.id, id_user: req.user.id, status: "requested" },
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

  approveJobOrder: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await JobOrder.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await JobOrder.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_jo: req.user.id,
          tgl_approve_jo: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await JobOrderUserAction.create(
          { id_jo: checkData.id, id_user: req.user.id, status: "approve" },
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

  rejectJobOrder: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await JobOrder.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await JobOrder.update(
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
        await JobOrderUserAction.create(
          {
            id_jo: checkData.id,
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
