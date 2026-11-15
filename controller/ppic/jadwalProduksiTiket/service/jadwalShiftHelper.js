// Aturan jam kerja jadwal produksi: shift, istirahat, libur, lembur per mesin.
// Dipindahkan dari calculateTiketJadwalProduksi supaya calculate, simulasi,
// dan apply perubahan jadwal memakai aturan yang sama persis.
const { Op } = require("sequelize");
const JadwalKaryawan = require("../../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const JadwalLemburProduksi = require("../../../../model/ppic/jadwalProduksi/jadwalLemburModel");
const masterShift = require("../../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../../model/masterData/hr/masterShift/masterIstirahatModel");

// jam shift saat calculate dengan ?is_lembur=true (semua tanggal jadi lembur)
const LEMBUR_GLOBAL_SHIFT = {
  shift_1_masuk: "08:00:00",
  shift_1_keluar: "20:00:00",
  shift_2_masuk: "20:00:00",
  shift_2_keluar: "08:00:00",
};

const dateOnlyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// tanggal-only konsisten pakai zona Asia/Jakarta -> "YYYY-MM-DD"
const toDateOnlyJakarta = (date) => dateOnlyFormatter.format(date);

const toPlainShift = (shift) => ({
  hari: shift.hari,
  shift_1_masuk: shift.shift_1_masuk,
  shift_1_keluar: shift.shift_1_keluar,
  shift_2_masuk: shift.shift_2_masuk,
  shift_2_keluar: shift.shift_2_keluar,
  istirahat: (shift.istirahat || []).map((ist) => ({
    dari: ist.dari,
    sampai: ist.sampai,
  })),
});

// Cek apakah jam saat ini masuk waktu istirahat (dibandingkan sebagai HHMM)
const isInIstirahat = (currentTime, istirahat) => {
  if (!istirahat || istirahat.length === 0) return false;
  for (const ist of istirahat) {
    if (!ist.dari || !ist.sampai) continue;
    const start = parseInt(ist.dari.replace(":", ""));
    const end = parseInt(ist.sampai.replace(":", ""));
    if (currentTime >= start && currentTime < end) return true;
  }
  return false;
};

// Senin(1) - Jumat(5) = hari yang normalnya punya shift 2.
// Sabtu(6) & Minggu(0) TIDAK punya shift 2 sendiri, kecuali lembur.
const dayNormallyHasShift2 = (dayOfWeek) => dayOfWeek >= 1 && dayOfWeek <= 5;

const NO_LEMBUR = { shift_1: false, shift_2: false };

/**
 * Buat konteks jam kerja dari data yang sudah di-load (fungsi murni).
 *
 * @param {object} p
 * @param {Array} p.shifts        data shift_harian (+ istirahat)
 * @param {Array<string>} p.liburDates  tanggal libur "YYYY-MM-DD"
 * @param {Array} p.lemburRows    data jadwal_produksi_lembur
 * @param {Array<string>} p.mesinList  nama mesin yang dicek lemburnya
 * @param {boolean} p.isLemburGlobal  override: semua tanggal jadi lembur
 */
const createShiftContext = ({
  shifts,
  liburDates,
  lemburRows,
  mesinList,
  isLemburGlobal = false,
}) => {
  const normalShifts = shifts.map(toPlainShift);
  const activeShifts = isLemburGlobal
    ? normalShifts.map((s) => ({ ...s, ...LEMBUR_GLOBAL_SHIFT }))
    : normalShifts;

  const jadwalLiburSet = new Set(liburDates);

  const uniqueMesinList = [
    ...new Set((mesinList || []).filter((m) => m && m.trim() !== "")),
  ];

  // map: "mesin(lowercase)|YYYY-MM-DD" -> { shift_1, shift_2 }
  const lemburMap = {};
  if (!isLemburGlobal) {
    (lemburRows || []).forEach((row) => {
      const dateStr = toDateOnlyJakarta(new Date(row.tanggal_lembur));
      uniqueMesinList.forEach((m) => {
        if (row.mesin && row.mesin.toLowerCase().includes(m.toLowerCase())) {
          lemburMap[`${m.toLowerCase()}|${dateStr}`] = {
            shift_1: !!row.shift_1,
            shift_2: !!row.shift_2,
          };
        }
      });
    });
  }

  const getLemburInfo = (mesin, date) => {
    if (isLemburGlobal) return { shift_1: true, shift_2: true };
    if (!mesin) return NO_LEMBUR;
    const key = `${mesin.toLowerCase()}|${toDateOnlyJakarta(date)}`;
    return lemburMap[key] || NO_LEMBUR;
  };

  // Minggu, atau hari yang eksplisit ditandai libur di jadwal karyawan
  const isDayOff = (dateToCheck, formattedDateToCheck) => {
    const dow = dateToCheck.getDay();
    return dow === 0 || jadwalLiburSet.has(formattedDateToCheck);
  };

  // Aturan lengkap (sama dengan calculate sebelumnya):
  // - Senin-Jumat  : shift 1 + shift 2
  // - Sabtu        : shift 1 saja s/d 13:00, kecuali lembur
  // - Minggu / libur eksplisit : libur total, kecuali shift itu dilemburkan
  // - Shift 2 lintas tengah malam dicek carry-over dari hari sebelumnya
  const isWithinShiftHours = (date, dataShift, getLembur) => {
    const formattedDate = toDateOnlyJakarta(date);
    const dayOfWeek = date.getDay();
    const isSaturday = dayOfWeek === 6;

    const lembur = getLembur ? getLembur(date) : NO_LEMBUR;
    const isLemburDay = lembur.shift_1 || lembur.shift_2;
    const todayOff = isDayOff(date, formattedDate);

    const currentTime = date.getHours() * 100 + date.getMinutes();

    // ---- Carryover shift 2 dari hari sebelumnya (lintas tengah malam) ----
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevFormattedDate = toDateOnlyJakarta(prevDate);
    const prevDayOfWeek = prevDate.getDay();
    const prevLembur = getLembur ? getLembur(prevDate) : NO_LEMBUR;
    const prevDayOff = isDayOff(prevDate, prevFormattedDate);
    const prevDayHasShift2 = prevDayOff
      ? prevLembur.shift_2
      : dayNormallyHasShift2(prevDayOfWeek) || prevLembur.shift_2;

    if (prevDayHasShift2) {
      for (const shift of dataShift) {
        const shift2MasukStr = prevLembur.shift_2 ? "20:00" : shift.shift_2_masuk;
        const shift2KeluarStr = prevLembur.shift_2
          ? "08:00"
          : shift.shift_2_keluar;

        if (shift2MasukStr && shift2KeluarStr) {
          const shift2Start = parseInt(shift2MasukStr.replace(":", ""));
          const shift2End = parseInt(shift2KeluarStr.replace(":", ""));

          if (shift2Start > shift2End && currentTime < shift2End) {
            if (isInIstirahat(currentTime, shift.istirahat)) return false;
            return true;
          }
        }
      }
    }

    // ---- Hari libur (Minggu atau jadwal karyawan eksplisit) - kecuali lembur ----
    if (todayOff && !isLemburDay) return false;

    // ---- Shift 1 hari ini ----
    const shift1Blocked =
      (todayOff && !lembur.shift_1) ||
      (isSaturday && currentTime >= 1300 && !lembur.shift_1);

    if (!shift1Blocked) {
      for (const shift of dataShift) {
        const shift1MasukStr = lembur.shift_1 ? "08:00" : shift.shift_1_masuk;
        const shift1KeluarStr = lembur.shift_1 ? "20:00" : shift.shift_1_keluar;

        if (shift1MasukStr && shift1KeluarStr) {
          const shift1Start = parseInt(shift1MasukStr.replace(":", ""));
          const shift1End = parseInt(shift1KeluarStr.replace(":", ""));

          if (
            shift1Start <= shift1End &&
            currentTime >= shift1Start &&
            currentTime < shift1End
          ) {
            if (isInIstirahat(currentTime, shift.istirahat)) return false;
            return true;
          }
        }
      }
    }

    // ---- Shift 2 hari ini ----
    const todayHasShift2 = todayOff
      ? lembur.shift_2
      : dayNormallyHasShift2(dayOfWeek) || lembur.shift_2;

    if (todayHasShift2) {
      for (const shift of dataShift) {
        const shift2MasukStr = lembur.shift_2 ? "20:00" : shift.shift_2_masuk;
        const shift2KeluarStr = lembur.shift_2 ? "08:00" : shift.shift_2_keluar;

        if (shift2MasukStr && shift2KeluarStr) {
          const shift2Start = parseInt(shift2MasukStr.replace(":", ""));
          const shift2End = parseInt(shift2KeluarStr.replace(":", ""));

          if (shift2Start > shift2End) {
            if (currentTime >= shift2Start) {
              if (isInIstirahat(currentTime, shift.istirahat)) return false;
              return true;
            }
          } else {
            if (currentTime >= shift2Start && currentTime < shift2End) {
              if (isInIstirahat(currentTime, shift.istirahat)) return false;
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  // cache: dipanggil sangat sering saat simulasi / availability
  const workingCache = new Map();
  const isWorkingHour = (date, mesin) => {
    const key = `${(mesin || "").toLowerCase()}|${date.getTime()}`;
    let v = workingCache.get(key);
    if (v === undefined) {
      v = isWithinShiftHours(date, activeShifts, (d) => getLemburInfo(mesin, d));
      workingCache.set(key, v);
    }
    return v;
  };

  // jam lembur = jam kerja yang hanya buka karena lembur
  const isLemburHour = (date, mesin) =>
    isWorkingHour(date, mesin) &&
    !isWithinShiftHours(date, normalShifts, null);

  // hari kerja = bukan Minggu dan bukan hari libur karyawan (Sabtu dihitung)
  const isWorkingDay = (date) => !isDayOff(date, toDateOnlyJakarta(date));

  // mundur n hari kerja, jam tetap
  const subtractWorkingDays = (date, days) => {
    const d = new Date(date);
    let n = days;
    while (n > 0) {
      d.setDate(d.getDate() - 1);
      if (isWorkingDay(d)) n--;
    }
    return d;
  };

  // maju n hari kerja, jam tetap
  const addWorkingDays = (date, days) => {
    const d = new Date(date);
    let n = days;
    while (n > 0) {
      d.setDate(d.getDate() + 1);
      if (isWorkingDay(d)) n--;
    }
    return d;
  };

  return {
    isLemburGlobal,
    jadwalLiburSet,
    getLemburInfo,
    isWorkingHour,
    isLemburHour,
    isWorkingDay,
    subtractWorkingDays,
    addWorkingDays,
    // dipakai untuk uji kesamaan dengan logika lama
    _isWithinShiftHours: (date, getLembur) =>
      isWithinShiftHours(date, activeShifts, getLembur),
  };
};

/**
 * Load data shift, libur, lembur dari database lalu buat konteks jam kerja.
 */
const loadShiftContext = async ({
  tglMulai,
  tglSelesai,
  mesinList,
  isLemburGlobal = false,
  transaction,
}) => {
  const mulai = new Date(tglMulai);
  mulai.setHours(0, 0, 0, 0);
  const selesai = new Date(tglSelesai);
  selesai.setHours(23, 59, 59, 999);

  const dataJadwal = await JadwalKaryawan.findAll({
    attributes: ["tanggal"],
    where: {
      tanggal: { [Op.between]: [mulai, selesai] },
      jenis_karyawan: "produksi",
    },
    transaction,
  });

  const dataShift = await masterShift.findAll({
    include: [{ model: masterIstirahat, as: "istirahat" }],
    transaction,
  });

  if (!dataShift || dataShift.length === 0) {
    const err = new Error("Data shift tidak ditemukan");
    err.status = 400;
    throw err;
  }

  const uniqueMesinList = [
    ...new Set((mesinList || []).filter((m) => m && m.trim() !== "")),
  ];

  let lemburRows = [];
  if (!isLemburGlobal && uniqueMesinList.length > 0) {
    lemburRows = await JadwalLemburProduksi.findAll({
      attributes: ["tanggal_lembur", "mesin", "shift_1", "shift_2"],
      where: {
        tanggal_lembur: { [Op.gte]: mulai, [Op.lte]: selesai },
        [Op.or]: uniqueMesinList.map((m) => ({
          mesin: { [Op.like]: `%${m}%` },
        })),
      },
      transaction,
    });
  }

  return createShiftContext({
    shifts: dataShift,
    liburDates: dataJadwal.map((j) => toDateOnlyJakarta(new Date(j.tanggal))),
    lemburRows,
    mesinList: uniqueMesinList,
    isLemburGlobal,
  });
};

module.exports = {
  createShiftContext,
  loadShiftContext,
  toDateOnlyJakarta,
};
