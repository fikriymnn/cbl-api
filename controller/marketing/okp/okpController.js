const { Op } = require("sequelize");
const Okp = require("../../../model/marketing/okp/okpModel");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const OkpProses = require("../../../model/marketing/okp/okpProsesModel");
const OkpActionUser = require("../../../model/marketing/okp/okpUserActionModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const OkpController = {
  getOkp: async (req, res) => {
    const _id = req.params.id;
    const {
      is_active,
      page,
      limit,
      search,
      status,
      status_proses,
      posisi_proses,
      is_io_done,
    } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { no_okp: { [Op.like]: `%${search}%` } },
            { status_okp: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
            { produk: { [Op.like]: `%${search}%` } },
            { status_okp: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (status) obj.status = status;
      if (status_proses) obj.status_proses = status_proses;
      if (posisi_proses) obj.posisi_proses = posisi_proses;
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (is_io_done) obj.is_io_done = is_io_done == "true" ? true : false;
      if (page && limit) {
        const length = await Okp.count({ where: obj });
        const data = await Okp.findAll({
          where: obj,
          include: [
            {
              model: OkpProses,
              as: "okp_proses",
              include: [
                {
                  model: Users,
                  as: "user_desain",
                },
                {
                  model: Users,
                  as: "user_qa",
                },
                {
                  model: Users,
                  as: "user_terima_marketing",
                },
                {
                  model: Users,
                  as: "user_acc_customer",
                },
                {
                  model: Users,
                  as: "user_reject",
                },
              ],
            },
          ],
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
        const response = await Okp.findByPk(_id, {
          include: [
            {
              model: Kalkulasi,
              as: "kalkulasi",
            },
            {
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },
            {
              model: OkpProses,
              as: "okp_proses",
              include: [
                {
                  model: Users,
                  as: "user_desain",
                },
                {
                  model: Users,
                  as: "user_qa",
                },
                {
                  model: Users,
                  as: "user_terima_marketing",
                },
                {
                  model: Users,
                  as: "user_acc_customer",
                },
                {
                  model: Users,
                  as: "user_reject",
                },
              ],
            },
            {
              model: OkpActionUser,
              as: "okp_action_user",
              include: { model: Users, as: "user" },
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await Okp.findAll({
          where: obj,
          include: [
            {
              model: OkpProses,
              as: "okp_proses",
              include: [
                {
                  model: Users,
                  as: "user_desain",
                },
                {
                  model: Users,
                  as: "user_qa",
                },
                {
                  model: Users,
                  as: "user_terima_marketing",
                },
                {
                  model: Users,
                  as: "user_acc_customer",
                },
                {
                  model: Users,
                  as: "user_reject",
                },
              ],
            },
          ],
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

  getOkpJumlahData: async (req, res) => {
    try {
      const length = await Okp.count({
        where: { status_okp: "baru" },
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

  createOkp: async (req, res) => {
    const {
      id_kalkulasi,
      no_okp,
      status_okp,
      tgl_target_marketing,
      jenis_pekerjaan,
      id_pisau,
      file_spek_customer,
      rencana_qty_po,
      rencana_tgl_kirim,
      status_po,
      keterangan_cetak,
      keterangan,
      tahapan,
    } = req.body;
    const t = await db.transaction();
    if (!id_kalkulasi)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kalkulasi wajib di isi!!",
      });
    if (!no_okp)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "no okp wajib di isi!!",
      });

    try {
      const checkKalkulasi = await Kalkulasi.findByPk(id_kalkulasi);

      if (!checkKalkulasi)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data kalkulasi tidak ditemukan",
        });

      if (status_okp == "repeat perubahan") {
        // cek kalkulasi sebelumnya
        const previousKalkulasi = await Kalkulasi.findByPk(
          checkKalkulasi.id_kalkulasi_previous
        );
        if (!previousKalkulasi)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data kalkulasi sebelumnya tidak ditemukan",
          });
        const checkOkpPrevious = await Okp.findByPk(previousKalkulasi.id_okp);

        const response = await Okp.create(
          {
            id_kalkulasi: id_kalkulasi,
            id_okp_previous: checkOkpPrevious.id,
            id_create_okp: req.user.id,
            no_okp: previousKalkulasi.no_okp,
            customer: checkKalkulasi.nama_customer,
            produk: checkKalkulasi.nama_produk,
            status_okp: status_okp,
            tgl_target_marketing: tgl_target_marketing,
            jenis_pekerjaan: jenis_pekerjaan,
            id_pisau: id_pisau,
            file_spek_customer: file_spek_customer,
            rencana_qty_po: rencana_qty_po,
            rencana_tgl_kirim: rencana_tgl_kirim,
            status_po: status_po,
            keterangan_cetak: keterangan_cetak,
            keterangan: keterangan,
            tahapan: tahapan,
          },
          { transaction: t }
        );
        await OkpProses.create({ id_okp: response.id }, { transaction: t });
        await OkpActionUser.create(
          {
            id_okp: response.id,
            id_user: req.user.id,
            status: "create",
          },
          { transaction: t }
        );
        //update kalkulasi untuk id okp dan no okp
        await Kalkulasi.update(
          {
            id_okp: response.id,
            no_okp: response.no_okp,
            is_io_active: false,
            is_okp_done: true,
          },
          { where: { id: id_kalkulasi }, transaction: t }
        );

        await t.commit();
        return res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Create Successful",
          data: response,
        });
      } else {
        const response = await Okp.create(
          {
            id_kalkulasi: id_kalkulasi,
            id_create_okp: req.user.id,
            no_okp: no_okp,
            customer: checkKalkulasi.nama_customer,
            produk: checkKalkulasi.nama_produk,
            status_okp: status_okp,
            tgl_target_marketing: tgl_target_marketing,
            jenis_pekerjaan: jenis_pekerjaan,
            id_pisau: id_pisau,
            file_spek_customer: file_spek_customer,
            rencana_qty_po: rencana_qty_po,
            rencana_tgl_kirim: rencana_tgl_kirim,
            status_po: status_po,
            keterangan_cetak: keterangan_cetak,
            keterangan: keterangan,
            tahapan: tahapan,
          },
          { transaction: t }
        );
        await OkpProses.create({ id_okp: response.id }, { transaction: t });
        await OkpActionUser.create(
          {
            id_okp: response.id,
            id_user: req.user.id,
            status: "create",
          },
          { transaction: t }
        );

        //update kalkulasi untuk id okp dan no okp
        await Kalkulasi.update(
          {
            id_okp: response.id,
            no_okp: response.no_okp,
            is_io_active: false,
            is_okp_done: true,
          },
          { where: { id: id_kalkulasi }, transaction: t }
        );
        await t.commit();
        return res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Create Successful",
          data: response,
        });
      }
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateOkp: async (req, res) => {
    const _id = req.params.id;
    const {
      id_kalkulasi,
      status_okp,
      tgl_target_marketing,
      jenis_pekerjaan,
      id_pisau,
      file_spek_customer,
      rencana_qty_po,
      rencana_tgl_kirim,
      status_po,
      keterangan_cetak,
      keterangan,
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
      if (status_okp) obj.status_okp = status_okp;
      if (tgl_target_marketing) obj.tgl_target_marketing = tgl_target_marketing;
      if (jenis_pekerjaan) obj.jenis_pekerjaan = jenis_pekerjaan;
      if (id_pisau) obj.id_pisau = id_pisau;
      if (file_spek_customer) obj.file_spek_customer = file_spek_customer;
      if (rencana_qty_po) obj.rencana_qty_po = rencana_qty_po;
      if (rencana_tgl_kirim) obj.rencana_tgl_kirim = rencana_tgl_kirim;
      if (status_po) obj.status_po = status_po;
      if (keterangan_cetak) obj.keterangan_cetak = keterangan_cetak;
      if (keterangan) obj.keterangan = keterangan;
      if (tahapan) obj.tahapan = tahapan;
      const checkData = await Okp.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Okp.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await OkpActionUser.create(
        { id_okp: checkData.id, id_user: req.user.id, status: "update" },
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

  actionProsesTanggalOkp: async (req, res) => {
    const _id = req.params.id;
    const {
      bagian,
      id_pisau,
      tgl_okp_desain,
      tgl_terima_qa,
      tgl_terima_marketing,
      tgl_acc_customer,
      note_okp_desain,
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
      const checkData = await OkpProses.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      if (bagian == "desain") {
        objProses.id_user_desain = req.user.id;
        objProses.tgl_okp_desain = tgl_okp_desain;
        objProses.note_okp_desain = note_okp_desain;

        obj.status_proses = "request qa";
        obj.posisi_proses = "qa";
        obj.id_pisau = id_pisau;
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
      await OkpProses.update(objProses, {
        where: { id: _id },
        transaction: t,
      }),
        await Okp.update(obj, {
          where: { id: checkData.id_okp },
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

  rejectProsesTanggalOkp: async (req, res) => {
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
      const checkData = await OkpProses.findByPk(_id);
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
      await OkpProses.update(objProses, {
        where: { id: _id },
        transaction: t,
      }),
        // buat ulang proses baru
        await OkpProses.create(
          {
            id_okp: checkData.id_okp,
          },
          { transaction: t }
        );
      await Okp.update(obj, {
        where: { id: checkData.id_okp },
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

  approveOkp: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await Okp.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const checkKalkulasi = await Kalkulasi.findByPk(checkData.id_kalkulasi);

      // cek kalkulasi sebelumnya
      const previousKalkulasi = await Kalkulasi.findByPk(
        checkKalkulasi.id_kalkulasi_previous
      );

      if (previousKalkulasi) {
        const checkOkpPrevious = await Okp.findByPk(previousKalkulasi.id_okp);
        await Okp.update(
          {
            is_active: false,
          },
          {
            where: { id: checkOkpPrevious.id, is_active: true },
            transaction: t,
          }
        );
      }

      await Okp.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_okp: req.user.id,
          tgl_approve_okp: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await OkpActionUser.create(
          { id_okp: checkData.id, id_user: req.user.id, status: "approve" },
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

  rejectOkp: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await Okp.findByPk(_id, {
        include: { OkpProses, as: "okp_proses", where: { status: "active" } },
      });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Okp.update(
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
        await OkpProses.update(
          {
            id_user_reject: req.user.id,
            tgl_reject: new Date(),
            bagian_reject: "kabag",
            note_reject: note_reject,
            status: "non active",
          },
          { where: { id: checkData.okp_proses[0].id }, transaction: t }
        );

      //kemudian di buat lagi untuk proses pengajuan tanggal nya
      await OkpProses.create(
        {
          id_okp: _id,
        },
        { transaction: t }
      );

      await OkpActionUser.create(
        { id_okp: checkData.id, id_user: req.user.id, status: "kabag reject" },
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

  deleteOkp: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await Okp.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Okp.update(
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

module.exports = OkpController;
