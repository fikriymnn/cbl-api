const db = require("../../../../config/database");
const { Op } = require("sequelize");
const MasterCoaModel = require("../../../../model/akunting/masterCoa/masterCoaModel");
const Users = require("../../../../model/userModel");

// tipe akun beserta default tipe_saldo & tipe_report jika tidak diisi
const TIPE_AKUN_DEFAULT = {
  "Cash/Bank": { tipe_saldo: "debit", tipe_report: "neraca" },
  "Account Receivable": { tipe_saldo: "debit", tipe_report: "neraca" },
  Inventory: { tipe_saldo: "debit", tipe_report: "neraca" },
  "Other Current Asset": { tipe_saldo: "debit", tipe_report: "neraca" },
  "Fixed Asset": { tipe_saldo: "debit", tipe_report: "neraca" },
  "Accumulated Depreciation": { tipe_saldo: "kredit", tipe_report: "neraca" },
  "Other Asset": { tipe_saldo: "debit", tipe_report: "neraca" },
  "Account Payable": { tipe_saldo: "kredit", tipe_report: "neraca" },
  "Other Current Liability": { tipe_saldo: "kredit", tipe_report: "neraca" },
  "Long Term Liability": { tipe_saldo: "kredit", tipe_report: "neraca" },
  Equity: { tipe_saldo: "kredit", tipe_report: "neraca" },
  Revenue: { tipe_saldo: "kredit", tipe_report: "laba rugi" },
  "Cost of Goods Sold": { tipe_saldo: "debit", tipe_report: "laba rugi" },
  Expense: { tipe_saldo: "debit", tipe_report: "laba rugi" },
  "Other Income": { tipe_saldo: "kredit", tipe_report: "laba rugi" },
  "Other Expense": { tipe_saldo: "debit", tipe_report: "laba rugi" },
};
const TIPE_AKUN = Object.keys(TIPE_AKUN_DEFAULT);
const TIPE_SALDO = ["debit", "kredit"];
const TIPE_REPORT = ["neraca", "laba rugi", "perubahan modal"];

// 3 tingkat: header (level 1) -> sub (level 2) -> detail (level 3)
const TIPE = ["header", "sub", "detail"];
const LEVEL_BY_TIPE = { header: 1, sub: 2, detail: 3 };
const PARENT_TIPE = { sub: "header", detail: "sub" };

