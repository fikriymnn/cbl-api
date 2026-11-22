# Nomor & Revisi Pembuatan Standar Warna

Dokumen ini untuk tim frontend & backend. Isinya format nomor standar warna, kapan nomor revisi dipakai, dan kapan tiket diperbarui alih-alih dibuat baru.

Kode: `controller/ppic/pembuatanStandarWarna/service/pembuatanSetandarWarnaService.js`

---

## 1. Format Nomor

| | Format | Contoh |
|---|---|---|
| Nomor baru | `CT-{urut 5 digit}/{bulan}/{2 digit tahun}` | `CT-00001/05/26` |
| Revisi | `CT-{urut}-{revisi}/{bulan}/{tahun}` | `CT-00001-1/05/26`, `CT-00001-2/05/26` |

- Nomor urut **reset per tahun** dan melanjutkan nomor terakhir di tahun yang sama.
- Bulan/tahun diambil dari tanggal tiket dibuat. Tiket revisi **memakai bulan/tahun nomor awalnya**, bukan bulan revisi dibuat.
- Kolom `revisi`: `0` = nomor asli, `n` = revisi ke-n.

### Data lama

Nomor lama berformat `CT-00001/CBL/0926` **tidak dikonversi**.

- Nomor urut baru tetap melanjutkan nomor lama di tahun yang sama. Contoh: kalau nomor terakhir `CT-00007/CBL/0926`, nomor berikutnya `CT-00008/11/26`.
- Jika tiket bernomor lama di-reject lalu dibuat ulang, nomor revisinya memakai format baru: `CT-00007/CBL/0926` → `CT-00007-1/09/26`.

---

## 2. Pengecekan Tiket Sebelumnya (berdasarkan `no_io`)

Saat tiket standar warna dibuat (otomatis dari LKH tahapan produksi, atau dari reject + buat ulang), sistem mencari **tiket terakhir dengan `no_io` yang sama**.

Yang dicek adalah `no_io`, **bukan** `id_io`, karena IO minus punya `no_io` yang sama dengan `id` berbeda. `id_so` juga tidak ikut dicek. Jika IO tidak punya `no_io`, pengecekan memakai `id_io`.

| Tiket terakhir dengan `no_io` sama | Hasil |
|---|---|
| Tidak ada | **Nomor baru** |
| Masih berjalan (`is_active = true`, status bukan `approved` / `rejected`) | **Tiket itu diperbarui** dengan data JO/IO terbaru, tidak dibuat tiket baru |
| `rejected` + tidak aktif (reject **dengan** buat ulang) | **Nomor revisi**: nomor sama, `revisi + 1`, note reject ikut |
| `approved` | **Nomor baru** (IO minus / IO revisi wajib jalan proof dari awal) |
| `rejected` + masih aktif (reject final, **tanpa** buat ulang) | **Nomor baru** |

Saat tiket yang masih berjalan diperbarui, field berikut ikut diganti: `id_jo`, `id_io`, `id_so`, `id_customer`, `id_produk`, `no_jo`, `no_io`, `no_so`, `customer`, `produk`. `id_io` ikut diperbarui supaya approve/reject mengubah status proof IO yang terbaru (misal IO minus).

Response create untuk kasus ini: `message: "update revisi success"` dengan `no_standar_warna` dan `revisi` tiket yang diperbarui.

---

## 3. Contoh Alur

1. IO `IO-0123` (id 50) → JO selesai → tiket **`CT-00001/05/26`**.
2. Tiket di-reject dengan buat ulang → tiket lama nonaktif, tiket **`CT-00001-1/05/26`** dibuat.
3. IO minus `IO-0123` (id 61) → JO selesai, sementara `CT-00001-1` masih berjalan → `CT-00001-1` **diperbarui** (id_io jadi 61), tidak ada tiket baru.
4. `CT-00001-1` di-approve.
5. IO minus berikutnya `IO-0123` (id 70) → JO selesai → tiket terakhir sudah approved → **nomor baru** `CT-00002/06/26`.

---

## 4. Database

- Index `idx_pembuatan_standar_warna_no_io` pada kolom `no_io`, dibuat lewat migration `migrations/20261122100000-add-index-no-io-pembuatan-standar-warna.js`.
- Jalankan `npm run migrate` sebelum deploy (lihat `docs/migration.md`).
- `no_standar_warna` tetap unique (`uq_pembuatan_standar_warna_no`).
