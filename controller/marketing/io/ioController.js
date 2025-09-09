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
              include: [
                {
                  model: IoTahapan,
                  as: "tahapan",
                },
              ],
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
    const { id_okp, no_io, status_io, is_revisi, revisi_no_io } = req.body;
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
          id_create_io: req.user.id,
          no_io: no_io,
          customer: checkOkp.customer,
          produk: checkOkp.produk,
          status_io: status_io,
          is_revisi: is_revisi,
          revisi_no_io: revisi_no_io,
        },
        { transaction: t }
      );

      const dataMounting = await IoMounting.create(
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
          checkKalkulasi.id_mesin_potong,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_potong,
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
          checkKalkulasi.id_mesin_coating_depan,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_coating_depan,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 2,
          },
          { transaction: t }
        );
      }

      //default pond
      if (checkKalkulasi.id_mesin_pons) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          checkKalkulasi.id_mesin_pons,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_pons,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 3,
          },
          { transaction: t }
        );
      }

      //default pond
      if (checkKalkulasi.id_mesin_pons) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          checkKalkulasi.id_mesin_pons,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_pons,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 4,
          },
          { transaction: t }
        );
      }

      //default lipat
      if (checkKalkulasi.id_mesin_lipat) {
        const tahapanMesin = await MasterTahapanMesin.findByPk(
          checkKalkulasi.id_mesin_lipat,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_lipat,
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
          checkKalkulasi.id_mesin_finishing,
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
            id_io_mounting: dataMounting.id,
            id_tahapan_mesin: checkKalkulasi.id_mesin_finishing,
            nama_proses: tahapanMesin.tahapan.nama_tahapan,
            nama_mesin: tahapanMesin.mesin.nama_mesin,
            index: 5,
          },
          { transaction: t }
        );
      }

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
    const { id_okp, no_io, is_revisi, revisi_no_io, status_io } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      let objMounting = {};
      if (id_okp) {
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
            msg: "Data kalkulasi tidak ditemukan",
          });
        obj.id_okp = id_okp;
        obj.customer = checkOkp.nama_customer;
        obj.produk = checkOkp.nama_produk;

        objMounting.ukuran_jadi_panjang = checkKalkulasi.ukuran_jadi_panjang;
        objMounting.ukuran_jadi_lebar = checkKalkulasi.ukuran_jadi_lebar;
        objMounting.ukuran_jadi_tinggi = checkKalkulasi.ukuran_jadi_tinggi;
        objMounting.ukuran_jadi_terb_panjang =
          checkKalkulasi.ukuran_jadi_terb_panjang;
        objMounting.ukuran_jadi_terb_lebar =
          checkKalkulasi.ukuran_jadi_terb_lebar;
        objMounting.warna_depan = checkKalkulasi.warna_depan;
        objMounting.warna_belakang = checkKalkulasi.warna_belakang;
        objMounting.jumlah_warna = checkKalkulasi.jumlah_warna;
        objMounting.id_coating_depan = checkKalkulasi.id_coating_depan;
        objMounting.nama_coating_depan = checkKalkulasi.nama_coating_depan;
        objMounting.id_coating_belakang = checkKalkulasi.id_coating_belakang;
        objMounting.nama_coating_belakang =
          checkKalkulasi.nama_coating_belakang;
        objMounting.jenis_kertas = checkKalkulasi.jenis_kertas;
        objMounting.id_kertas = checkKalkulasi.id_kertas;
        objMounting.nama_kertas = checkKalkulasi.nama_kertas;
        objMounting.gramature_kertas = checkKalkulasi.gramature_kertas;
        objMounting.panjang_plano = checkKalkulasi.panjang_kertas;
        objMounting.lebar_plano = checkKalkulasi.lebar_kertas;
        objMounting.ukuran_cetak_panjang_1 =
          checkKalkulasi.ukuran_cetak_panjang_1;
        objMounting.ukuran_cetak_lebar_1 = checkKalkulasi.ukuran_cetak_lebar_1;
        objMounting.ukuran_cetak_bagian_1 =
          checkKalkulasi.ukuran_cetak_bagian_1;
        objMounting.ukuran_cetak_isi_1 = checkKalkulasi.ukuran_cetak_isi_1;
        objMounting.ukuran_cetak_panjang_2 =
          checkKalkulasi.ukuran_cetak_panjang_2;
        objMounting.ukuran_cetak_lebar_2 = checkKalkulasi.ukuran_cetak_lebar_2;
        objMounting.ukuran_cetak_bagian_2 =
          checkKalkulasi.ukuran_cetak_bagian_2;
        objMounting.ukuran_cetak_isi_2 = checkKalkulasi.ukuran_cetak_isi_2;
        objMounting.id_jenis_pons = checkKalkulasi.id_jenis_pons;
        objMounting.nama_jenis_pons = checkKalkulasi.nama_jenis_pons;
        objMounting.id_lem = checkKalkulasi.id_lem;
        objMounting.nama_lem = checkKalkulasi.nama_lem;
      }
      if (no_io) obj.no_io = no_io;
      if (is_revisi) obj.is_revisi = is_revisi;
      if (revisi_no_io) obj.revisi_no_io = revisi_no_io;
      if (status_io) obj.status_io = status_io;

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

      await IoMounting.update(objMounting, {
        where: { id_io: checkData.id },
        transaction: t,
      });
      await IoUserAction.create(
        { id_io: checkData.id, id_user: req.user.id, status: "update" },
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

  submitRequestIo: async (req, res) => {
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
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "submited" },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Submit Successful" });
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
          id_approve_io: req.user.id,
          tgl_approve_io: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "approve" },
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
          posisi_proses: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "kabag reject" },
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

  createMountingIo: async (req, res) => {
    const _id = req.params.id;
    const { nama_mounting } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await IoMounting.findAll({ where: { id_io: _id } });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const checkDataTahapan = await IoTahapan.findAll({
        where: { id_mounting: checkData.id },
      });

      const dataLastMounting = checkData.reduce((prev, current) =>
        prev.nama_mounting > current.nama_mounting ? prev : current
      );

      await IoMounting.create(
        {
          id_io: _id,
          nama_mounting: nama_mounting,
          keterangan_revisi: dataLastMounting.keterangan_revisi,
          ukuran_jadi_panjang: dataLastMounting.ukuran_jadi_panjang,
          ukuran_jadi_lebar: dataLastMounting.ukuran_jadi_lebar,
          ukuran_jadi_tinggi: dataLastMounting.ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: dataLastMounting.ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: dataLastMounting.ukuran_jadi_terb_lebar,
          warna_depan: dataLastMounting.warna_depan,
          warna_belakang: dataLastMounting.warna_belakang,
          jumlah_warna: dataLastMounting.jumlah_warna,
          keterangan_warna_depan: dataLastMounting.keterangan_warna_depan,
          keterangan_warna_belakang: dataLastMounting.keterangan_warna_belakang,
          id_coating_depan: dataLastMounting.id_coating_depan,
          nama_coating_depan: dataLastMounting.nama_coating_depan,
          merk_coating_depan: dataLastMounting.merk_coating_depan,
          id_coating_belakang: dataLastMounting.id_coating_belakang,
          nama_coating_belakang: dataLastMounting.nama_coating_belakang,
          merk_coating_belakang: dataLastMounting.merk_coating_belakang,
          merk_serat_kertas: dataLastMounting.merk_serat_kertas,
          jenis_kertas: dataLastMounting.jenis_kertas,
          id_kertas: dataLastMounting.id_kertas,
          nama_kertas: dataLastMounting.nama_kertas,
          gramature_kertas: dataLastMounting.gramature_kertas,
          panjang_plano: dataLastMounting.panjang_plano,
          lebar_plano: dataLastMounting.lebar_plano,
          panjang_layout: dataLastMounting.panjang_layout,
          lebar_layout: dataLastMounting.lebar_layout,
          ukuran_cetak_panjang_1: dataLastMounting.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: dataLastMounting.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: dataLastMounting.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: dataLastMounting.ukuran_cetak_isi_1,
          ukuran_cetak_panjang_2: dataLastMounting.ukuran_cetak_panjang_2,
          ukuran_cetak_lebar_2: dataLastMounting.ukuran_cetak_lebar_2,
          ukuran_cetak_bagian_2: dataLastMounting.ukuran_cetak_bagian_2,
          ukuran_cetak_isi_2: dataLastMounting.ukuran_cetak_isi_2,
          id_layout: dataLastMounting.id_layout,
          id_jenis_pons: dataLastMounting.id_jenis_pons,
          nama_jenis_pons: dataLastMounting.nama_jenis_pons,
          keterangan_jenis_pons: dataLastMounting.keterangan_jenis_pons,
          id_lem: dataLastMounting.id_lem,
          nama_lem: dataLastMounting.nama_lem,
          merk_komp_lem: dataLastMounting.merk_komp_lem,
          keterangan_lem: dataLastMounting.keterangan_lem,
          isi_dalam_1_pack: dataLastMounting.isi_dalam_1_pack,
          jenis_pack: dataLastMounting.jenis_pack,
          keterangan_pack: dataLastMounting.keterangan_pack,
          lampiran: dataLastMounting.lampiran,
          is_ukuran_partisi_sekat: dataLastMounting.is_ukuran_partisi_sekat,
          panjang_partisi_1: dataLastMounting.panjang_partisi_1,
          lebar_partisi_1: dataLastMounting.lebar_partisi_1,
          panjang_partisi_2: dataLastMounting.panjang_partisi_2,
          lebar_partisi_2: dataLastMounting.lebar_partisi_2,
          tambahan_insheet_druk: dataLastMounting.tambahan_insheet_druk,
        },
        { transaction: t }
      );

      for (let i = 0; i < checkDataTahapan.length; i++) {
        const e = checkDataTahapan[i];
        await IoTahapan.create(
          {
            id_io: _id,
            id_io_mounting: checkData.id,
            id_tahapan_mesin: e.id_tahapan_mesin,
            id_setting_kapasitas: e.id_setting_kapasitas,
            id_drying_time: e.id_drying_time,
            nama_proses: e.nama_proses,
            nama_mesin: e.nama_mesin,
            nama_setting_kapasitas: e.nama_setting_kapasitas,
            value_setting_kapasitas: e.value_setting_kapasitas,
            nama_drying_time: e.nama_drying_time,
            value_drying_time: e.value_drying_time,
            index: e.index,
          },
          { transaction: t }
        );
      }

      await IoUserAction.create(
        {
          id_io: checkData.id,
          id_user: req.user.id,
          status: "create mounting",
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

  updateMountingIo: async (req, res) => {
    const _id = req.params.id;
    const { data_mounting } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await IoMounting.findAll({ where: { id: _id } });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      await IoMounting.update(
        {
          id_io: _id,
          keterangan_revisi: data_mounting.keterangan_revisi,
          ukuran_jadi_panjang: data_mounting.ukuran_jadi_panjang,
          ukuran_jadi_lebar: data_mounting.ukuran_jadi_lebar,
          ukuran_jadi_tinggi: data_mounting.ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: data_mounting.ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: data_mounting.ukuran_jadi_terb_lebar,
          warna_depan: data_mounting.warna_depan,
          warna_belakang: data_mounting.warna_belakang,
          jumlah_warna: data_mounting.jumlah_warna,
          keterangan_warna_depan: data_mounting.keterangan_warna_depan,
          keterangan_warna_belakang: data_mounting.keterangan_warna_belakang,
          id_coating_depan: data_mounting.id_coating_depan,
          nama_coating_depan: data_mounting.nama_coating_depan,
          merk_coating_depan: data_mounting.merk_coating_depan,
          id_coating_belakang: data_mounting.id_coating_belakang,
          nama_coating_belakang: data_mounting.nama_coating_belakang,
          merk_coating_belakang: data_mounting.merk_coating_belakang,
          merk_serat_kertas: data_mounting.merk_serat_kertas,
          jenis_kertas: data_mounting.jenis_kertas,
          id_kertas: data_mounting.id_kertas,
          nama_kertas: data_mounting.nama_kertas,
          gramature_kertas: data_mounting.gramature_kertas,
          panjang_plano: data_mounting.panjang_plano,
          lebar_plano: data_mounting.lebar_plano,
          panjang_layout: data_mounting.panjang_layout,
          lebar_layout: data_mounting.lebar_layout,
          ukuran_cetak_panjang_1: data_mounting.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: data_mounting.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: data_mounting.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: data_mounting.ukuran_cetak_isi_1,
          ukuran_cetak_panjang_2: data_mounting.ukuran_cetak_panjang_2,
          ukuran_cetak_lebar_2: data_mounting.ukuran_cetak_lebar_2,
          ukuran_cetak_bagian_2: data_mounting.ukuran_cetak_bagian_2,
          ukuran_cetak_isi_2: data_mounting.ukuran_cetak_isi_2,
          id_layout: data_mounting.id_layout,
          id_jenis_pons: data_mounting.id_jenis_pons,
          nama_jenis_pons: data_mounting.nama_jenis_pons,
          keterangan_jenis_pons: data_mounting.keterangan_jenis_pons,
          id_lem: data_mounting.id_lem,
          nama_lem: data_mounting.nama_lem,
          merk_komp_lem: data_mounting.merk_komp_lem,
          keterangan_lem: data_mounting.keterangan_lem,
          isi_dalam_1_pack: data_mounting.isi_dalam_1_pack,
          jenis_pack: data_mounting.jenis_pack,
          keterangan_pack: data_mounting.keterangan_pack,
          lampiran: data_mounting.lampiran,
          is_ukuran_partisi_sekat: data_mounting.is_ukuran_partisi_sekat,
          panjang_partisi_1: data_mounting.panjang_partisi_1,
          lebar_partisi_1: data_mounting.lebar_partisi_1,
          panjang_partisi_2: data_mounting.panjang_partisi_2,
          lebar_partisi_2: data_mounting.lebar_partisi_2,
          tambahan_insheet_druk: data_mounting.tambahan_insheet_druk,
        },
        { transaction: t }
      );

      // Ambil semua data lama dari database
      const dataFromDatabase = await IoTahapan.findAll({
        where: { id_mounting: _id },
      });

      const dbIds = dataFromDatabase.map((d) => d.id);
      const inputIds = data_mounting.tahapan
        .filter((d) => d.id !== null)
        .map((d) => d.id);

      // 1. DELETE → id yg ada di DB tapi tidak ada di input
      const idsToDelete = dbIds.filter((id) => !inputIds.includes(id));
      if (idsToDelete.length > 0) {
        await IoTahapan.destroy({
          where: { id: idsToDelete },
          transaction: t,
        });
      }

      // 2. UPDATE & CREATE
      for (const item of dataUpdate) {
        if (item.id === null) {
          // CREATE
          await IoTahapan.create(
            {
              id_io: checkData.id_io,
              id_io_mounting: _id,
              id_tahapan_mesin: item.id_tahapan_mesin,
              id_setting_kapasitas: item.id_setting_kapasitas,
              id_drying_time: item.id_drying_time,
              nama_proses: item.nama_proses,
              nama_mesin: item.nama_mesin,
              nama_setting_kapasitas: item.nama_setting_kapasitas,
              value_setting_kapasitas: item.value_setting_kapasitas,
              nama_drying_time: item.nama_drying_time,
              value_drying_time: item.value_drying_time,
              index: item.index,
            },
            { transaction: t }
          );
        } else {
          // UPDATE
          await IoTahapan.update(
            {
              id_tahapan_mesin: item.id_tahapan_mesin,
              id_setting_kapasitas: item.id_setting_kapasitas,
              id_drying_time: item.id_drying_time,
              nama_proses: item.nama_proses,
              nama_mesin: item.nama_mesin,
              nama_setting_kapasitas: item.nama_setting_kapasitas,
              value_setting_kapasitas: item.value_setting_kapasitas,
              nama_drying_time: item.nama_drying_time,
              value_drying_time: item.value_drying_time,
              index: item.index,
            },
            {
              where: { id: item.id },
              transaction: t,
            }
          );
        }
      }

      await IoUserAction.create(
        {
          id_io: checkData.id,
          id_user: req.user.id,
          status: "update mounting",
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
        await IoUserAction.create(
          {
            id_io: checkData.id,
            id_user: req.user.id,
            status: "delete io",
          },
          { transaction: t }
        );
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