// master coa: header & sub hanya sebagai grup, saldo grup = total saldo semua sub account,
// saldo detail = opening balance (tambahkan mutasi jurnal di sini saat modul jurnal tersedia)
const MasterCoaService = {
  getTipeAkunService: async () => {
    return {
      status: 200,
      success: true,
      data: TIPE_AKUN,
      tipe: TIPE,
      tipe_saldo: TIPE_SALDO,
      tipe_report: TIPE_REPORT,
      default_by_tipe_akun: TIPE_AKUN_DEFAULT,
    };
  },

  getMasterCoaService: async ({
    id,
    page,
    limit,
    search,
    tipe_akun,
    tipe,
    tipe_saldo,
    tipe_report,
    branch,
    show_inactive,
  }) => {
    const where = {};
    if (!isTrue(show_inactive)) where.is_active = true;
    if (search) {
      where[Op.or] = [
        { kode_akun: { [Op.like]: `%${search}%` } },
        { nama_akun: { [Op.like]: `%${search}%` } },
      ];
    }
    if (tipe_akun) where.tipe_akun = tipe_akun;
    if (tipe) where.tipe = tipe;
    if (tipe_saldo) where.tipe_saldo = tipe_saldo;
    if (tipe_report) where.tipe_report = tipe_report;
    if (branch) where.branch = branch;

    const include = [
      {
        model: MasterCoaModel,
        as: "parent",
        attributes: ["id", "kode_akun", "nama_akun"],
      },
      { model: Users, as: "user_create", attributes: ["id", "nama"] },
    ];

    try {
      if (id) {
        const data = await MasterCoaModel.findOne({
          where: { id },
          include,
        });
        return { status: 200, success: true, data };
      }

      if (page && limit) {
        const parsedLimit = parseInt(limit);
        const length = await MasterCoaModel.count({ where });
        const data = await MasterCoaModel.findAll({
          order: [["kode_akun", "ASC"]],
          limit: parsedLimit,
          offset: (parseInt(page) - 1) * parsedLimit,
          where,
          include,
        });
        return {
          status: 200,
          success: true,
          data,
          total_data: length,
          total_page: Math.ceil(length / parsedLimit),
        };
      }

      const data = await MasterCoaModel.findAll({
        order: [["kode_akun", "ASC"]],
        where,
        include,
      });
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // list bertingkat (header -> sub account) beserta saldo, seperti tampilan daftar akun
  getMasterCoaTreeService: async ({
    search,
    tipe_akun,
    branch,
    show_inactive,
  }) => {
    try {
      const accounts = await MasterCoaModel.findAll({
        attributes: [
          "id",
          "id_parent",
          "tipe_akun",
          "kode_akun",
          "nama_akun",
          "tipe",
          "tipe_saldo",
          "tipe_report",
          "level",
          "branch",
          "currency",
          "no_rekening",
          "opening_balance",
          "opening_balance_date",
          "is_active",
        ],
        order: [["kode_akun", "ASC"]],
        raw: true,
      });

      const tree = buildTree(accounts);
      const keyword = search ? search.toLowerCase() : null;
      const data = filterTree(tree, (node) => {
        if (!isTrue(show_inactive) && !node.is_active) return false;
        if (tipe_akun && node.tipe_akun !== tipe_akun) return false;
        if (branch && node.branch !== branch) return false;
        if (
          keyword &&
          !node.kode_akun.toLowerCase().includes(keyword) &&
          !node.nama_akun.toLowerCase().includes(keyword)
        ) {
          return "hidden";
        }
        return true;
      });

      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // pilihan "Sub Account of" sesuai tipe akun yang dibuat: sub -> header, detail -> sub,
  // tanpa tipe -> semua akun grup aktif (header & sub)
  getParentCoaService: async ({ tipe, tipe_akun, exclude_id }) => {
    if (tipe && !TIPE.includes(tipe)) {
      return { status: 400, success: false, message: "tipe tidak valid" };
    }
    if (tipe === "header") {
      return { status: 200, success: true, data: [] };
    }

    const where = {
      tipe: tipe ? PARENT_TIPE[tipe] : { [Op.in]: ["header", "sub"] },
      is_active: true,
    };
    if (tipe_akun) where.tipe_akun = tipe_akun;
    if (exclude_id) where.id = { [Op.ne]: exclude_id };

    try {
      const data = await MasterCoaModel.findAll({
        attributes: [
          "id",
          "id_parent",
          "tipe_akun",
          "kode_akun",
          "nama_akun",
          "tipe",
          "level",
        ],
        where,
        order: [["kode_akun", "ASC"]],
      });
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  createMasterCoaService: async ({
    id_create,
    id_parent,
    tipe_akun,
    kode_akun,
    nama_akun,
    tipe,
    tipe_saldo,
    tipe_report,
    branch,
    currency,
    no_rekening,
    note,
    opening_balance,
    opening_balance_date,
  }) => {
    const t = await db.transaction();

    try {
      const payload = await validatePayload(
        {
          id_parent,
          tipe_akun,
          kode_akun,
          nama_akun,
          tipe,
          tipe_saldo,
          tipe_report,
          opening_balance,
        },
        t,
      );

      const coa = await MasterCoaModel.create(
        {
          id_create,
          id_parent: payload.parent ? payload.parent.id : null,
          tipe_akun,
          kode_akun: payload.kode_akun,
          nama_akun: payload.nama_akun,
          tipe: payload.tipe,
          tipe_saldo: payload.tipe_saldo,
          tipe_report: payload.tipe_report,
          level: payload.level,
          branch: branch || "Main",
          currency: currency || "IDR",
          no_rekening,
          note,
          opening_balance: payload.opening_balance,
          opening_balance_date: opening_balance_date || null,
        },
        { transaction: t },
      );
      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: { id: coa.id, kode_akun: coa.kode_akun },
      };
    } catch (error) {
      await t.rollback();
      throw toServiceError(error);
    }
  },

  updateMasterCoaService: async ({
    id,
    id_parent,
    tipe_akun,
    kode_akun,
    nama_akun,
    tipe,
    tipe_saldo,
    tipe_report,
    branch,
    currency,
    no_rekening,
    note,
    opening_balance,
    opening_balance_date,
  }) => {
    const t = await db.transaction();

    try {
      const coa = await MasterCoaModel.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!coa) throwCoaError(404, "data coa tidak di temukan");

      const payload = await validatePayload(
        {
          id,
          id_parent: id_parent === undefined ? coa.id_parent : id_parent,
          tipe_akun: tipe_akun || coa.tipe_akun,
          kode_akun: kode_akun || coa.kode_akun,
          nama_akun: nama_akun || coa.nama_akun,
          tipe: tipe || coa.tipe,
          tipe_saldo: tipe_saldo === undefined ? coa.tipe_saldo : tipe_saldo,
          tipe_report:
            tipe_report === undefined ? coa.tipe_report : tipe_report,
          opening_balance:
            opening_balance === undefined
              ? coa.opening_balance
              : opening_balance,
        },
        t,
      );

      const children = await MasterCoaModel.findAll({
        attributes: ["id", "tipe_akun"],
        where: { id_parent: id },
        transaction: t,
      });
      // tipe sub account bergantung pada tipe parent, jadi tipe tidak boleh berubah jika punya sub account
      if (children.length && payload.tipe !== coa.tipe) {
        throwCoaError(
          400,
          "akun masih memiliki sub account, tipe tidak dapat diubah",
        );
      }
      const newTipeAkun = tipe_akun || coa.tipe_akun;
      if (children.some((child) => child.tipe_akun !== newTipeAkun)) {
        throwCoaError(
          400,
          "tipe akun tidak dapat diubah karena berbeda dengan sub account",
        );
      }

      await coa.update(
        {
          id_parent: payload.parent ? payload.parent.id : null,
          tipe_akun: newTipeAkun,
          kode_akun: payload.kode_akun,
          nama_akun: payload.nama_akun,
          tipe: payload.tipe,
          tipe_saldo: payload.tipe_saldo,
          tipe_report: payload.tipe_report,
          level: payload.level,
          branch: branch === undefined ? coa.branch : branch,
          currency: currency === undefined ? coa.currency : currency,
          no_rekening:
            no_rekening === undefined ? coa.no_rekening : no_rekening,
          note: note === undefined ? coa.note : note,
          opening_balance: payload.opening_balance,
          opening_balance_date:
            opening_balance_date === undefined
              ? coa.opening_balance_date
              : opening_balance_date || null,
        },
        { transaction: t },
      );

      await t.commit();
      return { status_code: 200, success: true, message: "update success" };
    } catch (error) {
      await t.rollback();
      throw toServiceError(error);
    }
  },

  setActiveMasterCoaService: async ({ id, is_active }) => {
    const t = await db.transaction();

    try {
      const coa = await MasterCoaModel.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!coa) throwCoaError(404, "data coa tidak di temukan");

      const active = isTrue(is_active);
      if (!active) {
        const activeChild = await MasterCoaModel.count({
          where: { id_parent: id, is_active: true },
          transaction: t,
        });
        if (activeChild) {
          throwCoaError(
            400,
            "nonaktifkan semua sub account terlebih dahulu sebelum menonaktifkan akun ini",
          );
        }
      } else if (coa.id_parent) {
        const parent = await MasterCoaModel.findByPk(coa.id_parent, {
          transaction: t,
        });
        if (parent && !parent.is_active) {
          throwCoaError(400, "akun parent masih nonaktif");
        }
      }

      await coa.update({ is_active: active }, { transaction: t });
      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: active ? "akun diaktifkan" : "akun dinonaktifkan",
      };
    } catch (error) {
      await t.rollback();
      throw toServiceError(error);
    }
  },

  deleteMasterCoaService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const coa = await MasterCoaModel.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!coa) throwCoaError(404, "data coa tidak di temukan");

      const childCount = await MasterCoaModel.count({
        where: { id_parent: id },
        transaction: t,
      });
      if (childCount) {
        throwCoaError(
          400,
          "akun masih memiliki sub account, tidak dapat dihapus",
        );
      }

      await coa.destroy({ transaction: t });
      await t.commit();
      return { status_code: 200, success: true, message: "delete success" };
    } catch (error) {
      await t.rollback();
      throw toServiceError(error);
    }
  },
};

