-- Migrasi: tgl_kirim & qty_po (dari SO) di tiket estimasi kurang qty QC / PPIC / produksi.
-- WAJIB dijalankan sebelum kode di-deploy (model sudah memakai kolom ini).

ALTER TABLE estimasi_kurang_qty_qc
  ADD COLUMN tgl_kirim DATETIME NULL AFTER qty_jo,
  ADD COLUMN qty_po INT NULL AFTER tgl_kirim;

ALTER TABLE estimasi_kurang_qty_ppic
  ADD COLUMN tgl_kirim DATETIME NULL AFTER qty_jo,
  ADD COLUMN qty_po INT NULL AFTER tgl_kirim;

ALTER TABLE estimasi_kurang_qty_produksi
  ADD COLUMN tgl_kirim DATETIME NULL AFTER qty_jo,
  ADD COLUMN qty_po INT NULL AFTER tgl_kirim;

-- isi data lama dari SO
UPDATE estimasi_kurang_qty_qc e JOIN so s ON s.id = e.id_so
   SET e.tgl_kirim = s.tgl_pengiriman, e.qty_po = s.po_qty;
UPDATE estimasi_kurang_qty_ppic e JOIN so s ON s.id = e.id_so
   SET e.tgl_kirim = s.tgl_pengiriman, e.qty_po = s.po_qty;
UPDATE estimasi_kurang_qty_produksi e JOIN so s ON s.id = e.id_so
   SET e.tgl_kirim = s.tgl_pengiriman, e.qty_po = s.po_qty;
