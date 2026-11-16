const db = require("../../../../config/database");
const { Op, Sequelize, where, literal } = require("sequelize");
const PembuatanStandarWarna = require("../../../../model/ppic/standarWarna/pembuatanStandarWarnaModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");

/* ---- nomor standar warna ----
 * Format      : CT-00001/CBL/0926  (urut 5 digit / CBL / bulan + 2 digit tahun)
 * Revisi      : CT-00001-1/CBL/0926, CT-00001-2/CBL/0926, ... (setiap reject)
 * Nomor urut  : reset per tahun, sama seperti nomor invoice
 */
const NO_PREFIX = "CT";
const NO_REGEX = /^CT-(\d+)(?:-(\d+))?\/CBL\/(\d{2})(\d{2})$/;

const formatNoStandarWarna = ({ urut, bulan, tahun, revisi = 0 }) =>
  `${NO_PREFIX}-${String(urut).padStart(5, "0")}${
    revisi > 0 ? `-${revisi}` : ""
  }/CBL/${bulan}${tahun}`;

// "CT-00012-3/CBL/0926" -> { urut: 12, revisi: 3, bulan: "09", tahun: "26" }
const parseNoStandarWarna = (no) => {
  const m = NO_REGEX.exec(no || "");
  if (!m) return null;
  return {
    urut: parseInt(m[1], 10),
    revisi: m[2] ? parseInt(m[2], 10) : 0,
    bulan: m[3],
    tahun: m[4],
  };
};

// nomor baru (revisi 0) berdasarkan tanggal, urut melanjutkan nomor terakhir di tahun yang sama
const generateNoStandarWarna = async ({ tanggal = new Date(), transaction } = {}) => {
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const tahun = String(tanggal.getFullYear()).slice(2);

  const last = await PembuatanStandarWarna.findOne({
    attributes: ["no_standar_warna"],
    where: { no_standar_warna: { [Op.like]: `${NO_PREFIX}-%/CBL/__${tahun}` } },
    order: [
      [
        // "CT-00012-3/CBL/0926" -> 12 (abaikan bagian revisi)
        literal(
          "CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING(no_standar_warna, 4), '/', 1), '-', 1) AS UNSIGNED)"
        ),
        "DESC",
      ],
      ["id", "DESC"],
    ],
    transaction,
  });

  const parsed = last ? parseNoStandarWarna(last.no_standar_warna) : null;
  return formatNoStandarWarna({
    urut: (parsed ? parsed.urut : 0) + 1,
    bulan,
    tahun,
  });
};

// nomor revisi dari nomor tiket yang di-reject: nomor sama, revisi diganti
const buildNoRevisi = (noSebelumnya, revisi) => {
  const parsed = parseNoStandarWarna(noSebelumnya);
  if (!parsed) return null;
  return formatNoStandarWarna({ ...parsed, revisi });
};

