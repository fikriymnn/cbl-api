const FormatTanggalFunction = {
  //contoh hasil 07 / Juli / 2025 dan 08:48
  formatTanggal: (date) => {
    const d = new Date(date);

    const hari = String(d.getDate()).padStart(2, "0");
    const bulanNama = d.toLocaleDateString("id-ID", { month: "long" });
    const tahun = d.getFullYear();

    const jam = String(d.getHours()).padStart(2, "0");
    const menit = String(d.getMinutes()).padStart(2, "0");

    return {
      tanggal: `${hari} / ${capitalize(bulanNama)} / ${tahun}`,
      jam: `${jam}:${menit}`,
    };
  },
};

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = FormatTanggalFunction;
