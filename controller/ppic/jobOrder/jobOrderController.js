const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../../model/produksi/produksiLkhTahapanModel");
const ioMountingModel = require("../../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const SoModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../../model/ppic/jobOrder/joUserActionModel");
const MasterSettingKapasitas = require("../../../model/masterData/ppic/masterKategoriSettingKapasitasModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const soModel = require("../../../model/marketing/so/soModel");
const JadwalProduksiService = require("../jadwalProduksiTiket/service/jadwalProduksiService");

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
    if (status_proses) obj.status_proses = status_proses;
    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_jo = { [Op.between]: [startDate, endDate] };
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
          succes: true,
          status_code: 200,
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
          succes: true,
          status_code: 200,
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
          succes: true,
          status_code: 200,
          data: data,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ succes: false, status_code: 500, msg: error.message });
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
      qty_druk,
      qty_lp,
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
      const checkSo = await SoModel.findByPk(id_so);

      if (!checkSo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data SO tidak ditemukan",
        });

      const dataJobOrder = await JobOrder.create(
        {
          id_io,
          id_so,
          id_customer: checkSo.id_customer,
          id_produk: checkSo.id_produk,
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
          qty_druk,
          qty_lp,
          po_qty,
          spesifikasi,
          keterangan_pengerjaan,
          toleransi,
          alamat_pengiriman,
          tgl_kirim,
          standar_warna,
          tipe_jo,
          label: checkSo.label,
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
            nama_mounting: e.nama_mounting,
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

      //fungsi create tiket jadwal produksi
      const dataSo = await soModel.findByPk(id_so);
      const dataMountingSelected = jo_mounting.find(
        (e) => e.is_selected === true
      );
      const dataIoMountingSelected = await ioMountingModel.findByPk(
        dataMountingSelected.id_io_mounting,
        {
          include: [
            {
              model: IoTahapan,
              as: "tahapan",
            },
          ],
        }
      );

      let dataTahapanMounting = [];

      for (let i = 0; i < dataIoMountingSelected.tahapan.length; i++) {
        //const dataMasterKapasitas = MasterSettingKapasitas.findByPk()
        const e = dataIoMountingSelected.tahapan[i];
        dataTahapanMounting.push({
          tahapan: e.nama_proses,
          tahapan_ke: e.index,
          nama_kategori: e.nama_setting_kapasitas,
          kategori: e.nama_kapasitas, //ini belum ngambil dari mana mana
          kategori_drying_time: e.nama_drying_time,
          mesin: e.nama_mesin,
          kapasitas_per_jam: e.value_kapasitas,
          drying_time: e.value_drying_time,
          setting: e.value_setting,
          toleransi: 0,
        });
      }

      function formatDate(dateStr, locale = "en-GB") {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Jakarta", // pastikan sesuai zona waktu lokal kamu
        });
      }

      // const createTiketJadwal =
      //   await JadwalProduksiService.creteJadwalProduksiService(
      //     produk,
      //     no_jo,
      //     null,
      //     dataSo.no_po_customer,
      //     no_io,
      //     customer,
      //     dataMountingSelected.nama_kertas,
      //     formatDate(tgl_kirim),
      //     formatDate(dataSo.tgl_pembuatan_so),
      //     null,
      //     po_qty || 0,
      //     qty || 0,
      //     qty_druk || 0,
      //     0,
      //     dataTahapanMounting,
      //     dataJobOrder.id,
      //     t
      //   );

      // if (createTiketJadwal.success === false) {
      //   await t.rollback();

      //   return res.status(400).json({
      //     succes: false,
      //     status_code: 400,
      //     msg: createTiketJadwal.msg,
      //   });
      // }

      await t.commit();
      res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successfully",
        data: dataJobOrder,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  updateJobOrder: async (req, res) => {
    const _id = req.params.id; // id bom utama
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
      qty_druk,
      qty_lp,
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
      console.log(jo_mounting);
      const dataJo = await JobOrder.findByPk(_id);
      if (!dataJo)
        return res.status(404).json({ msg: "Data JO tidak ditemukan" });

      await JobOrder.update(
        {
          status_kalkulasi,
          status_jo,
          stok_fg,
          qty,
          qty_druk,
          qty_lp,
          po_qty,
          spesifikasi,
          keterangan_pengerjaan,
          toleransi,
          alamat_pengiriman,
          tgl_kirim,
          standar_warna,
          tipe_jo,
        },
        { where: { id: _id }, transaction: t }
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
            console.log(idField, item[idField]);
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
        for (let i = 0; i < jo_mounting.length; i++) {
          const e = jo_mounting[i];
          await JobOrderMounting.update(
            { is_selected: e.is_selected },
            {
              where: { id: e.id },
              transaction: t,
            }
          );
        }
      }

      await t.commit();
      res
        .status(200)
        .json({ succes: true, status_code: 200, msg: "Update JO berhasil" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
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
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveJobOrder: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await JobOrder.findByPk(_id, {
        include: [
          {
            where: { is_active: true },
            required: false,
            model: JobOrderMounting,
            as: "jo_mounting",
          },
        ],
      });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const ioMounting = await ioMountingModel.findByPk(
        checkData.jo_mounting[0].id_io_mounting,
        {
          include: [
            {
              model: IoTahapan,
              as: "tahapan",
              include: [{ model: MasterTahapanMesin, as: "tahapan_mesin" }],
            },
          ],
        }
      );
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
      for (let i = 0; i < ioMounting.tahapan.length; i++) {
        const e = ioMounting.tahapan[i];
        await ProduksiLkhTahapan.create(
          {
            id_jo: checkData.id,
            id_io: checkData.id_io,
            id_so: checkData.id_so,
            id_customer: checkData.id_customer,
            id_produk: checkData.id_produk,
            id_tahapan: e.tahapan_mesin.id_tahapan,
            index: e.index,
            no_jo: checkData.no_jo,
            no_io: checkData.no_io,
            no_so: checkData.no_so,
            customer: checkData.customer,
            produk: checkData.produk,
            tgl_kirim: checkData.tgl_kirim,
            qty_jo: checkData.qty,
            spesifikasi: checkData.spesifikasi,
            status: e.index == 1 ? "active" : "nonactive",
          },
          { transaction: t }
        );
      }
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      await t.rollback();
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
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = BomController;
