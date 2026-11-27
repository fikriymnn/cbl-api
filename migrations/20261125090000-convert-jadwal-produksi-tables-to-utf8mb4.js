"use strict";

// Konversi tabel jadwal produksi dari latin1 ke utf8mb4.
// Penyebab: nama produk dari IO bisa berisi karakter di luar latin1
// (contoh: "BOX KALMECO 500μG ..." -> μ = U+03BC) sehingga insert ke
// tiket_jadwal_produksi gagal: "Incorrect string value '\xCE\xBCG ...' for column item".
//
// Semua kolom teks di tabel ini varchar(255) tanpa index/FK di kolom teks,
// jadi CONVERT TO aman (tidak ada batas panjang index yang terlewati).
const TABLES = [
  "tiket_jadwal_produksi",
  "tiket_jadwal_produksi_tahapan",
  "tiket_jadwal_produksi_per_jam",
  "tiket_perubahan_tgl_kirim_jadwal_produksi",
  "jadwal_produksi",
  "booking_jadwal",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    }
  },

  // Catatan: down akan GAGAL (strict mode) jika sudah ada data dengan karakter
  // di luar latin1 (mis. μ). Bersihkan/ubah data tersebut dulu sebelum undo.
  async down(queryInterface) {
    for (const table of [...TABLES].reverse()) {
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci`,
      );
    }
  },
};
