const MasterDepartment = require("../model/masterData/hr/masterDeprtmentModel");

// target_department di ms_kode_produksi berisi daftar ID department,
// sebagian data tersimpan sebagai string JSON.
const parseDepartmentIds = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw.replace(/^"+|"+$/g, ""));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

// Mengubah target_department menjadi format yang dipakai tiket:
// [{ id_department, department }]
const resolveTargetDepartment = async (raw) => {
  const ids = parseDepartmentIds(raw).map((item) =>
    Number(item?.id_department ?? item)
  );
  if (ids.length === 0) return [];

  const departments = await MasterDepartment.findAll({ where: { id: ids } });
  return ids.map((id) => ({
    id_department: id,
    department:
      departments.find((dept) => Number(dept.id) === id)?.nama_department ??
      null,
  }));
};

module.exports = { resolveTargetDepartment };
