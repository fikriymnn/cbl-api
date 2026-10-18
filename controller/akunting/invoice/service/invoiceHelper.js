const { Op } = require("sequelize");

// helper bersama invoice ar & invoice ap (nominal, filter tanggal, tenggat jatuh tempo)
function toBigInt(value) {
  if (value === null || value === undefined || value === "") return 0n;
  return BigInt(String(value).split(".")[0]);
}

function buildDateRangeFilter(startValue, endValue, label) {
  if (!startValue && !endValue) return { value: undefined };
  if (!startValue || !endValue) {
    return { error: `tanggal awal dan akhir ${label} harus diisi bersamaan` };
  }

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return { error: `range ${label} tidak valid` };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  if (startDate > endDate) {
    return { error: `tanggal awal ${label} tidak boleh melebihi tanggal akhir` };
  }

  return { value: { [Op.between]: [startDate, endDate] } };
}

function getDueTimeDatabaseFilter(waktu) {
  if (!waktu) return { invalid: false, where: undefined };

  const normalizedWaktu = waktu.trim().toLowerCase();
  const selectedBucket = DUE_TIME_BUCKETS.find(
    (bucket) => bucket.toLowerCase() === normalizedWaktu,
  );
  if (!selectedBucket) return { invalid: true };

  if (selectedBucket === "tanpa tenggat waktu") {
    return { invalid: false, where: null };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const dayStart = (daysFromToday) => {
    const date = new Date(todayStart);
    date.setDate(date.getDate() + daysFromToday);
    return date;
  };
  const dayEnd = (daysFromToday) => {
    const date = dayStart(daysFromToday);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const ranges = {
    "1-30 hari lagi": { [Op.between]: [dayStart(1), dayEnd(30)] },
    "31-60 hari lagi": { [Op.between]: [dayStart(31), dayEnd(60)] },
    "61-90 hari lagi": { [Op.between]: [dayStart(61), dayEnd(90)] },
    "lebih dari 90 hari lagi": { [Op.gte]: dayStart(91) },
    "jatuh tempo hari ini": { [Op.between]: [todayStart, todayEnd] },
    "lewat jatuh tempo": { [Op.lt]: todayStart },
  };

  return { invalid: false, where: ranges[selectedBucket] };
}

const DUE_TIME_BUCKETS = [
  "1-30 hari lagi",
  "31-60 hari lagi",
  "61-90 hari lagi",
  "lebih dari 90 hari lagi",
  "jatuh tempo hari ini",
  "lewat jatuh tempo",
  "tanpa tenggat waktu",
];

function getInvoiceDueTime(dueDateValue) {
  if (!dueDateValue) {
    return {
      daysUntilDue: null,
      dueDescription: "tanpa tenggat waktu",
      waktu: "tanpa tenggat waktu",
    };
  }

  const dueDate = new Date(dueDateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return {
      daysUntilDue: null,
      dueDescription: "tanpa tenggat waktu",
      waktu: "tanpa tenggat waktu",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.round(
    (dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (daysUntilDue < 0) {
    return {
      daysUntilDue,
      dueDescription: `${Math.abs(daysUntilDue)} hari lewat jatuh tempo`,
      waktu: "lewat jatuh tempo",
    };
  }
  if (daysUntilDue === 0) {
    return {
      daysUntilDue,
      dueDescription: "jatuh tempo hari ini",
      waktu: "jatuh tempo hari ini",
    };
  }
  if (daysUntilDue <= 30) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "1-30 hari lagi",
    };
  }
  if (daysUntilDue <= 60) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "31-60 hari lagi",
    };
  }
  if (daysUntilDue <= 90) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "61-90 hari lagi",
    };
  }

  return {
    daysUntilDue,
    dueDescription: `${daysUntilDue} hari lagi`,
    waktu: "lebih dari 90 hari lagi",
  };
}

module.exports = {
  toBigInt,
  buildDateRangeFilter,
  getDueTimeDatabaseFilter,
  DUE_TIME_BUCKETS,
  getInvoiceDueTime,
};
