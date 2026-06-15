const { Op, fn, col, literal } = require("sequelize");
const ProduksiLkhTahapan = require("../../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkhProses = require("../../../model/produksi/produksiLkhProsesModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const IoModel = require("../../../model/marketing/io/ioModel");
const ioMountingModel = require("../../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const SoModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../../model/ppic/jobOrder/joUserActionModel");
const BomPpicUserAction = require("../../../model/ppic/bomPpic/bomPpicUserActionModel");
const MasterSettingKapasitas = require("../../../model/masterData/ppic/masterKategoriSettingKapasitasModel");
const BomModel = require("../../../model/ppic/bom/bomModel");
const BomPpicModel = require("../../../model/ppic/bomPpic/bomPpicModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const soModel = require("../../../model/marketing/so/soModel");
const JadwalProduksiService = require("../jadwalProduksiTiket/service/jadwalProduksiService");
const TiketJadwalProduksi = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");

const BomController = {
  getJobOrder: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      status_proses,
      search,
      sort = "newest",
      is_open_label,
      is_get_label,
    } = req.query;
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
      obj.tgl_kirim = { [Op.between]: [startDate, endDate] };
    }

    if (is_open_label) {
      obj.is_open_label = is_open_label === "true" ? true : false;
    }

    // Jika ada filter tanggal, order by tgl_kirim, jika tidak order by createdAt
    const orderField = start_date && end_date ? "tgl_kirim" : "createdAt";
    const orderDirection = sort === "oldest" ? "ASC" : "DESC";
    const orderClause = [[orderField, orderDirection]];

    try {
      if (page && limit) {
        const length = await JobOrder.count({ where: obj });
        const data = await JobOrder.findAll({
          order: orderClause,
          limit: parseInt(limit),
          include: [
            {
              model: soModel,
              as: "so",
              attributes: ["status_produk"],
            },
            {
              model: JobOrderMounting,
              as: "jo_mounting",
              include: [
                {
                  model: ioMountingModel,
                  as: "io_mounting",
                  attributes: [
                    "ukuran_jadi_panjang",
                    "ukuran_jadi_lebar",
                    "ukuran_jadi_tinggi",
                    "ukuran_jadi_terb_panjang",
                    "ukuran_jadi_terb_lebar",
                    "warna_depan",
                    "warna_belakang",
                    "jumlah_warna",
                    "keterangan_warna_depan",
                    "keterangan_warna_belakang",
                    "file",
                    "spesifikasi",
                  ],
                  include: {
                    model: IoTahapan,
                    as: "tahapan",
                    include: [
                      { model: MasterTahapanMesin, as: "tahapan_mesin" },
                    ],
                  },
                },
              ],
            },
            {
              model: TiketJadwalProduksi,
              as: "tiket_jadwal_produksi",
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
              model: soModel,
              as: "so",
              attributes: [
                "status_produk",
                "no_po_customer",
                "tgl_po_customer",
                "tgl_pengiriman",
              ],
            },
            {
              model: JobOrderMounting,
              as: "jo_mounting",
              include: [
                {
                  model: ioMountingModel,
                  as: "io_mounting",
                  attributes: [
                    "ukuran_jadi_panjang",
                    "ukuran_jadi_lebar",
                    "ukuran_jadi_tinggi",
                    "ukuran_jadi_terb_panjang",
                    "ukuran_jadi_terb_lebar",
                    "warna_depan",
                    "warna_belakang",
                    "jumlah_warna",
                    "keterangan_warna_belakang",
                    "file",
                    "spesifikasi",
                  ],
                  include: {
                    model: IoTahapan,
                    as: "tahapan",
                    include: [
                      { model: MasterTahapanMesin, as: "tahapan_mesin" },
                    ],
                  },
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
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
        });
      } else if (is_get_label == true || is_get_label == "true") {
        const tahapanCetak = await MasterTahapan.findAll({
          where: { nama_tahapan: { [Op.like]: "%cetak%" } },
          attributes: ["id"],
        });
        const idTahapanCetak = tahapanCetak.map((t) => t.id);
        const data = await JobOrder.findAll({
          order: orderClause,
          include: [
            {
              model: JobOrderMounting,
              as: "jo_mounting",
              attributes: [
                "id",
                "id_io_mounting",
                "nama_mounting",
                "is_selected",
              ],
              include: {
                model: ioMountingModel,
                as: "io_mounting",
                attributes: ["id", "nama_mounting", "isi_dalam_1_pack"],
              },
            },
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              attributes: [
                "id",
                "id_tahapan",
                "waktu_mulai",
                "kode",
                "deskripsi",
              ],
              limit: 1,
              order: [["waktu_mulai", "ASC"]],
              where: {
                is_active: true,
                id_tahapan: { [Op.in]: idTahapanCetak },
              },
              separate: true,
            },

            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses_awal",
              attributes: [
                "id",
                "id_tahapan",
                "waktu_mulai",
                "kode",
                "deskripsi",
              ],
              where: {
                is_active: true,
              },
              limit: 1,
              order: [["waktu_mulai", "ASC"]],
              separate: true,
              required: false,
            },
          ],
          where: obj,
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
        });
      } else {
        const data = await JobOrder.findAll({
          order: orderClause,
          include: [
            {
              model: JobOrderMounting,
              as: "jo_mounting",
              attributes: [
                "id",
                "id_io_mounting",
                "nama_mounting",
                "is_selected",
              ],
              include: {
                model: ioMountingModel,
                as: "io_mounting",
                attributes: ["id", "nama_mounting", "isi_dalam_1_pack"],
              },
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

      const length = await JobOrder.findOne({
        where: {
          // Filter hanya format baru yang mengandung '/' (SO-01319/CBL/1025)
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SO-01319/CBL/1025
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_jo, 5), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      const lengthProof = await JobOrder.findOne({
        where: {
          // Filter hanya format baru yang mengandung '/' (SO-01319/CBL/1025)
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
          no_jo: {
            [Op.like]: "%P%", // hanya ambil yang ada karakter 'P'
          },
          tipe_jo: "JO PROOF",
        },
        order: [
          // extract nomor urut pada format SO-01319/CBL/1025
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_jo, 5), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      let number = 0;
      let numberProof = 0;

      if (length) {
        const lastNo = length.no_jo; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        number = lastSeq;
      }

      if (lengthProof) {
        const lastNo = lengthProof.no_jo; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        numberProof = lastSeq;
      }

      return res.status(200).json({
        succes: true,
        status_code: 200,
        total_data: number,
        total_data_proof: numberProof,
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
      let checkData = null;
      let id_so_update = null;
      let status_jo_update = null;
      if (id_so && id_so != "") {
        checkData = await SoModel.findByPk(id_so);
        id_so_update = id_so;
        status_jo_update = checkData.status_jo;
      } else {
        checkData = await IoModel.findByPk(id_io);
        status_jo_update = checkData.status_io;
      }

      if (!checkData && id_so && id_so != "") {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data SO tidak ditemukan",
        });
      } else if (!checkData && id_io && id_io != "") {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data IO tidak ditemukan",
        });
      }

      let checkBom = null;
      let checkBomPpic = null;

      if (id_so && id_so != "") {
        checkBom = await BomModel.findOne({
          where: { id_so: checkData.id },
        });
        checkBomPpic = await BomPpicModel.findOne({
          where: { id_so: checkData.id },
        });
      } else {
        checkBom = await BomModel.findOne({
          where: { id_io: checkData.id },
        });
        checkBomPpic = await BomPpicModel.findOne({
          where: { id_io: checkData.id },
        });
      }

      const dataJobOrder = await JobOrder.create(
        {
          id_io,
          id_so: id_so_update,
          id_customer: checkData.id_customer,
          id_produk: checkData.id_produk,
          id_create_jo: req.user.id,
          no_jo,
          no_io,
          no_so,
          customer,
          produk,
          status_kalkulasi,
          status_jo: status_jo_update,
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
          label: checkData.label,
        },
        { transaction: t },
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

      if (id_so && id_so != "") {
        await SoModel.update(
          { is_jo_done: true },
          { where: { id: id_so }, transaction: t },
        );
      } else {
        await IoModel.update(
          {
            status_send_proof: "progress",
          },
          { where: { id: id_io }, transaction: t },
        );
      }

      if (checkBom) {
        await BomModel.update(
          {
            id_jo: dataJobOrder.id,
            no_jo: dataJobOrder.no_jo,
          },
          { where: { id: checkBom.id }, transaction: t },
        );
      }
      if (checkBomPpic) {
        await BomPpicModel.update(
          {
            id_jo: dataJobOrder.id,
            no_jo: dataJobOrder.no_jo,
          },
          { where: { id: checkBomPpic.id }, transaction: t },
        );
      }

      //fungsi create tiket jadwal produksi
      let dataSo = null;
      let dataIo = null;
      if (id_so && id_so != "") {
        dataSo = await soModel.findByPk(id_so);
      } else {
        dataSo = await IoModel.findByPk(id_io);
      }

      const dataMountingSelected = jo_mounting.find(
        (e) => e.is_selected === true,
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
        },
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
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const createTiketJadwal =
        await JadwalProduksiService.creteJadwalProduksiService(
          produk,
          no_jo,
          null,
          dataSo?.no_po_customer,
          no_io,
          customer,
          dataMountingSelected.nama_kertas,
          formatDate(tgl_kirim),
          dataSo?.tgl_pembuatan_so
            ? formatDate(dataSo?.tgl_pembuatan_so)
            : null,
          null,
          po_qty || 0,
          qty || 0,
          qty_druk || 0,
          qty_lp || 0,
          dataTahapanMounting,
          dataJobOrder.id,
          t,
        );

      if (createTiketJadwal.success === false) {
        await t.rollback();

        return res.status(400).json({
          succes: false,
          status_code: 400,
          msg: createTiketJadwal.msg,
        });
      }

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

  createJobOrderKanban: async (req, res) => {
    const { job_orders } = req.body; // array of job order objects
    const t = await db.transaction();

    try {
      if (
        !job_orders ||
        !Array.isArray(job_orders) ||
        job_orders.length === 0
      ) {
        return res.status(400).json({
          succes: false,
          status_code: 400,
          msg: "Data job_orders harus berupa array dan tidak boleh kosong",
        });
      }

      const results = [];

      for (let idx = 0; idx < job_orders.length; idx++) {
        const {
          id_io,
          id_so,
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
        } = job_orders[idx];

        const isKanban = tipe_jo === "JO KANBAN";

        // ── 1. Validasi & ambil data SO / IO ──────────────────────────────────
        let checkData = null;
        let id_so_update = null;
        let status_jo_update = null;

        if (id_so && id_so != "") {
          checkData = await SoModel.findByPk(id_so);
          id_so_update = id_so;
          status_jo_update = checkData?.status_jo;
        } else {
          checkData = await IoModel.findByPk(id_io);
          status_jo_update = checkData?.status_io;
        }

        if (!checkData && id_so && id_so != "") {
          await t.rollback();
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: `[JO ke-${idx + 1}] Data SO tidak ditemukan`,
          });
        } else if (!checkData && id_io && id_io != "") {
          await t.rollback();
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: `[JO ke-${idx + 1}] Data IO tidak ditemukan`,
          });
        }

        // ── 2. Cek BOM (skip jika KANBAN) ────────────────────────────────────
        let checkBom = null;
        let checkBomPpic = null;

        if (!isKanban) {
          if (id_so && id_so != "") {
            checkBom = await BomModel.findOne({
              where: { id_so: checkData.id },
            });
            checkBomPpic = await BomPpicModel.findOne({
              where: { id_so: checkData.id },
            });
          } else {
            checkBom = await BomModel.findOne({
              where: { id_io: checkData.id },
            });
            checkBomPpic = await BomPpicModel.findOne({
              where: { id_io: checkData.id },
            });
          }
        }

        //status, jika kanban langsung masuk history
        let status = "draft";
        let statusProses = "draft";
        if (isKanban) {
          status = "history";
          statusProses = "done";
        }

        // ── 3. Create Job Order ───────────────────────────────────────────────
        const dataJobOrder = await JobOrder.create(
          {
            id_io,
            id_so: id_so_update,
            id_customer: checkData.id_customer,
            id_produk: checkData.id_produk,
            id_create_jo: req.user.id,
            no_jo,
            no_io,
            no_so,
            customer,
            produk,
            status_kalkulasi,
            status_jo: status_jo_update,
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
            label: checkData.label,
            status: status,
            status_proses: statusProses,
          },
          { transaction: t },
        );

        // ── 4. Create JO Mounting ─────────────────────────────────────────────
        if (jo_mounting && jo_mounting.length > 0) {
          const dataJoMounting = jo_mounting.map((e) => ({
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
          }));

          await JobOrderMounting.bulkCreate(dataJoMounting, { transaction: t });
        }

        // ── 5. Update SO / IO ─────────────────────────────────────────────────
        if (id_so && id_so != "") {
          await SoModel.update(
            { is_jo_done: true },
            { where: { id: id_so }, transaction: t },
          );
        } else {
          await IoModel.update(
            { status_send_proof: "progress" },
            { where: { id: id_io }, transaction: t },
          );
        }

        // ── 6. Update BOM & BOM PPIC (skip jika KANBAN) ───────────────────────
        if (!isKanban) {
          if (checkBom) {
            await BomModel.update(
              { id_jo: dataJobOrder.id, no_jo: dataJobOrder.no_jo },
              { where: { id: checkBom.id }, transaction: t },
            );
          }
          if (checkBomPpic) {
            await BomPpicModel.update(
              { id_jo: dataJobOrder.id, no_jo: dataJobOrder.no_jo },
              { where: { id: checkBomPpic.id }, transaction: t },
            );
          }

          // ── 7. Create Tiket Jadwal Produksi (skip jika KANBAN) ─────────────
          let dataSo = null;
          if (id_so && id_so != "") {
            dataSo = await soModel.findByPk(id_so);
          } else {
            dataSo = await IoModel.findByPk(id_io);
          }

          const dataMountingSelected = jo_mounting.find(
            (e) => e.is_selected === true,
          );
          const dataIoMountingSelected = await ioMountingModel.findByPk(
            dataMountingSelected.id_io_mounting,
            { include: [{ model: IoTahapan, as: "tahapan" }] },
          );

          const dataTahapanMounting = dataIoMountingSelected.tahapan.map(
            (e) => ({
              tahapan: e.nama_proses,
              tahapan_ke: e.index,
              nama_kategori: e.nama_setting_kapasitas,
              kategori: e.nama_kapasitas,
              kategori_drying_time: e.nama_drying_time,
              mesin: e.nama_mesin,
              kapasitas_per_jam: e.value_kapasitas,
              drying_time: e.value_drying_time,
              setting: e.value_setting,
              toleransi: 0,
            }),
          );

          function formatDate(dateStr, locale = "en-GB") {
            const date = new Date(dateStr);
            return date.toLocaleDateString(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }

          const createTiketJadwal =
            await JadwalProduksiService.creteJadwalProduksiService(
              produk,
              no_jo,
              null,
              dataSo?.no_po_customer,
              no_io,
              customer,
              dataMountingSelected.nama_kertas,
              formatDate(tgl_kirim),
              dataSo?.tgl_pembuatan_so
                ? formatDate(dataSo?.tgl_pembuatan_so)
                : null,
              null,
              po_qty || 0,
              qty || 0,
              qty_druk || 0,
              qty_lp || 0,
              dataTahapanMounting,
              dataJobOrder.id,
              t,
            );

          if (createTiketJadwal.success === false) {
            await t.rollback();
            return res.status(400).json({
              succes: false,
              status_code: 400,
              msg: `[JO ke-${idx + 1}] ${createTiketJadwal.msg}`,
            });
          }
        }

        results.push(dataJobOrder);
      }

      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successfully",
        data: results,
      });
    } catch (error) {
      await t.rollback();
      console.log(error);
      return res.status(400).json({
        succes: false,
        status_code: 400,
        msg: error.message,
      });
    }
  },

  sendToJadwal: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      const dataJobOrder = await JobOrder.findByPk(_id, {
        include: [
          {
            model: JobOrderMounting,
            as: "jo_mounting",
            where: { is_selected: true, is_active: true },
          },
        ],
      });

      if (!dataJobOrder) {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data JO tidak ditemukan",
        });
      }
      const dataSo = await soModel.findByPk(dataJobOrder.id_so);

      if (!dataSo) {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data SO tidak ditemukan",
        });
      }

      const dataMountingSelected = dataJobOrder?.jo_mounting.find(
        (e) => e.is_selected === true,
      );

      if (!dataMountingSelected) {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Mounting tidak ditemukan",
        });
      }

      const dataIoMountingSelected = await ioMountingModel.findByPk(
        dataMountingSelected.id_io_mounting,
        {
          include: [
            {
              model: IoTahapan,
              as: "tahapan",
            },
          ],
        },
      );

      await TiketJadwalProduksi.update(
        { is_send_again: true },
        {
          where: {
            no_jo: dataJobOrder.no_jo,
            status_tiket: "canceled",
            is_send_again: false,
          },
          transaction: t,
        },
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
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const createTiketJadwal =
        await JadwalProduksiService.creteJadwalProduksiService(
          dataJobOrder.produk,
          dataJobOrder.no_jo,
          null,
          dataSo.no_po_customer,
          dataJobOrder.no_io,
          dataJobOrder.customer,
          dataMountingSelected.nama_kertas,
          formatDate(dataJobOrder.tgl_kirim),
          formatDate(dataSo.tgl_pembuatan_so),
          null,
          dataJobOrder.po_qty || 0,
          dataJobOrder.qty || 0,
          dataJobOrder.qty_druk || 0,
          dataJobOrder.qty_lp || 0,
          dataTahapanMounting,
          dataJobOrder.id,
          t,
        );

      if (createTiketJadwal.success === false) {
        await t.rollback();

        return res.status(400).json({
          succes: false,
          status_code: 400,
          msg: createTiketJadwal.msg,
        });
      }

      await t.commit();
      res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "send Successfully",
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
        { where: { id: _id }, transaction: t },
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
          if (e.id) {
            await JobOrderMounting.update(jo_mounting[i], {
              where: { id: e.id },
              transaction: t,
            });
          } else {
            await JobOrderMounting.create(
              {
                id_jo: _id,
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
              },
              { transaction: t },
            );
          }
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
      (await JobOrder.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await JobOrderUserAction.create(
          { id_jo: checkData.id, id_user: req.user.id, status: "requested" },
          { transaction: t },
        ));
      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Request Successful" }));
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
            where: { is_active: true, is_selected: true },
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
      const checkDataBomPpic = await BomPpicModel.findOne({
        where: { id_jo: checkData.id },
      });
      // if (!checkDataBomPpic)
      //   return res.status(404).json({
      //     succes: false,
      //     status_code: 404,
      //     msg: "Data BOM PPIC tidak ditemukan",
      //   });

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
        },
      );
      await JobOrder.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_jo: req.user.id,
          tgl_approve_jo: new Date(),
          is_open_label: true,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      if (checkDataBomPpic) {
        await BomPpicModel.update(
          {
            status: "history",
            status_proses: "done",
            id_approve_bom_ppic: req.user.id,
            tgl_approve_bom_ppic: new Date(),
          },
          {
            where: { id: checkDataBomPpic.id },
            transaction: t,
          },
        );
      }
      await JobOrderUserAction.create(
        { id_jo: checkData.id, id_user: req.user.id, status: "approve" },
        { transaction: t },
      );

      if (checkData.tipe_jo != "JO KANBAN") {
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
            { transaction: t },
          );
        }
      }

      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" }));
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
      const checkDataBomPpic = await BomPpicModel.findOne({
        where: { id_jo: checkData.id },
      });
      // if (!checkDataBomPpic)
      //   return res.status(404).json({
      //     succes: false,
      //     status_code: 404,
      //     msg: "Data BOM PPIC tidak ditemukan",
      //   });
      await JobOrder.update(
        {
          status_proses: "reject kabag",
          status: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );
      if (checkDataBomPpic) {
        await BomPpicModel.update(
          {
            status_proses: "reject kabag",
            status: "draft",
            note_reject: note_reject,
          },
          {
            where: { id: checkDataBomPpic.id },
            transaction: t,
          },
        );

        await BomPpicUserAction.create(
          {
            id_bom: checkDataBomPpic.id,
            id_user: req.user.id,
            status: "kabag reject",
          },
          { transaction: t },
        );
      }
      await JobOrderUserAction.create(
        {
          id_jo: checkData.id,
          id_user: req.user.id,
          status: "kabag reject",
        },
        { transaction: t },
      );
      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "reject Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  openLabelJobOrder: async (req, res) => {
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
          is_open_label: true,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );
      await t.commit();
      res
        .status(200)
        .json({ succes: true, status_code: 200, msg: "Open Label Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  closeLabelJobOrder: async (req, res) => {
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
          is_open_label: false,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );
      await t.commit();
      res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Close Label Successful",
      });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = BomController;
