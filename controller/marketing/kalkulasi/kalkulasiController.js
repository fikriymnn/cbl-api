const { Op } = require("sequelize");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const KalkulasiQty = require("../../../model/marketing/kalkulasi/kalkulasiQtyModel");
const KalkulasiLainLain = require("../../../model/marketing/kalkulasi/kalkulasiLainLainModel");
const KalkulasiUserAction = require("../../../model/marketing/kalkulasi/kalkulasiUserActionModel");
//master
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterMarketing = require("../../../model/masterData/marketing/masterMarketingModel");
const MasterKaryawan = require("../../../model/hr/karyawanModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../../model/masterData/marketing/masterHargaPengirimanModel");
const MasterBarang = require("../../../model/masterData/barang/masterBarangModel");
const MasterBrand = require("../../../model/masterData/barang/masterBrandModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterCustomerGudang = require("../../../model/masterData/marketing/masterCustomerGudangModel");
const db = require("../../../config/database");
const Users = require("../../../model/userModel");

const KalkulasiController = {
  getKalkulasi: async (req, res) => {
    const _id = req.params.id;
    const {
      is_active,
      is_okp_done,
      is_io_active,
      page,
      limit,
      search,
      status,
      status_proses,
    } = req.query;

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
      if (status) obj.status = status;
      if (status_proses) obj.status_proses = status_proses;
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (is_okp_done) obj.is_okp_done = is_okp_done == "true" ? true : false;
      if (is_io_active)
        obj.is_io_active = is_io_active == "true" ? true : false;
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
        const response = await Kalkulasi.findByPk(_id, {
          include: [
            {
              model: KalkulasiLainLain,
              as: "lain_lain",
            },
            {
              model: KalkulasiUserAction,
              as: "kalkulasi_action_user",
              include: [
                {
                  model: Users,
                  as: "user",
                },
              ],
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
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await Kalkulasi.findAll({
          where: obj,
          include: [
            {
              model: MasterCustomer,
              as: "customer",
              include: [{ model: MasterCustomerGudang, as: "gudang" }],
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

  getKalkulasiJumlahData: async (req, res) => {
    try {
      const length = await Kalkulasi.count();

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

  createKalkulasi: async (req, res) => {
    const {
      id_kalkulasi_previous,
      id_customer,
      id_marketing,
      id_produk,
      id_area_pengiriman,
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
      percentage,
      total_kertas,
      total_harga_kertas,
      id_mesin_potong,
      print_insheet,
      id_jenis_mesin_cetak,
      plate_cetak,
      harga_plate,
      jumlah_harga_cetak,
      id_coating_depan,
      jumlah_harga_coating_depan,
      id_coating_belakang,
      jumlah_harga_coating_belakang,
      total_harga_coating,
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
      harga_lipat,
      potong_jadi,
      qty_potong,
      harga_potong_jadi,
      finishing_insheet,
      id_lem,
      jumlah_harga_lem,
      id_mesin_finishing,
      foil,
      harga_foil_manual,
      spot_foil,
      harga_spot_foil_manual,
      harga_polimer_manual,
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
      lain_lain,
    } = req.body;
    const t = await db.transaction();

    try {
      console.log(req.body);
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

      if (!id_area_pengiriman)
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
      const checkMarketing = await MasterMarketing.findByPk(id_marketing, {
        include: {
          model: MasterKaryawan,
          as: "data_karyawan",
        },
      });
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
        id_area_pengiriman
      );
      if (!checkHargaPengiriman)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "pengiriman tidak ditemukan",
        });

      const checkKertas = await MasterBarang.findByPk(id_kertas, {
        include: {
          model: MasterBrand,
          as: "brand",
        },
      });
      if (!checkKertas)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "kertas tidak ditemukan",
        });

      let checkMesinPotong = {};
      if (id_mesin_potong) {
        checkMesinPotong = await MasterTahapanMesin.findByPk(id_mesin_potong, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
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
          id_mesin_coating_depan,
          {
            include: { model: MasterMesinTahapan, as: "mesin" },
          }
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
          id_mesin_coating_belakang,
          {
            include: { model: MasterMesinTahapan, as: "mesin" },
          }
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
        checkMesinPons = await MasterTahapanMesin.findByPk(id_mesin_pons, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
        if (!checkMesinPons)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin pons tidak ditemukan",
          });
      }
      let checkMesinLipat = {};
      if (id_mesin_lipat) {
        checkMesinLipat = await MasterTahapanMesin.findByPk(id_mesin_lipat, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
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
          id_mesin_finishing,
          {
            include: { model: MasterMesinTahapan, as: "mesin" },
          }
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

      //untuk mengaktifkan list io di so jika repeat
      const is_io_active = status_kalkulasi == "repeat" ? true : false;

      let objCreate = {};

      if (status_kalkulasi == "repeat") {
        // cek kalkulasi sebelumnya
        const previousKalkulasi = await Kalkulasi.findByPk(
          id_kalkulasi_previous
        );
        if (!previousKalkulasi)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data kalkulasi sebelumnya tidak ditemukan",
          });
        objCreate = {
          id_user_create: req.user.id,
          id_kalkulasi_previous: id_kalkulasi_previous,
          id_okp: previousKalkulasi.id_okp,
          no_okp: previousKalkulasi.no_okp,
          id_io: previousKalkulasi.id_io,
          no_io: previousKalkulasi.no_io,
          id_customer: id_customer,
          nama_customer: checkCustomer.nama_customer,
          id_marketing: id_marketing,
          nama_marketing: checkMarketing.data_karyawan.name,
          kode_marketing: checkMarketing.kode,
          id_produk: id_produk,
          nama_produk: checkProduk.nama_produk,
          id_area_pengiriman: id_area_pengiriman,
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
          warna_depan: parseFloat(warna_depan || "0"),
          warna_belakang: parseFloat(warna_belakang || "0"),
          jumlah_warna: parseFloat(jumlah_warna || "0"),
          jenis_kertas: jenis_kertas,
          id_kertas: id_kertas,
          nama_kertas: checkKertas.nama_barang,
          brand_kertas: checkKertas.brand?.nama_brand || null,
          gramature_kertas: checkKertas.gramatur,
          panjang_kertas: checkKertas.panjang,
          lebar_kertas: checkKertas.lebar,
          persentase_kertas: checkKertas.persentase,
          persentase_apki_kertas: parseFloat(percentage || "0"),
          total_kertas: parseFloat(total_kertas || "0"),
          total_harga_kertas: parseStringSparator(total_harga_kertas || "0"),
          id_mesin_potong: id_mesin_potong,
          nama_mesin_potong: checkMesinPotong.mesin?.nama_mesin || null,
          print_insheet: parseInt(print_insheet || "0"),
          id_jenis_mesin_cetak: id_jenis_mesin_cetak,
          jenis_mesin_cetak: checkMesinCetak.nama_barang || null,
          plate_cetak: plate_cetak,
          harga_plate: harga_plate,
          jumlah_harga_cetak: parseFloat(jumlah_harga_cetak || "0"),
          id_coating_depan: id_coating_depan,
          nama_coating_depan: checkCoatingDepan.nama_barang || null,
          jumlah_harga_coating_depan: parseFloat(
            jumlah_harga_coating_depan || "0"
          ),
          id_coating_belakang: id_coating_belakang,
          nama_coating_belakang: checkCoatingBelakang.nama_barang || null,
          jumlah_harga_coating_belakang: parseFloat(
            jumlah_harga_coating_belakang || "0"
          ),
          total_harga_coating: parseFloat(total_harga_coating || "0"),
          id_mesin_coating_depan: id_mesin_coating_depan,
          nama_mesin_coating_depan:
            checkMesinCoatingDepan.mesin?.nama_mesin || null,
          id_mesin_coating_belakang: id_mesin_coating_belakang,
          nama_mesin_coating_belakang:
            checkMesinCoatingBelakang.mesin?.nama_mesin || null,
          pons_insheet: parseInt(pons_insheet || "0"),
          id_jenis_pons: id_jenis_pons,
          nama_jenis_pons: checkJenisPons.nama_barang || null,
          id_mesin_pons: id_mesin_pons,
          nama_mesin_pons: checkMesinPons.mesin?.nama_mesin || null,
          harga_pisau: parseFloat(harga_pisau || "0"),
          ongkos_pons: ongkos_pons,
          ongkos_pons_qty: parseFloat(ongkos_pons_qty || "0"),
          harga_satuan_ongkos_pons: parseStringSparator(
            harga_satuan_ongkos_pons || "0"
          ),
          total_harga_ongkos_pons: parseStringSparator(
            total_harga_ongkos_pons || "0"
          ),
          lipat: lipat,
          id_mesin_lipat: id_mesin_lipat,
          nama_mesin_lipat: checkMesinLipat.mesin?.nama_mesin || null,
          qty_lipat: qty_lipat,
          harga_lipat: parseStringSparator(harga_lipat || "0"),
          potong_jadi: potong_jadi,
          qty_potong: parseInt(qty_potong || "0"),
          harga_potong_jadi: parseStringSparator(harga_potong_jadi || "0"),
          finishing_insheet: parseInt(finishing_insheet || "0"),
          id_lem: id_lem,
          nama_lem: checkLem.nama_barang || null,
          jumlah_harga_lem: parseStringSparator(jumlah_harga_lem || "0"),
          id_mesin_finishing: id_mesin_finishing,
          nama_mesin_finishing: checkMesinFinishing.mesin?.nama_mesin || null,
          foil: foil,
          harga_foil_manual: parseFloat(harga_foil_manual || "0"),
          spot_foil: spot_foil,
          harga_spot_foil_manual: parseFloat(harga_spot_foil_manual || "0"),
          harga_polimer_manual: parseFloat(harga_polimer_manual || "0"),
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
          jumlah_harga_jual: parseFloat(jumlah_harga_jual || "0"),
          ppn: parseFloat(ppn || "0"),
          harga_ppn: harga_ppn,
          diskon: diskon,
          harga_diskon: harga_diskon,
          total_harga: total_harga,
          harga_satuan: harga_satuan,
          total_harga_satuan_customer: total_harga_satuan_customer,
          keterangan_kerja: keterangan_kerja,
          keterangan_harga: keterangan_harga,
          is_io_active: false,
          is_okp_done: true,
        };
      } else {
        objCreate = {
          id_user_create: req.user.id,
          id_kalkulasi_previous: id_kalkulasi_previous,
          id_customer: id_customer,
          nama_customer: checkCustomer.nama_customer,
          id_marketing: id_marketing,
          nama_marketing: checkMarketing.data_karyawan.name,
          kode_marketing: checkMarketing.kode,
          id_produk: id_produk,
          nama_produk: checkProduk.nama_produk,
          id_area_pengiriman: id_area_pengiriman,
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
          warna_depan: parseFloat(warna_depan || "0"),
          warna_belakang: parseFloat(warna_belakang || "0"),
          jumlah_warna: parseFloat(jumlah_warna || "0"),
          jenis_kertas: jenis_kertas,
          id_kertas: id_kertas,
          nama_kertas: checkKertas.nama_barang,
          brand_kertas: checkKertas.brand?.nama_brand || null,
          gramature_kertas: checkKertas.gramatur,
          panjang_kertas: checkKertas.panjang,
          lebar_kertas: checkKertas.lebar,
          persentase_kertas: checkKertas.persentase,
          persentase_apki_kertas: parseFloat(percentage || "0"),
          total_kertas: parseStringSparator(total_kertas || "0"),
          total_harga_kertas: parseStringSparator(total_harga_kertas || "0"),
          id_mesin_potong: id_mesin_potong,
          nama_mesin_potong: checkMesinPotong.mesin?.nama_mesin || null,
          print_insheet: parseInt(print_insheet || "0"),
          id_jenis_mesin_cetak: id_jenis_mesin_cetak,
          jenis_mesin_cetak: checkMesinCetak.nama_barang || null,
          plate_cetak: plate_cetak,
          harga_plate: harga_plate,
          jumlah_harga_cetak: parseFloat(jumlah_harga_cetak || "0"),
          id_coating_depan: id_coating_depan,
          nama_coating_depan: checkCoatingDepan.nama_barang || null,
          jumlah_harga_coating_depan: parseFloat(
            jumlah_harga_coating_depan || "0"
          ),
          id_coating_belakang: id_coating_belakang,
          nama_coating_belakang: checkCoatingBelakang.nama_barang || null,
          jumlah_harga_coating_belakang: parseFloat(
            jumlah_harga_coating_belakang || "0"
          ),
          total_harga_coating: parseFloat(total_harga_coating || "0"),
          id_mesin_coating_depan: id_mesin_coating_depan,
          nama_mesin_coating_depan:
            checkMesinCoatingDepan.mesin?.nama_mesin || null,
          id_mesin_coating_belakang: id_mesin_coating_belakang,
          nama_mesin_coating_belakang:
            checkMesinCoatingBelakang.mesin?.nama_mesin || null,
          pons_insheet: parseInt(pons_insheet || "0"),
          id_jenis_pons: id_jenis_pons,
          nama_jenis_pons: checkJenisPons.nama_barang || null,
          id_mesin_pons: id_mesin_pons,
          nama_mesin_pons: checkMesinPons.mesin?.nama_mesin || null,
          harga_pisau: parseFloat(harga_pisau || "0"),
          ongkos_pons: ongkos_pons,
          ongkos_pons_qty: parseFloat(ongkos_pons_qty || "0"),
          harga_satuan_ongkos_pons: parseStringSparator(
            harga_satuan_ongkos_pons || "0"
          ),
          total_harga_ongkos_pons: parseStringSparator(
            total_harga_ongkos_pons || "0"
          ),
          lipat: lipat,
          id_mesin_lipat: id_mesin_lipat,
          nama_mesin_lipat: checkMesinLipat.mesin?.nama_mesin || null,
          qty_lipat: qty_lipat,
          harga_lipat: parseStringSparator(harga_lipat || "0"),
          potong_jadi: potong_jadi,
          qty_potong: parseInt(qty_potong || "0"),
          harga_potong_jadi: parseStringSparator(harga_potong_jadi || "0"),
          finishing_insheet: parseInt(finishing_insheet || "0"),
          id_lem: id_lem,
          nama_lem: checkLem.nama_barang || null,
          jumlah_harga_lem: parseStringSparator(jumlah_harga_lem || "0"),
          id_mesin_finishing: id_mesin_finishing,
          nama_mesin_finishing: checkMesinFinishing.mesin?.nama_mesin || null,
          foil: foil,
          harga_foil_manual: parseFloat(harga_foil_manual || "0"),
          spot_foil: spot_foil,
          harga_spot_foil_manual: parseFloat(harga_spot_foil_manual || "0"),
          harga_polimer_manual: parseFloat(harga_polimer_manual || "0"),
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
          jumlah_harga_jual: parseFloat(jumlah_harga_jual || "0"),
          ppn: parseFloat(ppn || "0"),
          harga_ppn: harga_ppn,
          diskon: diskon,
          harga_diskon: harga_diskon,
          total_harga: total_harga,
          harga_satuan: harga_satuan,
          total_harga_satuan_customer: total_harga_satuan_customer,
          keterangan_kerja: keterangan_kerja,
          keterangan_harga: keterangan_harga,
          is_io_active: is_io_active,
          is_okp_done: true,
        };
      }
      const response = await Kalkulasi.create(objCreate, { transaction: t });

      if (lain_lain || lain_lain.length > 0) {
        for (let i = 0; i < lain_lain.length; i++) {
          const e = lain_lain[i];
          await KalkulasiLainLain.create(
            {
              id_kalkulasi: response.id,
              nama_item: e.nama_item,
              harga: e.harga,
            },
            { transaction: t }
          );
        }
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
        { status: "requested", status_proses: "request approval kabag" },
        {
          where: { id: _id },
          transaction: t,
        }
      );
      await KalkulasiUserAction.create(
        {
          id_kalkulasi: checkData.id,
          id_user: req.user.id,
          status: "submited",
        },
        { transaction: t }
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
          status_proses: "reject kabag",
          note_kabag: note_kabag,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await KalkulasiUserAction.create(
        {
          id_kalkulasi: checkData.id,
          id_user: req.user.id,
          status: "rejected",
        },
        { transaction: t }
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

      let isIoActive = false;
      let isOkpDone = false;
      if (checkData.status_kalkulasi == "repeat") {
        isIoActive = true;
        isOkpDone = true;
      }
      await Kalkulasi.update(
        {
          status: "history",
          status_proses: "approve kabag",
          note_kabag: note_kabag,
          id_user_approve: req.user.id,
          is_io_active: isIoActive,
          is_okp_done: isOkpDone,
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
    const {
      id_customer,
      id_marketing,
      id_produk,
      id_area_pengiriman,
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
      percentage,
      total_kertas,
      total_harga_kertas,
      id_mesin_potong,
      print_insheet,
      id_jenis_mesin_cetak,
      plate_cetak,
      harga_plate,
      jumlah_harga_cetak,
      id_coating_depan,
      jumlah_harga_coating_depan,
      id_coating_belakang,
      jumlah_harga_coating_belakang,
      total_harga_coating,
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
      harga_lipat,
      potong_jadi,
      qty_potong,
      harga_potong_jadi,
      finishing_insheet,
      id_lem,
      jumlah_harga_lem,
      id_mesin_finishing,
      foil,
      harga_foil_manual,
      spot_foil,
      harga_spot_foil_manual,
      harga_polimer_manual,
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
      let obj = {};
      if (id_customer) {
        //check data customer
        const checkData = await MasterCustomer.findByPk(id_customer);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "customer tidak ditemukan",
          });
        obj.id_customer = id_customer;
        obj.nama_customer = checkData.nama_customer;
      }
      if (id_marketing) {
        //check data
        const checkData = await MasterMarketing.findByPk(id_marketing);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "marketing tidak ditemukan",
          });
        obj.id_marketing = id_marketing;
        obj.nama_marketing = checkData.data_karyawan.name;
        obj.kode_marketing = checkData.kode;
      }
      if (id_produk) {
        //check data
        const checkData = await MasterProduk.findByPk(id_produk);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "produk tidak ditemukan",
          });
        obj.id_produk = id_produk;
        obj.nama_produk = checkData.nama_produk;
      }

      if (id_area_pengiriman) {
        //check data
        const checkData = await MasterHargaPengiriman.findByPk(
          id_area_pengiriman
        );
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "pengiriman tidak ditemukan",
          });
        obj.id_area_pengiriman = id_area_pengiriman;
        obj.nama_area_pengiriman = checkData.nama_area;
        obj.harga_area_pengiriman = checkData.harga;
      }

      if (qty_kalkulasi) obj.qty_kalkulasi = qty_kalkulasi;
      if (presentase_insheet) obj.presentase_insheet = presentase_insheet;
      if (spesifikasi) obj.spesifikasi = spesifikasi;
      if (ukuran_jadi_panjang) obj.ukuran_jadi_panjang = ukuran_jadi_panjang;
      if (ukuran_jadi_lebar) obj.ukuran_jadi_lebar = ukuran_jadi_lebar;
      if (ukuran_jadi_tinggi) obj.ukuran_jadi_tinggi = ukuran_jadi_tinggi;
      if (ukuran_jadi_terb_panjang)
        obj.ukuran_jadi_terb_panjang = ukuran_jadi_terb_panjang;
      if (ukuran_jadi_terb_lebar)
        obj.ukuran_jadi_terb_lebar = ukuran_jadi_terb_lebar;
      if (ukuran_cetak_panjang_1)
        obj.ukuran_cetak_panjang_1 = ukuran_cetak_panjang_1;
      if (ukuran_cetak_lebar_1) obj.ukuran_cetak_lebar_1 = ukuran_cetak_lebar_1;
      if (ukuran_cetak_bagian_1)
        obj.ukuran_cetak_bagian_1 = ukuran_cetak_bagian_1;
      if (ukuran_cetak_isi_1) obj.ukuran_cetak_isi_1 = ukuran_cetak_isi_1;
      if (ukuran_cetak_bbs_1) obj.ukuran_cetak_bbs_1 = ukuran_cetak_bbs_1;
      if (ukuran_cetak_panjang_2)
        obj.ukuran_cetak_panjang_2 = ukuran_cetak_panjang_2;
      if (ukuran_cetak_lebar_2) obj.ukuran_cetak_lebar_2 = ukuran_cetak_lebar_2;
      if (ukuran_cetak_bagian_2)
        obj.ukuran_cetak_bagian_2 = ukuran_cetak_bagian_2;
      if (ukuran_cetak_isi_2) obj.ukuran_cetak_isi_2 = ukuran_cetak_isi_2;
      if (ukuran_cetak_bbs_2) obj.ukuran_cetak_bbs_2 = ukuran_cetak_bbs_2;
      if (warna_depan) obj.warna_depan = parseFloat(warna_depan || "0");
      if (warna_belakang) obj.warna_belakang = warna_belakang;
      if (jumlah_warna) obj.jumlah_warna = jumlah_warna;
      if (jenis_kertas) obj.jenis_kertas = jenis_kertas;

      if (id_kertas) {
        //check data
        const checkData = await MasterBarang.findByPk(id_kertas);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "kertas tidak ditemukan",
          });
        obj.id_kertas = id_kertas;
        obj.nama_kertas = checkData.nama_barang;
        obj.brand_kertas = checkData.brand?.nama_brand;
        obj.gramature_kertas = checkData.gramatur;
        obj.panjang_kertas = checkData.panjang;
        obj.lebar_kertas = checkData.lebar;
        obj.persentase_kertas = checkData.persentase;
      }

      if (percentage)
        obj.persentase_apki_kertas = parseFloat(percentage || "0");
      if (total_kertas) obj.total_kertas = total_kertas;
      if (total_harga_kertas) obj.total_harga_kertas = total_harga_kertas;
      if (id_mesin_potong) {
        //check data
        const checkData = await MasterTahapanMesin.findByPk(id_mesin_potong, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin potong tidak ditemukan",
          });
        obj.id_mesin_potong = id_mesin_potong;
        obj.nama_mesin_potong = checkData.mesin?.nama_mesin;
      }
      if (print_insheet) obj.print_insheet = parseInt(print_insheet || "0");
      if (id_jenis_mesin_cetak) {
        //check data
        const checkData = await MasterBarang.findByPk(id_jenis_mesin_cetak);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin cetak tidak ditemukan",
          });
        obj.id_jenis_mesin_cetak = id_jenis_mesin_cetak;
        obj.jenis_mesin_cetak = checkData.nama_barang;
      }
      if (plate_cetak) obj.plate_cetak = plate_cetak;
      if (harga_plate) obj.harga_plate = harga_plate;
      if (jumlah_harga_cetak) obj.jumlah_harga_cetak = jumlah_harga_cetak;

      if (id_coating_depan) {
        //check data
        const checkData = await MasterBarang.findByPk(id_coating_depan);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "coating depan tidak ditemukan",
          });
        obj.id_coating_depan = id_coating_depan;
        obj.nama_coating_depan = checkData.nama_barang;
      }
      if (jumlah_harga_coating_depan)
        obj.jumlah_harga_coating_depan = jumlah_harga_coating_depan;

      if (id_coating_belakang) {
        //check data
        const checkData = await MasterBarang.findByPk(id_coating_belakang);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "coating belakang tidak ditemukan",
          });
        obj.id_coating_belakang = id_coating_belakang;
        obj.nama_coating_belakang = checkData.nama_barang;
      }
      if (jumlah_harga_coating_belakang)
        obj.jumlah_harga_coating_belakang = jumlah_harga_coating_belakang;
      if (total_harga_coating) obj.total_harga_coating = total_harga_coating;
      if (id_mesin_coating_depan) {
        //check data
        const checkData = await MasterBarang.findByPk(id_mesin_coating_depan);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin coating depan tidak ditemukan",
          });
        obj.id_mesin_coating_depan = id_mesin_coating_depan;
        obj.nama_mesin_coating_depan = checkData.nama_barang;
      }

      if (id_mesin_coating_belakang) {
        //check data
        const checkData = await MasterBarang.findByPk(
          id_mesin_coating_belakang
        );
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin coating belakang tidak ditemukan",
          });
        obj.id_mesin_coating_belakang = id_mesin_coating_belakang;
        obj.nama_mesin_coating_belakang = checkData.nama_barang;
      }
      if (pons_insheet) obj.pons_insheet = pons_insheet;
      if (id_jenis_pons) {
        //check data
        const checkData = await MasterBarang.findByPk(id_jenis_pons);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "jenis pons tidak ditemukan",
          });
        obj.id_jenis_pons = id_jenis_pons;
        obj.nama_jenis_pons = checkData.nama_barang;
      }
      if (id_mesin_pons) {
        //check data
        const checkData = await MasterTahapanMesin.findByPk(id_mesin_pons, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin pons tidak ditemukan",
          });
        obj.id_mesin_pons = id_mesin_pons;
        obj.nama_mesin_pons = checkData.mesin?.nama_mesin;
      }
      if (harga_pisau) obj.harga_pisau = parseFloat(harga_pisau || "0");
      if (ongkos_pons) obj.ongkos_pons = ongkos_pons;
      if (ongkos_pons_qty) obj.ongkos_pons_qty = ongkos_pons_qty;
      if (harga_satuan_ongkos_pons)
        obj.harga_satuan_ongkos_pons = harga_satuan_ongkos_pons;
      if (total_harga_ongkos_pons)
        obj.total_harga_ongkos_pons = total_harga_ongkos_pons;
      if (lipat) obj.lipat = lipat;

      if (id_mesin_lipat) {
        //check data
        const checkData = await MasterTahapanMesin.findByPk(id_mesin_lipat, {
          include: { model: MasterMesinTahapan, as: "mesin" },
        });
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin lipat tidak ditemukan",
          });
        obj.id_mesin_lipat = id_mesin_lipat;
        obj.nama_mesin_lipat = checkData.mesin?.nama_mesin;
      }
      if (qty_lipat) obj.qty_lipat = qty_lipat;
      if (harga_lipat) obj.harga_lipat = harga_lipat;
      if (potong_jadi) obj.potong_jadi = potong_jadi;
      if (qty_potong) obj.qty_potong = qty_potong;
      if (harga_potong_jadi) obj.harga_potong_jadi = harga_potong_jadi;
      if (finishing_insheet) obj.finishing_insheet = finishing_insheet;

      if (id_lem) {
        //check data
        const checkData = await MasterBarang.findByPk(id_lem);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Lem tidak ditemukan",
          });
        obj.id_lem = id_lem;
        obj.nama_lem = checkData.nama_barang;
      }
      if (jumlah_harga_lem) obj.jumlah_harga_lem = jumlah_harga_lem;
      if (id_mesin_finishing) {
        //check data
        const checkData = await MasterTahapanMesin.findByPk(
          id_mesin_finishing,
          {
            include: { model: MasterMesinTahapan, as: "mesin" },
          }
        );
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "mesin finishing tidak ditemukan",
          });
        obj.id_mesin_finishing = id_mesin_finishing;
        obj.nama_mesin_finishing = checkData.mesin?.nama_mesin;
      }
      if (foil) obj.foil = foil;
      if (harga_foil_manual) obj.harga_foil_manual = harga_foil_manual;
      if (spot_foil) obj.spot_foil = spot_foil;
      if (harga_spot_foil_manual)
        obj.harga_spot_foil_manual = harga_spot_foil_manual;
      if (harga_polimer_manual) obj.harga_polimer_manual = harga_polimer_manual;
      if (panjang_packaging) obj.panjang_packaging = panjang_packaging;
      if (lebar_packaging) obj.lebar_packaging = lebar_packaging;
      if (no_packaging) obj.no_packaging = no_packaging;
      if (jumlah_kirim) obj.jumlah_kirim = jumlah_kirim;
      if (harga_packaging) obj.harga_packaging = harga_packaging;
      if (harga_pengiriman) obj.harga_pengiriman = harga_pengiriman;
      if (jenis_packing) obj.jenis_packing = jenis_packing;
      if (id_packing) {
        //check data
        const checkData = await MasterBarang.findByPk(id_packing);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Packing tidak ditemukan",
          });
        obj.id_packing = id_packing;
        obj.nama_packing = checkData.nama_barang;
      }
      if (qty_packing) obj.qty_packing = qty_packing;
      if (harga_packing) obj.harga_packing = harga_packing;
      if (harga_produksi) obj.harga_produksi = harga_produksi;
      if (profit) obj.profit = profit;
      if (profit_harga) obj.profit_harga = profit_harga;
      if (jumlah_harga_jual) obj.jumlah_harga_jual = jumlah_harga_jual;
      if (ppn) obj.ppn = ppn;
      if (harga_ppn) obj.harga_ppn = harga_ppn;
      if (diskon) obj.diskon = diskon;
      if (harga_diskon) obj.harga_diskon = harga_diskon;
      if (total_harga) obj.total_harga = total_harga;
      if (harga_satuan) obj.harga_satuan = harga_satuan;
      if (total_harga_satuan_customer)
        obj.total_harga_satuan_customer = total_harga_satuan_customer;
      if (keterangan_kerja) obj.keterangan_kerja = keterangan_kerja;
      if (keterangan_harga) obj.keterangan_harga = keterangan_harga;

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

      await KalkulasiUserAction.create(
        {
          id_kalkulasi: checkData.id,
          id_user: req.user.id,
          status: "edited",
        },
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

const parseStringSparator = (value) => {
  // 1. Hapus semua titik (pemisah ribuan)
  value = value.replace(/\./g, "");

  // 2. Ganti koma menjadi titik
  value = value.replace(",", ".");

  return parseFloat(value);
};

module.exports = KalkulasiController;
