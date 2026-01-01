const { Op, fn, col, literal } = require("sequelize");
const Io = require("../../../model/marketing/io/ioModel");
const IoMounting = require("../../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../../model/marketing/io/ioTahapanModel");
const IoMountingLainLain = require("../../../model/marketing/io/ioMountingLainLain");
const IoUserAction = require("../../../model/marketing/io/ioActionActionModel");
const Okp = require("../../../model/marketing/okp/okpModel");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const MasterBarang = require("../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const IoController = {
  getIo: async (req, res) => {
    const _id = req.params.id;
    const {
      is_active,
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
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (page && limit) {
        const length = await Io.count({ where: obj });
        const data = await Io.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          order: [["createdAt", "DESC"]],
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
              where: { is_active: true },
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
          include: [
            {
              model: Okp,
              as: "okp",
              attributes: ["id", "id_kalkulasi"],
              include: [
                {
                  model: Kalkulasi,
                  as: "kalkulasi",
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
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

  getIoJumlahData: async (req, res) => {
    try {
      const length = await Io.findOne({
        where: {
          // Filter hanya format baru yang mengandung '/' (OK-00435/12/25)
          // dan bukan format lama (OKP 676)
          no_io: {
            [Op.like]: "%/%", // hanya ambil yang ada karakter '/'
          },
        },
        order: [
          // extract nomor urut pada format OK00001/CBL/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_io, 5), '/', 1) AS UNSIGNED)`
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      let number = 0;

      if (length) {
        const lastNo = length.no_io; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        number = lastSeq;
      }

      return res.status(200).json({
        succes: true,
        status_code: 200,
        total_data: number,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  getIoDataPrevious: async (req, res) => {
    const _id = req.params.id;
    try {
      const checkOkp = await Okp.findByPk(_id);
      if (!checkOkp)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Okp tidak ditemukan",
        });

      const checkIoPrevious = await Io.findOne({
        where: { id_okp: checkOkp.id_okp_previous },
      });

      return res.status(200).json({
        succes: true,
        status_code: 200,
        data: checkIoPrevious,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createIo: async (req, res) => {
    const {
      id_okp,
      base_no_io,
      no_io,
      status_io,
      is_revisi,
      revisi_no_io,
      keterangan,
    } = req.body;
    const t = await db.transaction();
    if (!id_okp)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "okp wajib di isi!!",
      });
    // if (!no_io)
    //   return res.status(404).json({
    //     succes: false,
    //     status_code: 404,
    //     msg: "no Io wajib di isi!!",
    //   });

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

      const checkDataKertas = await MasterBarang.findByPk(
        checkKalkulasi.id_kertas
      );

      if (!checkDataKertas)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Kertas tidak ditemukan",
        });
      let nextNoIoFix = null;
      let revisiKe = 0;
      let basenoIo = "";

      if (status_io == "repeat perubahan") {
        const checkIoPrevious = await Io.findOne({
          where: { id_okp: checkOkp.id_okp_previous },
          transaction: t,
        });
        const nextNoIO = incrementRevisiIO(checkIoPrevious.no_io);

        nextNoIoFix = nextNoIO.no_io_baru;
        revisiKe = nextNoIO.revisi_berikutnya;
        basenoIo = nextNoIO.original_no_io;
        //console.log("io sebelum", checkIoPrevious);
        console.log(nextNoIO, nextNoIoFix, revisiKe, basenoIo);
        // Test

        await Io.update(
          { is_active: false },
          { where: { id_okp: checkOkp.id_okp_previous }, transaction: t }
        );
        revisiKe = checkIoPrevious?.revisi_ke + 1;
        basenoIo = checkIoPrevious?.base_no_io;
      } else {
        nextNoIoFix = no_io;
        basenoIo = no_io;
        revisiKe = 0;
      }

      const response = await Io.create(
        {
          id_okp: id_okp,
          base_no_io: basenoIo,
          id_create_io: req.user.id,
          id_customer: checkOkp.id_customer,
          id_produk: checkOkp.id_produk,
          no_io: nextNoIoFix,
          customer: checkOkp.customer,
          produk: checkOkp.produk,
          status_io: status_io,
          is_revisi: is_revisi,
          revisi_no_io: revisi_no_io,
          revisi_ke: revisiKe,
          keterangan: keterangan,
          label: checkKalkulasi.label,
        },
        { transaction: t }
      );

      let merkSeratKertas = "Serat Panjang";

      if (checkDataKertas.lebar_kertas > checkDataKertas.panjang_kertas) {
        merkSeratKertas = "Serat Pendek";
      }

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
          id_coating_depan: checkKalkulasi.id_coating_depan || null,
          nama_coating_depan: checkKalkulasi.nama_coating_depan,
          id_coating_belakang: checkKalkulasi.id_coating_belakang || null,
          nama_coating_belakang: checkKalkulasi.nama_coating_belakang,
          jenis_kertas: checkKalkulasi.jenis_kertas,
          id_kertas: checkKalkulasi.id_kertas || null,
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
          id_jenis_pons: checkKalkulasi.id_jenis_pons || null,
          nama_jenis_pons: checkKalkulasi.nama_jenis_pons,
          id_lem: checkKalkulasi.id_lem || null,
          nama_lem: checkKalkulasi.nama_lem,
          id_layout: checkOkp.id_pisau,
          merk_serat_kertas: `${checkKalkulasi.brand_kertas} / ${merkSeratKertas}`,
        },
        { transaction: t }
      );

      //proses update no io dan id io di kalkulasi
      await Kalkulasi.update(
        { id_io: response.id, no_io: response.no_io },
        { where: { id: checkKalkulasi.id }, transaction: t }
      );

      //proses update okp untuk done io
      await Okp.update(
        { is_io_done: true },
        { where: { id: checkOkp.id }, transaction: t }
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

  doneManualIo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await Kalkulasi.update(
        {
          is_io_active: false,
        },
        {
          where: { id_io: _id, is_io_active: true },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Done Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
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
          status_proses: "request to npd",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "requested" },
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

      //proses update no io dan id io di kalkulasi
      await Kalkulasi.update(
        { is_io_active: true },
        { where: { id_io: checkData.id }, transaction: t }
      );
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

  rejectIo: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
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
          status_proses: "reject npd",
          status: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "npd reject" },
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

  createMountingIo: async (req, res) => {
    const _id = req.params.id;
    const { data_mounting } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await IoMounting.findAll({
        where: { id_io: _id, is_active: true },
      });
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const checkDataMountingA = await IoMounting.findOne({
        where: { id_io: _id, nama_mounting: "A" },
        include: [
          {
            model: IoTahapan,
            as: "tahapan",
          },
        ],
      });
      if (!checkDataMountingA)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data mounting A tidak ditemukan",
        });

      const dataLastMounting = checkData.reduce((prev, current) =>
        prev.nama_mounting > current.nama_mounting ? prev : current
      );

      const namaMounting = nextAlphabet(dataLastMounting.nama_mounting);

      await Io.update(
        { is_updated: true },
        { where: { id: _id }, transaction: t }
      );

      const newMounting = await IoMounting.create(
        {
          id_io: _id,
          nama_mounting: namaMounting,
          barcode: checkDataMountingA.barcode,
          format_data: checkDataMountingA.format_data,
          keterangan_revisi: checkDataMountingA.keterangan_revisi,
          ukuran_jadi_panjang: checkDataMountingA.ukuran_jadi_panjang,
          ukuran_jadi_lebar: checkDataMountingA.ukuran_jadi_lebar,
          ukuran_jadi_tinggi: checkDataMountingA.ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: checkDataMountingA.ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: checkDataMountingA.ukuran_jadi_terb_lebar,
          untuk: checkDataMountingA.untuk,
          warna_depan: checkDataMountingA.warna_depan,
          warna_belakang: checkDataMountingA.warna_belakang,
          jumlah_warna: checkDataMountingA.jumlah_warna,
          keterangan_warna_depan: checkDataMountingA.keterangan_warna_depan,
          keterangan_warna_belakang:
            checkDataMountingA.keterangan_warna_belakang,
          id_coating_depan: checkDataMountingA.id_coating_depan,
          nama_coating_depan: checkDataMountingA.nama_coating_depan,
          merk_coating_depan: checkDataMountingA.merk_coating_depan,
          id_coating_belakang: checkDataMountingA.id_coating_belakang,
          nama_coating_belakang: checkDataMountingA.nama_coating_belakang,
          merk_coating_belakang: checkDataMountingA.merk_coating_belakang,
          merk_serat_kertas: checkDataMountingA.merk_serat_kertas,
          jenis_kertas: checkDataMountingA.jenis_kertas,
          id_kertas: checkDataMountingA.id_kertas,
          nama_kertas: checkDataMountingA.nama_kertas,
          gramature_kertas: checkDataMountingA.gramature_kertas,
          panjang_plano: checkDataMountingA.panjang_plano,
          lebar_plano: checkDataMountingA.lebar_plano,
          panjang_layout: checkDataMountingA.panjang_layout,
          lebar_layout: checkDataMountingA.lebar_layout,
          ukuran_cetak_panjang_1: checkDataMountingA.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: checkDataMountingA.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: checkDataMountingA.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: checkDataMountingA.ukuran_cetak_isi_1,
          ukuran_cetak_panjang_2: checkDataMountingA.ukuran_cetak_panjang_2,
          ukuran_cetak_lebar_2: checkDataMountingA.ukuran_cetak_lebar_2,
          ukuran_cetak_bagian_2: checkDataMountingA.ukuran_cetak_bagian_2,
          ukuran_cetak_isi_2: checkDataMountingA.ukuran_cetak_isi_2,
          id_layout: checkDataMountingA.id_layout,
          id_jenis_pons: checkDataMountingA.id_jenis_pons,
          nama_jenis_pons: checkDataMountingA.nama_jenis_pons,
          keterangan_jenis_pons: checkDataMountingA.keterangan_jenis_pons,
          id_lem: checkDataMountingA.id_lem,
          nama_lem: checkDataMountingA.nama_lem,
          merk_komp_lem: checkDataMountingA.merk_komp_lem,
          keterangan_lem: checkDataMountingA.keterangan_lem,
          isi_dalam_1_pack: checkDataMountingA.isi_dalam_1_pack,
          jenis_pack: checkDataMountingA.jenis_pack,
          keterangan_pack: checkDataMountingA.keterangan_pack,
          lampiran: checkDataMountingA.lampiran,
          is_ukuran_partisi_sekat: checkDataMountingA.is_ukuran_partisi_sekat,
          panjang_partisi_1: checkDataMountingA.panjang_partisi_1,
          lebar_partisi_1: checkDataMountingA.lebar_partisi_1,
          panjang_partisi_2: checkDataMountingA.panjang_partisi_2,
          lebar_partisi_2: checkDataMountingA.lebar_partisi_2,
          tambahan_insheet_druk: checkDataMountingA.tambahan_insheet_druk,
          file: checkDataMountingA.file,
        },
        { transaction: t }
      );

      for (let i = 0; i < checkDataMountingA.tahapan.length; i++) {
        const e = checkDataMountingA.tahapan[i];
        await IoTahapan.create(
          {
            id_io: _id,
            id_io_mounting: newMounting.id,
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
      await t.rollback();
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
          keterangan_revisi: data_mounting.keterangan_revisi,
          ukuran_jadi_panjang: data_mounting.ukuran_jadi_panjang,
          ukuran_jadi_lebar: data_mounting.ukuran_jadi_lebar,
          ukuran_jadi_tinggi: data_mounting.ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: data_mounting.ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: data_mounting.ukuran_jadi_terb_lebar,
          untuk: data_mounting.untuk,
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
          file: data_mounting.file,
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
          where: { [foreignKey]: _id },
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
      if (data_mounting.lain_lain) {
        await syncChild(
          IoMountingLainLain,
          "lain_lain",
          "id_io_mounting",
          data_mounting.lain_lain
        );
      }

      // Ambil semua data lama dari database
      const dataFromDatabase = await IoTahapan.findAll({
        where: { id_io_mounting: _id },
      });

      const dbIds = dataFromDatabase.map((d) => d.id);
      const inputIds = data_mounting.tahapan
        .filter((d) => d.id !== null)
        .map((d) => d.id);

      // 1. DELETE → id yg ada di DB tapi tidak ada di input
      const idsToDelete = dbIds.filter((id) => !inputIds.includes(id));
      if (idsToDelete.length > 0) {
        for (let i = 0; i < idsToDelete.length; i++) {
          const e = idsToDelete[i];

          await IoTahapan.destroy({
            where: { id: e },
            transaction: t,
          });
        }
      }

      // 2. UPDATE & CREATE
      for (let index = 0; index < data_mounting.tahapan.length; index++) {
        const e = data_mounting.tahapan[index];

        if (e.id === null) {
          await IoTahapan.create(
            {
              id_io: checkData.id_io,
              id_io_mounting: _id,
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
        } else {
          await IoTahapan.update(
            {
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
            {
              where: { id: e.id },
              transaction: t,
            }
          );
        }
      }

      await IoUserAction.create(
        {
          id_io: checkData.id_io,
          id_user: req.user.id,
          status: "update mounting",
        },
        { transaction: t }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback(),
        res
          .status(400)
          .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  deleteMountingIo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await IoMounting.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await IoMounting.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await IoUserAction.create(
          {
            id_io: checkData.id_io,
            id_user: req.user.id,
            status: `delete Mounting`,
          },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      await t.rollback(),
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
      await t.rollback(),
        res
          .status(400)
          .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

function nextAlphabet(title) {
  // Ambil huruf terakhir dari title
  let lastChar = title.slice(-1).toUpperCase();

  // Konversi ke kode ASCII
  let charCode = lastChar.charCodeAt(0);

  // Jika Z maka balik ke A
  if (charCode === 90) {
    // 90 = 'Z'
    return "A";
  }

  // Ambil huruf berikutnya
  return String.fromCharCode(charCode + 1);
}

function incrementRevisiIO(no_io) {
  let result;

  // Cek apakah ada tanda /
  if (no_io.includes("/")) {
    // Pisahkan berdasarkan / pertama
    const slashIndex = no_io.indexOf("/");
    const basePart = no_io.substring(0, slashIndex); // Sebelum /
    const datePart = no_io.substring(slashIndex); // Dari / sampai akhir

    // Cek apakah basePart diakhiri dengan -ANGKA (BUKAN leading zero)
    const revisionMatch = basePart.match(/-([1-9]\d*)$/);

    if (revisionMatch) {
      // Sudah ada revisi
      const revisiAngka = parseInt(revisionMatch[1]);
      const baseNoOnly = basePart.substring(0, basePart.lastIndexOf("-"));
      const revisiBerikutnya = revisiAngka + 1;
      const no_io_baru = `${baseNoOnly}-${revisiBerikutnya}${datePart}`;
      const original_no_io = `${baseNoOnly}${datePart}`;

      result = {
        no_io_baru: no_io_baru,
        original_no_io: original_no_io,
        revisi_sekarang: revisiAngka,
        revisi_berikutnya: revisiBerikutnya,
        base_no: baseNoOnly,
      };
    } else {
      // Belum ada revisi
      const no_io_baru = `${basePart}-1${datePart}`;
      const original_no_io = `${basePart}${datePart}`;

      result = {
        no_io_baru: no_io_baru,
        original_no_io: original_no_io,
        revisi_sekarang: 0,
        revisi_berikutnya: 1,
        base_no: basePart,
      };
    }
  }
  // Tidak ada tanggal
  else {
    // Cek apakah ada -ANGKA[HURUF] di akhir
    const revisionMatch = no_io.match(/^(.+?)-(\d+)([A-Z]*)$/);

    if (revisionMatch) {
      const baseNo = revisionMatch[1];
      const revisiAngka = parseInt(revisionMatch[2]);
      const suffix = revisionMatch[3] || "";
      const revisiBerikutnya = revisiAngka + 1;
      const no_io_baru = `${baseNo}-${revisiBerikutnya}${suffix}`;
      const original_no_io = `${baseNo}${suffix}`;

      result = {
        no_io_baru: no_io_baru,
        original_no_io: original_no_io,
        revisi_sekarang: revisiAngka,
        revisi_berikutnya: revisiBerikutnya,
        base_no: baseNo,
      };
    }
    // Cek apakah diakhiri huruf (tanpa revisi)
    else if (/[A-Z]$/.test(no_io)) {
      const match = no_io.match(/^(.+?)([A-Z]+)$/);
      const baseNo = match[1];
      const suffix = match[2];
      const no_io_baru = `${baseNo}-1${suffix}`;
      const original_no_io = `${baseNo}${suffix}`;

      result = {
        no_io_baru: no_io_baru,
        original_no_io: original_no_io,
        revisi_sekarang: 0,
        revisi_berikutnya: 1,
        base_no: baseNo,
      };
    }
    // Format biasa
    else {
      const no_io_baru = `${no_io}-1`;
      const original_no_io = no_io;

      result = {
        no_io_baru: no_io_baru,
        original_no_io: original_no_io,
        revisi_sekarang: 0,
        revisi_berikutnya: 1,
        base_no: no_io,
      };
    }
  }

  return result;
}

// const testCases = [
//   "4429-3A",
//   "4430A",
//   "4422",
//   "4422-1",
//   "IO-00333/12/25",
//   "IO-00052-1/05/24",
// ];

// console.log("=== TEST HASIL ===\n");
// testCases.forEach((io) => {
//   console.log(`Testing: ${io}`);
//   const result = incrementRevisiIO(io);
//   console.log(`Original IO : ${result.original_no_io}`);
//   console.log(`Baru        : ${result.no_io_baru}`);
//   console.log(
//     `Revisi      : ${result.revisi_sekarang} → ${result.revisi_berikutnya}`
//   );
//   console.log("---");
// });

module.exports = IoController;