async function validatePayload(
  {
    id,
    id_parent,
    tipe_akun,
    kode_akun,
    nama_akun,
    tipe,
    tipe_saldo,
    tipe_report,
    opening_balance,
  },
  transaction,
) {
  if (!TIPE_AKUN.includes(tipe_akun))
    throwCoaError(400, "tipe akun tidak valid");
  if (!TIPE.includes(tipe)) {
    throwCoaError(400, "tipe harus header, sub atau detail");
  }

  // kosong -> pakai default sesuai tipe akun
  const saldo = tipe_saldo || TIPE_AKUN_DEFAULT[tipe_akun].tipe_saldo;
  const report = tipe_report || TIPE_AKUN_DEFAULT[tipe_akun].tipe_report;
  if (!TIPE_SALDO.includes(saldo)) {
    throwCoaError(400, `tipe saldo harus ${TIPE_SALDO.join(" atau ")}`);
  }
  if (!TIPE_REPORT.includes(report)) {
    throwCoaError(400, `tipe report harus ${TIPE_REPORT.join(" atau ")}`);
  }

  const code = kode_akun ? String(kode_akun).trim() : "";
  const name = nama_akun ? String(nama_akun).trim() : "";
  if (!code) throwCoaError(400, "kode akun wajib diisi");
  if (!name) throwCoaError(400, "deskripsi akun wajib diisi");

  const duplicate = await MasterCoaModel.findOne({
    attributes: ["id"],
    where: { kode_akun: code, ...(id ? { id: { [Op.ne]: id } } : {}) },
    transaction,
  });
  if (duplicate) throwCoaError(400, `kode akun ${code} sudah digunakan`);

  // header tanpa parent, sub wajib di bawah header, detail wajib di bawah sub
  let parent = null;
  if (tipe === "header") {
    if (id_parent)
      throwCoaError(400, "akun header tidak boleh memiliki parent");
  } else {
    const parentTipe = PARENT_TIPE[tipe];
    if (!id_parent) {
      throwCoaError(
        400,
        `akun ${tipe} wajib memiliki parent akun ${parentTipe}`,
      );
    }
    parent = await MasterCoaModel.findByPk(id_parent, { transaction });
    if (!parent) throwCoaError(404, "akun parent tidak di temukan");
    if (id && Number(parent.id) === Number(id)) {
      throwCoaError(400, "akun parent tidak boleh akun itu sendiri");
    }
    if (parent.tipe !== parentTipe) {
      throwCoaError(
        400,
        `akun ${tipe} hanya dapat dibuat di bawah akun ${parentTipe}`,
      );
    }
    if (parent.tipe_akun !== tipe_akun) {
      throwCoaError(400, "tipe akun harus sama dengan akun parent");
    }
  }

  // header & sub hanya grup, saldo awalnya selalu 0
  const balance = tipe === "detail" ? Number(opening_balance || 0) : 0;
  if (!Number.isFinite(balance))
    throwCoaError(400, "opening balance tidak valid");

  return {
    parent,
    kode_akun: code,
    nama_akun: name,
    tipe,
    tipe_saldo: saldo,
    tipe_report: report,
    level: LEVEL_BY_TIPE[tipe],
    opening_balance: balance,
  };
}

