const tanggalConverter = {
  converTanggalWithMonthName: (date) => {
    const tanggal = new Date(date);
    const day = tanggal.getDate();
    const month = getMonthName(tanggal.getMonth() + 1);
    const year = tanggal.getFullYear();
    const finalTanggal = `${year}-${month}-${day}`;
    return finalTanggal;
  },
};

function getMonthName(monthString) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthNumber = parseInt(monthString);

  if (monthNumber < 1 || monthNumber > 12) {
    return "Bulan tidak valid";
  } else {
    return months[monthNumber - 1];
  }
}
module.exports = tanggalConverter;
