const { Op } = require("sequelize");
const Io = require("../../../model/marketing/io/ioModel");
const IoMounting = require("../../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../../model/marketing/io/ioTahapanModel");
const IoUserAction = require("../../../model/marketing/io/ioActionActionModel");
const Okp = require("../../../model/marketing/okp/okpModel");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const IoController = {
  getIo: async (req, res) => {
    const _id = req.params.id;
    const {
      is_active = true,
      page,
      limit,
      search,
      status,
      status_proses,
      status_send_proof,
    } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { no_io: { [Op.like]: `%${search}%` } },
            { status_Io: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
            { produk: { [Op.like]: `%${search}%` } },
            { status_io: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (status) obj.status = status;
      if (status_proses) obj.status_proses = status_proses;
      if (status_send_proof) obj.status_send_proof = status_send_proof;
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await Io.count({ where: obj });
        const data = await Io.findAll({
          where: obj,

          offset: parseInt(offset),
          limit: parseInt(limit),
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await Io.findByPk(_id, {
          include: [
            // {
            //   model: Okp,
            //   as: "okp",
            //   attributes:["id","id_kalkulasi"],
            //   include:[
            //     {
            //         model:Kalkulasi,
            //         as:"kalkulasi"
            //     }
            //   ]
            // },
            {
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },
            {
              model: IoMounting,
              as: "io_mounting",
            },
            {
              model: IoUserAction,
              as: "io_action_user",
              include: { model: Users, as: "user" },
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await Io.findAll({
          where: obj,
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createIo: async (req, res) => {
    const {
      id_okp,
      no_io,
      status_Io,
      tgl_target_marketing,
      jenis_pekerjaan,
      id_pisau,
      file_spek_customer,
      rencana_qty_po,
      rencana_tgl_kirim,
      status_po,
      keterangan_cetak,
      tahapan,
    } = req.body;
    const t = await db.transaction();
    if (!id_okp)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "okp wajib di isi!!",
      });
    if (!no_io)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "no Io wajib di isi!!",
      });

    try {
      const checkOkp = await Okp.findByPk(id_okp);
      if (!checkOkp)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Okp tidak ditemukan",
        });
      const checkKalkulasi = await Kalkulasi.findByPk(checkOkp.id_kalkulasi);
      if (!checkKalkulasi)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Kalkulasi tidak ditemukan",
        });
      const response = await Io.create(
        {
          id_okp: id_okp,
          id_create_Io: req.user.id,
          no_io: no_io,
          customer: checkOkp.nama_customer,
          produk: checkOkp.nama_produk,
          status_Io: status_Io,
        },
        { transaction: t }
      );

      await IoMounting.create(
        {
          id_io: response.id,
          nama_mounting: "A",
          format_data: "CTP",
          ukuran_jadi_panjang: checkKalkulasi.ukuran_jadi_panjang,
          ukuran_jadi_lebar: checkKalkulasi.ukuran_jadi_lebar,
          ukuran_jadi_tinggi: checkKalkulasi.ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: checkKalkulasi.ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: checkKalkulasi.ukuran_jadi_terb_lebar,
          warna_depan: checkKalkulasi.warna_depan,
          warna_belakang: checkKalkulasi.warna_belakang,
          jumlah_warna: checkKalkulasi.jumlah_warna,
          id_coating_depan: checkKalkulasi.id_coating_depan,
          nama_coating_depan: checkKalkulasi.nama_coating_depan,
          id_coating_belakang: checkKalkulasi.id_coating_belakang,
          nama_coating_belakang: checkKalkulasi.nama_coating_belakang,
          jenis_kertas: checkKalkulasi.jenis_kertas,
          id_kertas: checkKalkulasi.id_kertas,
          nama_kertas: checkKalkulasi.nama_kertas,
          gramature_kertas: checkKalkulasi.gramature_kertas,
          panjang_plano: checkKalkulasi.panjang_kertas,
          lebar_plano: checkKalkulasi.lebar_kertas,
          ukuran_cetak_panjang_1: checkKalkulasi.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: checkKalkulasi.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: checkKalkulasi.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: checkKalkulasi.ukuran_cetak_isi_1,
          ukuran_cetak_panjang_2: checkKalkulasi.ukuran_cetak_panjang_2,
          ukuran_cetak_lebar_2: checkKalkulasi.ukuran_cetak_lebar_2,
          ukuran_cetak_bagian_2: checkKalkulasi.ukuran_cetak_bagian_2,
          ukuran_cetak_isi_2: checkKalkulasi.ukuran_cetak_isi_2,
          id_jenis_pons: checkKalkulasi.id_jenis_pons,
          nama_jenis_pons: checkKalkulasi.nama_jenis_pons,
          id_lem: checkKalkulasi.id_lem,
          nama_lem: checkKalkulasi.nama_lem,
        },
        { transaction: t }
      );

      //proses default tahapan
      //default potong
      if (checkKalkulasi.id_mesin_potong) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          id_mesin_potong,
          {
            include: [
              {
                model: MasterMesinTahapan,
                as: "mesin",
              },
              { model: MasterTahapan, as: "tahapan" },
            ],
          }
        );
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin potong tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 1,
          },
          { transaction: t }
        );
      }

      //default coating
      if (checkKalkulasi.id_mesin_coating_depan) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          id_mesin_coating_depan,
          {
            include: [
              {
                model: MasterMesinTahapan,
                as: "mesin",
              },
              { model: MasterTahapan, as: "tahapan" },
            ],
          }
        );
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin coating tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 2,
          },
          { transaction: t }
        );
      }

      //default pond
      if (checkKalkulasi.id_mesin_pons) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(id_mesin_pons, {
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
        });
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin pond tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 3,
          },
          { transaction: t }
        );
      }

      //default pond
      if (checkKalkulasi.id_mesin_pons) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(id_mesin_pons, {
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
        });
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin pond tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 4,
          },
          { transaction: t }
        );
      }

      //default lipat
      if (checkKalkulasi.id_mesin_lipat) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(id_mesin_lipat, {
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
        });
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin pond tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 5,
          },
          { transaction: t }
        );
      }

      //default finishing
      if (checkKalkulasi.id_mesin_finishing) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          id_mesin_finishing,
          {
            include: [
              {
                model: MasterMesinTahapan,
                as: "mesin",
              },
              { model: MasterTahapan, as: "tahapan" },
            ],
          }
        );
        if (!tahapanMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan mesin pond tidak ditemukan",
          });
        await IoTahapan.create(
          {
            id_io: response.id,
            id_tahapan_mesin: id_mesin_potong,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 5,
          },
          { transaction: t }
        );
      }

      await IoUserAction.create(
        {
          id_Io: response.id,
          id_user: req.user.id,
          status: "create",
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateIo: async (req, res) => {
    const _id = req.params.id;
    const {
      id_kalkulasi,
      status_Io,
      tgl_target_marketing,
      jenis_pekerjaan,
      id_pisau,
      file_spek_customer,
      rencana_qty_po,
      rencana_tgl_kirim,
      status_po,
      keterangan_cetak,
      tahapan,
    } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (id_kalkulasi) {
        const checkKalkulasi = await Kalkulasi.findByPk(id_kalkulasi);
        if (!checkKalkulasi)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data kalkulasi tidak ditemukan",
          });
        obj.id_kalkulasi = id_kalkulasi;
        obj.customer = checkKalkulasi.nama_customer;
        obj.produk = checkKalkulasi.nama_produk;
      }
      if (status_Io) obj.status_Io = status_Io;
      if (tgl_target_marketing) obj.tgl_target_marketing = tgl_target_marketing;
      if (jenis_pekerjaan) obj.jenis_pekerjaan = jenis_pekerjaan;
      if (id_pisau) obj.id_pisau = id_pisau;
      if (file_spek_customer) obj.file_spek_customer = file_spek_customer;
      if (rencana_qty_po) obj.rencana_qty_po = rencana_qty_po;
      if (rencana_tgl_kirim) obj.rencana_tgl_kirim = rencana_tgl_kirim;
      if (status_po) obj.status_po = status_po;
      if (keterangan_cetak) obj.keterangan_cetak = keterangan_cetak;
      if (tahapan) obj.tahapan = tahapan;
      const checkData = await Io.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Io.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await IoActionUser.create(
        { id_Io: checkData.id, id_user: req.user.id, status: "update" },
        { transaction: t }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  actionProsesTanggalIo: async (req, res) => {
    const _id = req.params.id;
    const {
      bagian,
      tgl_Io_desain,
      tgl_terima_qa,
      tgl_terima_marketing,
      tgl_acc_customer,
      note_Io_desain,
      note_terima_qa,
      note_terima_marketing,
      note_acc_customer,
    } = req.body;
    const t = await db.transaction();
    try {
      let obj = {};
      let objProses = {};
      if (!bagian)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "bagian wajib di isi",
        });
      const checkData = await IoProses.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      if (bagian == "desain") {
        objProses.id_user_desain = req.user.id;
        objProses.tgl_Io_desain = tgl_Io_desain;
        objProses.note_Io_desain = note_Io_desain;

        obj.status_proses = "request qa";
        obj.posisi_proses = "qa";
      } else if (bagian == "qa") {
        objProses.id_user_qa = req.user.id;
        objProses.tgl_terima_qa = tgl_terima_qa;
        objProses.note_terima_qa = note_terima_qa;

        obj.status_proses = "request marketing";
        obj.posisi_proses = "marketing";
      } else if (bagian == "marketing") {
        objProses.id_user_terima_marketing = req.user.id;
        objProses.tgl_terima_marketing = tgl_terima_marketing;
        objProses.note_terima_marketing = note_terima_marketing;

        obj.status_proses = "request acc customer";
        obj.posisi_proses = "customer";
      } else if (bagian == "customer") {
        objProses.id_acc_customer = req.user.id;
        objProses.tgl_acc_customer = tgl_acc_customer;
        objProses.note_acc_customer = note_acc_customer;

        obj.status_proses = "request approval kabag";
        obj.posisi_proses = "kabag";
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Bagian tidak cocok dengan backend",
        });
      }
      await IoProses.update(objProses, {
        where: { id: _id },
        transaction: t,
      }),
        await Io.update(obj, {
          where: { id: checkData.id_Io },
          transaction: t,
        }),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Action Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  rejectProsesTanggalIo: async (req, res) => {
    const _id = req.params.id;
    const { bagian, note_reject } = req.body;
    const t = await db.transaction();
    try {
      let obj = {};
      let objProses = {};
      if (!bagian)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "bagian wajib di isi",
        });
      const checkData = await IoProses.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      if (bagian == "desain") {
        objProses.id_user_reject = req.user.id;
        objProses.tgl_reject = new Date();
        objProses.bagian_reject = bagian;
        objProses.note_reject = note_reject;
        objProses.status = "non active";

        obj.status_proses = "reject desain";
        obj.posisi_proses = "desain";
        obj.note_reject = note_reject;
      } else if (bagian == "qa") {
        objProses.id_user_reject = req.user.id;
        objProses.tgl_reject = new Date();
        objProses.bagian_reject = bagian;
        objProses.note_reject = note_reject;
        objProses.status = "non active";

        obj.status_proses = "reject qa";
        obj.posisi_proses = "desain";
        obj.note_reject = note_reject;
      } else if (bagian == "marketing") {
        objProses.id_user_reject = req.user.id;
        objProses.tgl_reject = new Date();
        objProses.bagian_reject = bagian;
        objProses.note_reject = note_reject;
        objProses.status = "non active";

        obj.status_proses = "reject marketing";
        obj.posisi_proses = "desain";
        obj.note_reject = note_reject;
      } else if (bagian == "customer") {
        objProses.id_user_reject = req.user.id;
        objProses.tgl_reject = new Date();
        objProses.bagian_reject = bagian;
        objProses.note_reject = note_reject;
        objProses.status = "non active";

        obj.status_proses = "reject customer";
        obj.posisi_proses = "desain";
        obj.note_reject = note_reject;
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Bagian tidak cocok dengan backend",
        });
      }

      //update reject proses
      await IoProses.update(objProses, {
        where: { id: _id },
        transaction: t,
      }),
        // buat ulang proses baru
        await IoProses.create(
          {
            id_Io: checkData.id_Io,
          },
          { transaction: t }
        );
      await Io.update(obj, {
        where: { id: checkData.id_Io },
        transaction: t,
      }),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Reject Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveIo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await Io.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Io.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_Io: req.user.id,
          tgl_approve_Io: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoActionUser.create(
          { id_Io: checkData.id, id_user: req.user.id, status: "approve" },
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

  rejectIo: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await Io.findByPk(_id, {
        include: { IoProses, as: "Io_proses", where: { status: "active" } },
      });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Io.update(
        {
          status_proses: "reject kabag",
          posisi_proses: "desain",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        //setelah reject proses pengajuan tanggal di reject juga
        await IoProses.update(
          {
            id_user_reject: req.user.id,
            tgl_reject: new Date(),
            bagian_reject: "kabag",
            note_reject: note_reject,
            status: "non active",
          },
          { where: { id: checkData.Io_proses[0].id }, transaction: t }
        );

      //kemudian di buat lagi untuk proses pengajuan tanggal nya
      await IoProses.create(
        {
          id_Io: _id,
        },
        { transaction: t }
      );

      await IoActionUser.create(
        { id_Io: checkData.id, id_user: req.user.id, status: "kabag reject" },
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

  deleteIo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await Io.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Io.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = IoController;