function buildTree(accounts) {
  const map = new Map();
  accounts.forEach((account) => {
    map.set(account.id, {
      ...account,
      is_active: Boolean(account.is_active),
      opening_balance: Number(account.opening_balance || 0),
      balance: 0,
      sub_account: [],
    });
  });

  const roots = [];
  map.forEach((node) => {
    const parent = node.id_parent ? map.get(node.id_parent) : null;
    if (parent) parent.sub_account.push(node);
    else roots.push(node);
  });

  const sumBalance = (node) => {
    node.balance =
      node.tipe === "detail"
        ? node.opening_balance
        : node.sub_account.reduce(
            (total, child) => total + sumBalance(child),
            0,
          );
    node.balance = Math.round(node.balance * 10000) / 10000;
    return node.balance;
  };
  roots.forEach(sumBalance);

  return roots;
}

// predicate: true = tampil, false = buang beserta sub account-nya,
// "hidden" = tampil hanya jika ada sub account yang cocok (dipakai untuk search)
function filterTree(nodes, predicate) {
  return nodes.reduce((result, node) => {
    const match = predicate(node);
    if (match === false) return result;

    const sub_account = filterTree(node.sub_account, predicate);
    if (match === "hidden" && !sub_account.length) return result;

    result.push({ ...node, sub_account });
    return result;
  }, []);
}

function isTrue(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function throwCoaError(statusCode, message) {
  throw { status_code: statusCode, message };
}

function toServiceError(error) {
  return {
    status_code: error.status_code || 500,
    success: false,
    message: error.message,
  };
}

module.exports = MasterCoaService;
