-- Migrasi fitur: Edit Hasil Calculate Jadwal Produksi
-- Lihat docs/plan-edit-jadwal-produksi.md
--
-- WAJIB dijalankan sebelum kode fitur ini di-deploy: model Sequelize sudah
-- memakai kolom-kolom di bawah, jadi query akan error kalau kolomnya belum ada.
-- Semua perubahan hanya menambah kolom / tabel (tidak ada kolom lama yang diubah).

-- 1. Master mesin: mesin yang boleh dipakai beberapa JO di jam yang sama.
--    Default 0 untuk SEMUA mesin (termasuk manual & outsource) = dicek bentrok.
ALTER TABLE ms_mesin_tahapan
  ADD COLUMN allow_concurrent TINYINT(1) NOT NULL DEFAULT 0 AFTER type_kapasitas;

-- 2. Tiket: target FG (H-2 hari kerja sebelum tanggal kirim).
ALTER TABLE tiket_jadwal_produksi
  ADD COLUMN tgl_target_fg DATE NULL AFTER tgl_kirim_update_date;

-- 3. Tahapan tiket: jam produksi & drying sebagai data, penanda diubah manual.
ALTER TABLE tiket_jadwal_produksi_tahapan
  ADD COLUMN produksi_mulai DATETIME NULL,
  ADD COLUMN produksi_selesai DATETIME NULL,
  ADD COLUMN drying_mulai DATETIME NULL,
  ADD COLUMN drying_selesai DATETIME NULL,
  ADD COLUMN is_diubah_manual TINYINT(1) NOT NULL DEFAULT 0;

-- 4. Jadwal produksi resmi: id mesin & id tiket untuk cek bentrok.
--    Data lama dibiarkan NULL; cek bentrok memakai nama mesin sebagai cadangan.
ALTER TABLE jadwal_produksi
  ADD COLUMN id_tiket_jadwal_produksi INT NULL AFTER id,
  ADD COLUMN id_mesin INT NULL AFTER mesin,
  ADD INDEX idx_jadwal_produksi_id_mesin_tanggal (id_mesin, tanggal),
  ADD INDEX idx_jadwal_produksi_mesin_tanggal (mesin, tanggal);

-- 5. Log perubahan jadwal oleh PPIC.
CREATE TABLE tiket_jadwal_produksi_adjust_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket_jadwal_produksi INT NOT NULL,
  id_tiket_jadwal_produksi_tahapan INT NOT NULL,
  jenis VARCHAR(30) NOT NULL,
  mode VARCHAR(20) NULL,
  nilai_lama TEXT NULL,
  nilai_baru TEXT NULL,
  tahapan_ikut TEXT NULL,
  alasan VARCHAR(255) NULL,
  id_user INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_adjust_log_tiket (id_tiket_jadwal_produksi)
);
