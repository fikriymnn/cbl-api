const { Op } = require("sequelize");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const KalkulasiQty = require("../../../model/marketing/kalkulasi/kalkulasiQtyModel");
const KalkulasiLainLain = require("../../../model/marketing/kalkulasi/kalkulasiLainLainModel");
//master
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterMarketing = require("../../../model/masterData/marketing/masterMarketingModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../../model/masterData/marketing/masterHargaPengirimanModel");
const MasterBarang = require("../../../model/masterData/barang/masterBarangModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const db = require("../../../config/database");

const KalkulasiController = {
  getKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_kalkulasi: { [Op.like]: `%${search}%` } },
            { status_kalkulasi: { [Op.like]: `%${search}%` } },
            { nama_customer: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { qty_kalkulasi: { [Op.like]: `%${search}%` } },
            { total_harga_satuan_customer: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await Kalkulasi.count({ where: obj });
        const data = await Kalkulasi.findAll({
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
        const response = await Kalkulasi.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await Kalkulasi.findAll({ where: obj });
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

  createKalkulasi: async (req, res) => {
    const {
      id_customer,
      id_marketing,
      id_produk,
      id_harga_pengiriman,
      qty_kalkulasi,
      presentase_insheet,
      spesifikasi,
      status_kalkulasi,
      ukuran_jadi_panjang,
      ukuran_jadi_lebar,
      ukuran_jadi_tinggi,
      ukuran_jadi_terb_panjang,
      ukuran_jadi_terb_lebar,
      ukuran_cetak_panjang_1,
      ukuran_cetak_lebar_1,
      ukuran_cetak_bagian_1,
      ukuran_cetak_isi_1,
      ukuran_cetak_bbs_1,
      ukuran_cetak_panjang_2,
      ukuran_cetak_lebar_2,
      ukuran_cetak_bagian_2,
      ukuran_cetak_isi_2,
      ukuran_cetak_bbs_2,
      warna_depan,
      warna_belakang,
      jumlah_warna,
      jenis_kertas,
      id_kertas,
      total_kertas,
      total_harga_kertas,
      id_mesin_potong,
      printing_insheet,
      id_jenis_mesin_cetak,
      plate_cetak,
      harga_plate_cetak,
      jumlah_harga_cetak,
      id_coating_depan,
      harga_coating_depan,
      id_coating_belakang,
      harga_coating_belakang,
      jumlah_harga_coating,
      id_mesin_coating_depan,
      id_mesin_coating_belakang,
      pons_insheet,
      id_jenis_pons,
      id_mesin_pons,
      harga_pisau,
      ongkos_pons,
      ongkos_pons_qty,
      harga_satuan_ongkos_pons,
      total_harga_ongkos_pons,
      lipat,
      id_mesin_lipat,
      qty_lipat,
      potong_jadi,
      qty_potong,
      harga_potong_jadi,
      finishing_insheet,
      id_lem,
      jumlah_harga_lem,
      id_mesin_finishing,
      foil,
      harga_foil,
      spot_foil,
      harga_spot_foil,
      harga_polimer,
      panjang_packaging,
      lebar_packaging,
      no_packaging,
      jumlah_kirim,
      harga_packaging,
      harga_pengiriman,
      jenis_packing,
      id_packing,
      qty_packing,
      harga_packing,
      harga_produksi,
      profit,
      profit_harga,
      jumlah_harga_jual,
      ppn,
      harga_ppn,
      diskon,
      harga_diskon,
      total_harga,
      harga_satuan,
      total_harga_satuan_customer,
      keterangan_kerja,
      keterangan_harga,
    } = req.body;
    const t = await db.transaction();

    try {
      if (!id_customer)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "customer wajib di isi!!",
        });
      if (!id_marketing)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "marketing wajib di isi!!",
        });

      if (!id_produk)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "produk wajib di isi!!",
        });

      if (!id_harga_pengiriman)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "pengiriman wajib di isi!!",
        });
      if (!id_kertas)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "kertas wajib di isi!!",
        });

      //check data customer
      const checkCustomer = await MasterCustomer.findByPk(id_customer);
      if (!checkCustomer)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "customer tidak ditemukan",
        });

      //check data marketing
      const checkMarketing = await MasterMarketing.findByPk(id_marketing);
      if (!checkMarketing)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "marketing tidak ditemukan",
        });

      //check data produk
      const checkProduk = await MasterProduk.findByPk(id_produk);
      if (!checkProduk)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "produk tidak ditemukan",
        });
      //check data harga pengiriman
      const checkHargaPengiriman = await MasterHargaPengiriman.findByPk(
        id_harga_pengiriman
      );
      if (!checkHargaPengiriman)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "pengiriman tidak ditemukan",
        });

      const checkKertas = await MasterBarang.findByPk(id_kertas);
      if (!checkKertas)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "kertas tidak ditemukan",
        });

      let checkMesinPotong = {};
      if (id_mesin_potong) {
        checkMesinPotong = await MasterBarang.findByPk(id_mesin_potong);
        if (!checkMesinPotong)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin Potong tidak ditemukan",
          });
      }

      let checkMesinCetak = {};
      if (id_jenis_mesin_cetak) {
        checkMesinCetak = await MasterBarang.findByPk(id_jenis_mesin_cetak);
        if (!checkMesinCetak)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin cetak tidak ditemukan",
          });
      }

      let checkCoatingDepan = {};
      if (id_coating_depan) {
        checkCoatingDepan = await MasterBarang.findByPk(id_coating_depan);
        if (!checkCoatingDepan)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "coating depan tidak ditemukan",
          });
      }
      let checkCoatingBelakang = {};
      if (id_coating_belakang) {
        checkCoatingBelakang = await MasterBarang.findByPk(id_coating_belakang);
        if (!checkCoatingBelakang)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "coating belakang tidak ditemukan",
          });
      }

      let checkMesinCoatingDepan = {};
      if (id_mesin_coating_depan) {
        checkMesinCoatingDepan = await MasterTahapanMesin.findByPk(
          id_mesin_coating_depan
        );
        if (!checkMesinCoatingDepan)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin coating depan tidak ditemukan",
          });
      }
      let checkMesinCoatingBelakang = {};
      if (id_mesin_coating_belakang) {
        checkMesinCoatingBelakang = await MasterTahapanMesin.findByPk(
          id_mesin_coating_belakang
        );
        if (!checkMesinCoatingBelakang)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin coating belakang tidak ditemukan",
          });
      }
      let checkJenisPons = {};
      if (id_jenis_pons) {
        checkJenisPons = await MasterBarang.findByPk(id_jenis_pons);
        if (!checkJenisPons)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "jenis pons tidak ditemukan",
          });
      }

      let checkMesinPons = {};
      if (id_mesin_pons) {
        checkMesinPons = await MasterTahapanMesin.findByPk(id_mesin_pons);
        if (!checkMesinPons)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin pons tidak ditemukan",
          });
      }
      let checkMesinLipat = {};
      if (id_mesin_lipat) {
        checkMesinLipat = await MasterTahapanMesin.findByPk(id_mesin_lipat);
        if (!checkMesinLipat)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin lipat tidak ditemukan",
          });
      }

      let checkLem = {};
      if (id_lem) {
        checkLem = await MasterBarang.findByPk(id_lem);
        if (!checkLem)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "lem tidak ditemukan",
          });
      }

      let checkMesinFinishing = {};
      if (id_mesin_finishing) {
        checkMesinFinishing = await MasterTahapanMesin.findByPk(
          id_mesin_finishing
        );
        if (!checkMesinFinishing)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin finishing tidak ditemukan",
          });
      }

      let checkPacking = {};
      if (id_packing) {
        checkPacking = await MasterBarang.findByPk(id_packing);
        if (!checkPacking)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "packing tidak ditemukan",
          });
      }
      const response = await Kalkulasi.create(
        {
          id_customer: id_customer,
          nama_customer: checkCustomer.nama_customer,
          id_marketing: id_marketing,
          nama_marketing: checkMarketing.data_karyawan.name,
          kode_marketing: checkMarketing.kode,
          id_produk: id_produk,
          nama_produk: checkProduk.nama_produk,
          id_harga_pengiriman: id_harga_pengiriman,
          nama_area_pengiriman: checkHargaPengiriman.nama_area,
          harga_area_pengiriman: checkHargaPengiriman.harga,
          qty_kalkulasi: qty_kalkulasi,
          presentase_insheet: presentase_insheet,
          spesifikasi: spesifikasi,
          status_kalkulasi: status_kalkulasi,
          ukuran_jadi_panjang: ukuran_jadi_panjang,
          ukuran_jadi_lebar: ukuran_jadi_lebar,
          ukuran_jadi_tinggi: ukuran_jadi_tinggi,
          ukuran_jadi_terb_panjang: ukuran_jadi_terb_panjang,
          ukuran_jadi_terb_lebar: ukuran_jadi_terb_lebar,
          ukuran_cetak_panjang_1: ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: ukuran_cetak_isi_1,
          ukuran_cetak_bbs_1: ukuran_cetak_bbs_1,
          ukuran_cetak_panjang_2: ukuran_cetak_panjang_2,
          ukuran_cetak_lebar_2: ukuran_cetak_lebar_2,
          ukuran_cetak_bagian_2: ukuran_cetak_bagian_2,
          ukuran_cetak_isi_2: ukuran_cetak_isi_2,
          ukuran_cetak_bbs_2: ukuran_cetak_bbs_2,
          warna_depan: warna_depan,
          warna_belakang: warna_belakang,
          jumlah_warna: jumlah_warna,
          jenis_kertas: jenis_kertas,
          id_kertas: id_kertas,
          nama_kertas: checkKertas.nama_barang,
          brand_kertas: checkKertas.brand?.nama_brand || null,
          gramature_kertas: checkKertas.gramature,
          panjang_kertas: checkKertas.panjang,
          lebar_kertas: checkKertas.lebar,
          persentase_kertas: checkKertas.persentase,
          total_kertas: total_kertas,
          total_harga_kertas: total_harga_kertas,
          id_mesin_potong: id_mesin_potong,
          nama_mesin_potong: checkMesinPotong.nama_barang || null,
          printing_insheet: printing_insheet,
          id_jenis_mesin_cetak: id_jenis_mesin_cetak,
          jenis_mesin_cetak: checkMesinCetak.nama_barang || null,
          plate_cetak: plate_cetak,
          harga_plate_cetak: harga_plate_cetak,
          jumlah_harga_cetak: jumlah_harga_cetak,
          id_coating_depan: id_coating_depan,
          nama_coating_depan: checkCoatingDepan.nama_barang || null,
          harga_coating_depan: harga_coating_depan,
          id_coating_belakang: id_coating_belakang,
          nama_coating_belakang: checkCoatingBelakang.nama_barang || null,
          harga_coating_belakang: harga_coating_belakang,
          jumlah_harga_coating: jumlah_harga_coating,
          id_mesin_coating_depan: id_mesin_coating_depan,
          nama_mesin_coating_depan:
            checkMesinCoatingDepan.mesin?.nama_mesin || null,
          id_mesin_coating_belakang: id_mesin_coating_belakang,
          nama_mesin_coating_belakang:
            checkMesinCoatingBelakang.mesin?.nama_mesin || null,
          pons_insheet: pons_insheet,
          id_jenis_pons: id_jenis_pons,
          nama_jenis_pons: checkJenisPons.nama_barang || null,
          id_mesin_pons: id_mesin_pons,
          nama_mesin_pons: checkMesinPons.mesin?.nama_mesin || null,
          harga_pisau: harga_pisau,
          ongkos_pons: ongkos_pons,
          ongkos_pons_qty: ongkos_pons_qty,
          harga_satuan_ongkos_pons: harga_satuan_ongkos_pons,
          total_harga_ongkos_pons: total_harga_ongkos_pons,
          lipat: lipat,
          id_mesin_lipat: id_mesin_lipat,
          nama_mesin_lipat: checkMesinLipat.mesin?.nama_mesin || null,
          qty_lipat: qty_lipat,
          potong_jadi: potong_jadi,
          qty_potong: qty_potong,
          harga_potong_jadi: harga_potong_jadi,
          finishing_insheet: finishing_insheet,
          id_lem: id_lem,
          nama_lem: checkLem.nama_barang || null,
          jumlah_harga_lem: jumlah_harga_lem,
          id_mesin_finishing: id_mesin_finishing,
          nama_mesin_finishing: checkMesinFinishing.mesin?.nama_mesin || null,
          foil: foil,
          harga_foil: harga_foil,
          spot_foil: spot_foil,
          harga_spot_foil: harga_spot_foil,
          harga_polimer: harga_polimer,
          panjang_packaging: panjang_packaging,
          lebar_packaging: lebar_packaging,
          no_packaging: no_packaging,
          jumlah_kirim: jumlah_kirim,
          harga_packaging: harga_packaging,
          harga_pengiriman: harga_pengiriman,
          jenis_packing: jenis_packing,
          id_packing: id_packing,
          nama_packing: checkPacking.nama_barang || null,
          qty_packing: qty_packing,
          harga_packing: harga_packing,
          harga_produksi: harga_produksi,
          profit: profit,
          profit_harga: profit_harga,
          jumlah_harga_jual: jumlah_harga_jual,
          ppn: ppn,
          harga_ppn: harga_ppn,
          diskon: diskon,
          harga_diskon: harga_diskon,
          total_harga: total_harga,
          harga_satuan: harga_satuan,
          total_harga_satuan_customer: total_harga_satuan_customer,
          keterangan_kerja: keterangan_kerja,
          keterangan_harga: keterangan_harga,
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

  submitKalkulasi: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      const checkData = await Kalkulasi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Kalkulasi.update(
        { status: "proses", status_kalkulasi: "request kabag" },
        {
          where: { id: _id },
          transaction: t,
        }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Submit Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  rejectKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const { note_kabag } = req.body;
    const t = await db.transaction();

    try {
      const checkData = await Kalkulasi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Kalkulasi.update(
        {
          status: "draft",
          status_kalkulasi: "reject kabag",
          note_kabag: note_kabag,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Reject Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },
  approveKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const { note_kabag } = req.body;
    const t = await db.transaction();

    try {
      const checkData = await Kalkulasi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Kalkulasi.update(
        {
          status: "history",
          status_kalkulasi: "approve kabag",
          note_kabag: note_kabag,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  //update belum
  updateKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const { nama_area, harga, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (nama_area) obj.nama_area = nama_area;
      if (harga) obj.harga = harga;
      if (is_active) obj.is_active = is_active;
      const checkData = await Kalkulasi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Kalkulasi.update(obj, {
        where: { id: _id },
        transaction: t,
      });
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

  deleteKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await Kalkulasi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await Kalkulasi.update(
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

module.exports = KalkulasiController;
