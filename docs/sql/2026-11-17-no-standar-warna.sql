-- Migrasi: nomor standar warna (CT-00001/CBL/0926) + revisi saat reject.
-- WAJIB dijalankan sebelum kode di-deploy (model sudah memakai kolom ini).

ALTER TABLE pembuatan_standar_warna
  ADD COLUMN no_standar_warna VARCHAR(50) NULL AFTER id,
  -- 0 = nomor asli, 1 = reject pertama (CT-00001-1/...), dst.
  ADD COLUMN revisi INT NOT NULL DEFAULT 0 AFTER no_standar_warna,
  -- tiket yang di-reject sebelum tiket revisi ini
  ADD COLUMN id_standar_warna_sebelumnya INT NULL AFTER revisi,
  ADD UNIQUE INDEX uq_pembuatan_standar_warna_no (no_standar_warna);
