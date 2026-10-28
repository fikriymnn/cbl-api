const db = require("../../../../config/database");
const { Op } = require("sequelize");
const MasterCoaModel = require("../../../../model/akunting/masterCoa/masterCoaModel");
const Users = require("../../../../model/userModel");

const TIPE_AKUN = [
  "Cash/Bank",
  "Account Receivable",
  "Inventory",
  "Other Current Asset",
  "Fixed Asset",
  "Accumulated Depreciation",
  "Other Asset",
  "Account Payable",
  "Other Current Liability",
  "Long Term Liability",
  "Equity",
  "Revenue",
  "Cost of Goods Sold",
  "Expense",
  "Other Income",
  "Other Expense",
];

// master coa: header hanya sebagai grup, saldo header = total saldo semua sub account,
// saldo detail = opening balance (tambahkan mutasi jurnal di sini saat modul jurnal tersedia)
const MasterCoaService = {
  getTipeAkunService: async () => {
    return { status: 200, success: true, data: TIPE_AKUN };
  },

  getMasterCoaService: async ({
    id,
    page,
    limit,
    search,
    tipe_akun,
    tipe,
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
  getMasterCoaTreeService: async ({ search, tipe_akun, branch, show_inactive }) => {
    try {
      const accounts = await MasterCoaModel.findAll({
        attributes: [
          "id",
          "id_parent",
          "tipe_akun",
          "kode_akun",
          "nama_akun",
          "tipe",
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

  // pilihan "Sub Account of": hanya akun header aktif
  getParentCoaService: async ({ tipe_akun, exclude_id }) => {
    const where = { tipe: "header", is_active: true };
    if (tipe_akun) where.tipe_akun = tipe_akun;
    if (exclude_id) where.id = { [Op.ne]: exclude_id };

    try {
      const data = await MasterCoaModel.findAll({
        attributes: ["id", "id_parent", "tipe_akun", "kode_akun", "nama_akun", "level"],
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
          level: payload.parent ? payload.parent.level + 1 : 1,
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
          opening_balance:
            opening_balance === undefined ? coa.opening_balance : opening_balance,
        },
        t,
      );

      const children = await MasterCoaModel.findAll({
        attributes: ["id", "tipe_akun"],
        where: { id_parent: id },
        transaction: t,
      });
      if (children.length && payload.tipe === "detail") {
        throwCoaError(
          400,
          "akun masih memiliki sub account, tidak dapat diubah menjadi detail",
        );
      }
      const newTipeAkun = tipe_akun || coa.tipe_akun;
      if (children.some((child) => child.tipe_akun !== newTipeAkun)) {
        throwCoaError(
          400,
          "tipe akun tidak dapat diubah karena berbeda dengan sub account",
        );
      }

      const newLevel = payload.parent ? payload.parent.level + 1 : 1;
      await coa.update(
        {
          id_parent: payload.parent ? payload.parent.id : null,
          tipe_akun: newTipeAkun,
          kode_akun: payload.kode_akun,
          nama_akun: payload.nama_akun,
          tipe: payload.tipe,
          level: newLevel,
          branch: branch === undefined ? coa.branch : branch,
          currency: currency === undefined ? coa.currency : currency,
          no_rekening: no_rekening === undefined ? coa.no_rekening : no_rekening,
          note: note === undefined ? coa.note : note,
          opening_balance: payload.opening_balance,
          opening_balance_date:
            opening_balance_date === undefined
              ? coa.opening_balance_date
              : opening_balance_date || null,
        },
        { transaction: t },
      );
      await updateChildrenLevel(id, newLevel, t);

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
            "nonaktifkan semua sub account terlebih dahulu sebelum menonaktifkan akun header",
          );
        }
      } else if (coa.id_parent) {
        const parent = await MasterCoaModel.findByPk(coa.id_parent, {
          transaction: t,
        });
        if (parent && !parent.is_active) {
          throwCoaError(400, "akun header (parent) masih nonaktif");
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
        throwCoaError(400, "akun masih memiliki sub account, tidak dapat dihapus");
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
  { id, id_parent, tipe_akun, kode_akun, nama_akun, tipe, opening_balance },
  transaction,
) {
  if (!TIPE_AKUN.includes(tipe_akun)) throwCoaError(400, "tipe akun tidak valid");
  if (!["header", "detail"].includes(tipe)) {
    throwCoaError(400, "tipe harus header atau detail");
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

  let parent = null;
  if (id_parent) {
    parent = await MasterCoaModel.findByPk(id_parent, { transaction });
    if (!parent) throwCoaError(404, "akun parent tidak di temukan");
    if (parent.tipe !== "header") {
      throwCoaError(400, "sub account hanya dapat dibuat di bawah akun header");
    }
    if (parent.tipe_akun !== tipe_akun) {
      throwCoaError(400, "tipe akun harus sama dengan akun parent");
    }
    if (id && (await isDescendant(parent.id, id, transaction))) {
      throwCoaError(400, "akun parent tidak boleh akun itu sendiri atau sub account-nya");
    }
  }

  // header hanya grup, saldo awalnya selalu 0
  const balance = tipe === "header" ? 0 : Number(opening_balance || 0);
  if (!Number.isFinite(balance)) throwCoaError(400, "opening balance tidak valid");

  return {
    parent,
    kode_akun: code,
    nama_akun: name,
    tipe,
    opening_balance: balance,
  };
}

// true jika candidateId adalah rootId atau turunan dari rootId
async function isDescendant(candidateId, rootId, transaction) {
  let currentId = candidateId;
  while (currentId) {
    if (Number(currentId) === Number(rootId)) return true;
    const node = await MasterCoaModel.findByPk(currentId, {
      attributes: ["id_parent"],
      transaction,
    });
    currentId = node ? node.id_parent : null;
  }
  return false;
}

async function updateChildrenLevel(parentId, parentLevel, transaction) {
  const children = await MasterCoaModel.findAll({
    attributes: ["id"],
    where: { id_parent: parentId },
    transaction,
  });
  for (const child of children) {
    await child.update({ level: parentLevel + 1 }, { transaction });
    await updateChildrenLevel(child.id, parentLevel + 1, transaction);
  }
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
      node.tipe === "header"
        ? node.sub_account.reduce((total, child) => total + sumBalance(child), 0)
        : node.opening_balance;
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