const PembuatanStandarWarnaService = {
  getPembuatanStandarWarnaService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    status_proses,
    search,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    is_active,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_standar_warna: { [Op.like]: `%${search}%` } },
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;
    // tiket yang di-reject lalu dibuat ulang menjadi tidak aktif
    if (is_active !== undefined && is_active !== null && is_active !== "")
      obj.is_active = is_active === true || is_active === "true";

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await PembuatanStandarWarna.count({ where: obj });
        const data = await PembuatanStandarWarna.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: SoModel,
              as: "so",
              attributes: ["po_qty"],
            },
          ],
        });
        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await PembuatanStandarWarna.findByPk(id);
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await PembuatanStandarWarna.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        status_code: 500,
        success: false,
        message: error.message,
      };
    }
  },

  createPembuatanStandarWarnaService: async ({
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      //cek data jo
      const dataJo = await JobOrder.findByPk(id_jo);
      if (!dataJo) {
        return {
          status_code: 404,
          success: false,
          message: "Data JO Tidak Ditemukan",
        };
      }
      //cek data io
      const dataIo = await IoModel.findByPk(id_io);
      if (!dataIo) {
        return {
          status_code: 404,
          success: false,
          message: "Data IO Tidak Ditemukan",
        };
      }
      //cek data so
      const dataSo = await SoModel.findByPk(id_so);
      // if (!dataSo) {
      //   return {
      //     status_code: 404,
      //     success: false,
      //     message: "Data SO Tidak Ditemukan",
      //   };
      // }
      //cek data customer
      const dataCustomer = await MasterCustomer.findByPk(id_customer);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataCustomer) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Customer Tidak Ditemukan",
      //     };
      //   }
      //cek data Produk
      const dataProduk = await MasterProduk.findByPk(id_produk);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataProduk) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Produk Tidak Ditemukan",
      //     };
      //   }

      // tiket sebelumnya untuk IO/SO yang sama: kalau di-reject untuk dibuat
      // ulang (rejected + tidak aktif), tiket ini adalah revisinya -> nomor sama
      // dengan revisi + 1. Selain itu nomor baru.
      const sebelumnya = await PembuatanStandarWarna.findOne({
        where: { id_io: id_io, id_so: id_so || null },
        order: [["id", "DESC"]],
        transaction: t,
      });

      // tiket revisi yang dibuat saat reject (masih berjalan) dan JO baru selesai
      // produksi -> tiket revisi itu diperbarui dengan data JO baru, tidak dobel
      if (
        sebelumnya &&
        sebelumnya.is_active &&
        sebelumnya.id_standar_warna_sebelumnya &&
        !["approved", "rejected"].includes(sebelumnya.status)
      ) {
        await PembuatanStandarWarna.update(
          {
            id_jo: id_jo,
            id_so: id_so,
            id_customer: id_customer,
            id_produk: id_produk,
            no_jo: dataJo?.no_jo || null,
            no_io: dataIo?.no_io || null,
            no_so: dataSo?.no_so || null,
            customer: dataCustomer?.nama_customer || null,
            produk: dataProduk?.nama_produk || null,
          },
          { where: { id: sebelumnya.id }, transaction: t }
        );
        if (!transaction) await t.commit();
        return {
          status_code: 200,
          success: true,
          message: "update revisi success",
          data: {
            id: sebelumnya.id,
            no_standar_warna: sebelumnya.no_standar_warna,
            revisi: sebelumnya.revisi,
          },
        };
      }

      let noStandarWarna = null;
      let revisi = 0;
      let idSebelumnya = null;
      let noteAwal = null;
      if (
        sebelumnya &&
        sebelumnya.status === "rejected" &&
        sebelumnya.is_active === false &&
        sebelumnya.no_standar_warna
      ) {
        revisi = (sebelumnya.revisi || 0) + 1;
        noStandarWarna = buildNoRevisi(sebelumnya.no_standar_warna, revisi);
        idSebelumnya = sebelumnya.id;
        // note reject tiket sebelumnya ikut ke tiket revisi
        noteAwal = sebelumnya.note || null;
      }
      if (!noStandarWarna) {
        revisi = 0;
        idSebelumnya = null;
        noteAwal = null;
        noStandarWarna = await generateNoStandarWarna({ transaction: t });
      }

      const created = await PembuatanStandarWarna.create(
        {
          no_standar_warna: noStandarWarna,
          revisi: revisi,
          id_standar_warna_sebelumnya: idSebelumnya,
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_jo: dataJo?.no_jo || null,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
          note: noteAwal,
        },
        { transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: {
          id: created.id,
          no_standar_warna: noStandarWarna,
          revisi: revisi,
        },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  nextPembuatanStandarWarnaService: async ({
    id,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await PembuatanStandarWarna.findByPk(id, {
        transaction: t,
      });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Pembuatan Standar Warna Tidak Ditemukan",
        };
      }
      await PembuatanStandarWarna.update(
        { status: "request marketing", id_user_qc: id_user },
        { where: { id: checkData.id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "next success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  approvePembuatanStandarWarnaService: async ({
    id,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await PembuatanStandarWarna.findByPk(id, {
        transaction: t,
      });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Pembuatan Standar Warna Tidak Ditemukan",
        };
      }
      await PembuatanStandarWarna.update(
        { status: "approved", status_proses: "done", id_user_approve: id_user },
        { where: { id: checkData.id }, transaction: t }
      );

      if (checkData.id_so) {
        //untuk update so
      } else {
        await IoModel.update(
          { status_send_proof: "done", is_send_proof: false },
          { where: { id: checkData.id_io }, transaction: t }
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "done success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  rejectPembuatanStandarWarnaService: async ({
    id,
    id_user,
    note,
    is_create_again,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await PembuatanStandarWarna.findByPk(id, {
        transaction: t,
      });
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Pembuatan Standar Warna Tidak Ditemukan",
        };
      }
      if (checkData.status === "approved") {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "Standar warna sudah approved, tidak bisa di-reject",
        };
      }
      // tiket yang sudah dibuatkan revisi tidak bisa di-reject lagi (cegah revisi dobel)
      const revisiBerikut = await PembuatanStandarWarna.findOne({
        attributes: ["id", "no_standar_warna"],
        where: { id_standar_warna_sebelumnya: checkData.id },
        transaction: t,
      });
      if (revisiBerikut) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: `Tiket ini sudah di-reject dan dibuat ulang menjadi ${revisiBerikut.no_standar_warna}`,
        };
      }

      await PembuatanStandarWarna.update(
        {
          status: "rejected",
          status_proses: "done",
          id_user_reject: id_user,
          note: note,
        },
        { where: { id: checkData.id }, transaction: t }
      );

      // default buat ulang; penolakan final hanya jika dikirim false secara eksplisit
      const buatUlang = !(is_create_again === false || is_create_again === "false");
      let tiketRevisi = null;
      if (buatUlang) {
        // tiket lama tidak aktif, lalu langsung dibuat tiket revisi (nomor sama +
        // revisi, data JO sama, note reject ikut). IO/SO tidak dikembalikan ke
        // marketing: revisi dikerjakan ulang dari tiket ini, bukan dari JO baru.
        await PembuatanStandarWarna.update(
          { is_active: false },
          { where: { id: checkData.id }, transaction: t }
        );
        const createRevisi =
          await PembuatanStandarWarnaService.createPembuatanStandarWarnaService({
            id_jo: checkData.id_jo,
            id_io: checkData.id_io,
            id_so: checkData.id_so,
            id_customer: checkData.id_customer,
            id_produk: checkData.id_produk,
            transaction: t,
          });
        if (createRevisi.success === false) {
          throw {
            status_code: createRevisi.status_code || 400,
            message: createRevisi.message,
          };
        }
        tiketRevisi = createRevisi.data;
      } else {
        await IoModel.update(
          { status_send_proof: "rejected", is_send_proof: false },
          { where: { id: checkData.id_io }, transaction: t }
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject success",
        // tiket revisi yang langsung dibuat (null kalau reject final)
        data: tiketRevisi,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        status_code: error.status_code || 500,
        success: false,
        message: error.message,
      };
    }
  },
};

PembuatanStandarWarnaService.formatNoStandarWarna = formatNoStandarWarna;
PembuatanStandarWarnaService.parseNoStandarWarna = parseNoStandarWarna;
PembuatanStandarWarnaService.generateNoStandarWarna = generateNoStandarWarna;
PembuatanStandarWarnaService.buildNoRevisi = buildNoRevisi;

module.exports = PembuatanStandarWarnaService;
