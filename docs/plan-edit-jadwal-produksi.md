# Perencanaan: Edit Hasil Calculate Jadwal Produksi (Cek Bentrok Mesin & Drying Time)

Dokumen ini untuk tim backend dan frontend. Isinya rencana fitur untuk **menggeser hasil calculate jam per tahapan** pada tiket jadwal produksi, dengan validasi supaya hasil geser tidak bentrok dengan jadwal mesin yang sudah ada dan tidak melanggar urutan tahapan + drying time.

Status: **draft perencanaan**, belum ada implementasi.

---

## Ringkasan Aturan (untuk Dijelaskan ke Client)

Bagian ini memakai bahasa bisnis, tanpa istilah teknis. Detail teknis ada di bagian 1 dan seterusnya.

### Cara sistem menyusun jadwal

1. Jadwal dihitung **mundur dari tanggal kirim**. Setiap tahapan ditaruh sedekat mungkin dengan tanggal kirim.
2. Antar tahapan **tidak ada jeda**, kecuali drying time. Artinya hasil hitungan sistem sudah berada di posisi **paling lambat** yang masih aman untuk tanggal kirim.
3. Jam kerja mengikuti shift, hari libur, dan jadwal lembur mesin.
4. Lama pengerjaan tiap tahapan mengikuti **tipe kapasitas mesinnya** di master mesin:
   - Mesin tipe **druk** → dihitung per jam dari qty druk ÷ kapasitas per jam, ditambah waktu setting.
   - Mesin tipe **pcs** → dihitung per jam dari qty pcs ÷ kapasitas per jam, ditambah waktu setting. Termasuk Sampling, Packing dan Final Inspection.
   - Tahapan **Plate** dan tahapan yang mesinnya **tidak ada di master mesin** → diberi jatah **2 hari kerja**.
5. Tahapan terakhir sebelum FG selesai **tepat di tanggal kirim**. Tidak ada cadangan waktu (buffer) sebelum tanggal kirim.
6. PPIC bisa menggeser hasil hitungan. Yang digeser adalah **satu tahapan utuh** (misalnya seluruh jam Cetak), bukan jam per jam.

### Aturan yang tidak boleh dilanggar

| No  | Aturan                                                                   | Penjelasan                                                                                                                                                        |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Satu mesin, satu pekerjaan per jam**                                   | Mesin tidak boleh dipakai dua JO di jam yang sama. Pengecualian: pekerjaan manual dan outsource, yang boleh berjalan bersamaan.                                   |
| 2   | **Tahapan berikutnya menunggu tahapan sebelumnya selesai + drying time** | Contoh: Cetak selesai jam 16:00 dengan drying 4 jam, maka Pond paling cepat mulai jam 20:00. Kalau jam 20:00 bukan jam kerja, Pond mulai di jam kerja berikutnya. |
| 3   | **Semua tahapan selesai sebelum tanggal kirim**                          | Jadwal yang membuat barang selesai setelah tanggal kirim akan ditolak.                                                                                            |
| 4   | **FG tidak bisa digeser**                                                | FG selalu mengikuti tanggal kirim.                                                                                                                                |

### Kondisi yang boleh, tapi diberi tanda peringatan

| No  | Kondisi                                                                              | Penjelasan                                                                                  |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 1   | Jadwal jatuh di **jam lembur**                                                       | Boleh, tapi PPIC diingatkan bahwa jam itu butuh lembur.                                     |
| 2   | Bentrok dengan **jadwal lain yang masih draft** (sudah dihitung tapi belum disubmit) | Boleh, karena jadwal draft belum resmi. PPIC diingatkan supaya tidak saling tumpang tindih. |

### Kalau satu tahapan digeser, apakah tahapan lain ikut berubah?

**Ya, otomatis, tapi hanya tahapan yang terkena dan hanya secukupnya.** Tidak perlu menggeser satu per satu.

| Arah geser       | Yang terjadi                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lebih awal**   | Tahapan **sesudahnya tetap**. Tahapan **sebelumnya** ikut maju kalau jaraknya jadi kurang (selesai + drying time-nya melewati jam mulai yang baru). |
| **Lebih lambat** | Tahapan **sesudahnya ikut mundur** secukupnya. Kalau akhirnya melewati tanggal kirim, **seluruh perubahan ditolak**.                                |

Ketentuan tambahan:

- Tahapan yang ikut bergeser juga dicek mesinnya. Kalau mesinnya sudah terpakai, sistem mencarikan jam kosong berikutnya.
- Sebelum disimpan, sistem menampilkan **preview semua tahapan yang berubah**. PPIC cukup konfirmasi sekali, lalu semua perubahan disimpan bersamaan.
- Karena hasil hitungan sistem sudah di posisi paling lambat dan tahapan terakhir selesai tepat di tanggal kirim, **tidak ada toleransi untuk geser lebih lambat**. Geser lebih lambat hanya bisa berhasil kalau ada sela yang tidak terpakai, misalnya jam di luar shift yang bisa diisi dengan lembur. Cara yang realistis untuk menghindari bentrok adalah **geser lebih awal**, memakai lembur, atau mengubah tanggal kirim.

### Contoh

Agar mudah dibaca, contoh ini menganggap jam kerja hanya **08:00–16:00** setiap hari. Tanggal kirim: **Jumat**.

**Hasil hitungan sistem:**

| Tahapan | Mesin   | Jadwal            | Drying time |
| ------- | ------- | ----------------- | ----------- |
| Potong  | ITTOH   | Rabu 08:00–10:00  | 0           |
| Cetak   | R700    | Rabu 10:00–16:00  | 4 jam       |
| Pond    | BAODER  | Kamis 08:00–12:00 | 0           |
| Lem     | JK 1000 | Kamis 12:00–16:00 | 0           |
| FG      | -       | Jumat             | -           |

Cetak selesai Rabu 16:00, ditambah drying 4 jam menjadi Rabu 20:00. Jam itu bukan jam kerja, jadi Pond mulai Kamis 08:00.

**Contoh 1: geser lebih awal (berhasil).**
Ternyata mesin R700 sudah dipakai JO-0012 pada Rabu 12:00–16:00. PPIC menggeser Cetak supaya mulai **Selasa 14:00**.

| Tahapan | Sebelum           | Sesudah                                     | Keterangan                                                                              |
| ------- | ----------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Potong  | Rabu 08:00–10:00  | **Selasa 12:00–14:00**                      | Ikut maju, karena harus selesai sebelum Cetak mulai                                     |
| Cetak   | Rabu 10:00–16:00  | **Selasa 14:00–16:00 dan Rabu 08:00–12:00** | Digeser PPIC, tidak lagi bentrok dengan JO-0012                                         |
| Pond    | Kamis 08:00–12:00 | Kamis 08:00–12:00                           | Tetap (Cetak selesai Rabu 12:00 + drying 4 jam = Rabu 16:00, masih sebelum Kamis 08:00) |
| Lem     | Kamis 12:00–16:00 | Kamis 12:00–16:00                           | Tetap                                                                                   |

**Contoh 2: geser lebih lambat (ditolak).**
PPIC menggeser Cetak ke **Kamis 08:00–14:00**. Selesai + drying 4 jam menjadi Kamis 18:00, sehingga Pond baru bisa mulai Jumat 08:00 dan Lem selesai Jumat 16:00. Ini **melewati tanggal kirim**, jadi perubahan ditolak. Pilihan PPIC: geser lebih awal, pakai lembur, atau ubah tanggal kirim.

**Contoh 3: mesin manual / outsource.**
Tahapan Lem Samping dengan mesin MANUAL boleh dijadwalkan di jam yang sama dengan JO lain yang juga memakai MANUAL, karena pekerjaan manual bisa dikerjakan bersamaan.

### Usulan agar jadwal bisa lebih cepat atau lebih lambat

Dengan aturan sekarang, jadwal hasil hitungan sistem sudah rapat: tahapan terakhir selesai tepat di tanggal kirim, dan antar tahapan tidak ada jeda selain drying time. Berikut opsi yang bisa dipakai untuk membuka ruang gerak. Kolom **Sistem** menunjukkan seberapa besar perubahan program yang dibutuhkan.

#### A. Agar pekerjaan bisa selesai lebih cepat (membuka ruang untuk menggeser)

| No  | Opsi                          | Cara kerja                                                                                                                                               | Kelebihan                                                                            | Kekurangan                                                                                            | Sistem                                                                                                 |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A1  | **Lembur**                    | Membuka jam di luar shift (malam, Sabtu sore, Minggu) untuk mesin tertentu. Jadwal lembur per mesin sudah ada di sistem.                                 | Sudah tersedia. Tahapan selesai lebih cepat tanpa mengubah urutan.                   | Biaya lembur. Butuh ketersediaan operator.                                                            | Kecil. Sudah ada, tinggal ditampilkan sebagai pilihan saat menggeser.                                  |
| A2  | **Pindah ke mesin lain**      | Tahapan dipindah ke mesin lain yang bisa mengerjakan tahapan yang sama. Contoh: Cetak 1 bisa di R700, SM atau GTO. Pond bisa di BAODER, KSB atau Eterna. | Bentrok bisa diselesaikan tanpa menggeser jam.                                       | Kapasitas per jam tiap mesin berbeda, jadi lama pengerjaan bisa berubah.                              | Sedang. Saat menggeser, sistem menawarkan mesin alternatif yang kosong dan menghitung ulang durasinya. |
| A3  | **Outsource**                 | Tahapan dikerjakan pihak luar. Outsource dianggap tidak terbatas kapasitasnya.                                                                           | Tidak bergantung pada mesin internal.                                                | Biaya, kontrol kualitas, dan waktu kirim-ambil barang.                                                | Kecil. Outsource sudah ada sebagai mesin.                                                              |
| A4  | **Bagi ke 2 mesin sekaligus** | Qty satu tahapan dibagi dua dan dikerjakan bersamaan di 2 mesin. Contoh: setengah Cetak di SM, setengah di R700.                                         | Lama pengerjaan bisa hampir setengahnya.                                             | Setting dua kali, dua mesin terpakai sekaligus.                                                       | Besar. Satu tahapan jadi punya beberapa mesin dan beberapa blok jadwal.                                |
| A5  | **Tahapan tumpang tindih**    | Tahapan berikutnya boleh mulai setelah sebagian hasil tahapan sebelumnya selesai (misal 30%), tidak perlu menunggu semua selesai.                        | Paling efektif mempersingkat total waktu produksi.                                   | Butuh pengaturan alur barang setengah jadi di lantai produksi. Drying time harus dihitung per bagian. | Besar. Aturan "tunggu selesai + drying" berubah menjadi per bagian.                                    |
| A6  | **Tinjau ulang drying time**  | Drying time di master dicek ulang. Banyak tahapan saat ini memakai 24 jam.                                                                               | Kalau ternyata bisa lebih pendek, semua jadwal langsung lebih rapat dan lebih cepat. | Harus dipastikan tidak menurunkan kualitas.                                                           | Kecil. Cukup ubah data master.                                                                         |
| A7  | **Prioritas JO**              | JO yang lebih mendesak boleh mengambil jam mesin JO lain yang jadwalnya masih longgar, lalu JO yang tergeser dihitung ulang.                             | Pesanan mendesak bisa didahulukan.                                                   | Bisa memicu efek berantai ke banyak JO. Perlu persetujuan atasan.                                     | Besar. Butuh aturan prioritas dan persetujuan.                                                         |

#### B. Agar jadwal boleh dimundurkan (memberi toleransi lebih lambat)

| No  | Opsi                                              | Cara kerja                                                                                                                                                                                | Kelebihan                                                          | Kekurangan                                                                                                                       | Sistem                                                        |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| B1  | **Ubah tanggal kirim**                            | Tanggal kirim dinegosiasikan ulang dengan customer. Fitur pengajuan dan persetujuan perubahan tanggal kirim sudah ada.                                                                    | Sudah tersedia. Semua tahapan otomatis punya ruang lebih.          | Tergantung persetujuan customer.                                                                                                 | Kecil. Sudah ada, tinggal dihubungkan ke layar geser jadwal.  |
| B2  | **Hitung maju dari tanggal mulai**                | Selain cara sekarang (hitung mundur dari tanggal kirim), tersedia pilihan menghitung maju dari tanggal mulai produksi secepat mungkin. Sisa waktu sampai tanggal kirim menjadi toleransi. | Ada ruang untuk mundur. Mesin terpakai lebih awal.                 | Barang setengah jadi atau barang jadi menumpuk lebih lama di gudang. Mesin terisi lebih awal sehingga JO lain lebih sulit masuk. | Sedang. Calculate punya mode kedua.                           |
| B3  | **Cadangan waktu (buffer) sebelum tanggal kirim** | Sistem menargetkan selesai N hari kerja sebelum tanggal kirim. Buffer boleh dipakai saat menggeser, dengan peringatan.                                                                    | Toleransi jelas dan sama untuk semua tiket.                        | Jadwal mulai lebih awal sebanyak N hari. Saat ini diputuskan **tidak dipakai**.                                                  | Kecil. Satu pengaturan + peringatan.                          |
| B4  | **Kirim sebagian**                                | Sebagian qty dikirim tepat di tanggal kirim, sisanya menyusul.                                                                                                                            | Customer tetap menerima barang tepat waktu untuk sebagian pesanan. | Butuh persetujuan customer dan pengiriman lebih dari sekali.                                                                     | Besar. Satu tiket jadi punya beberapa target qty dan tanggal. |

#### Usulan urutan penerapan

1. **Langsung bisa dipakai** karena fiturnya sudah ada: **A1 Lembur**, **B1 Ubah tanggal kirim**, **A6 Tinjau drying time** (cukup ubah data master).
2. **Tahap berikutnya**: **A2 Pindah ke mesin lain** dan **B2 Hitung maju**. Dampaknya besar dan perubahan programnya sedang.
3. **Jangka panjang**: A4, A5, A7, B4. Perlu dibicarakan lebih dulu dengan produksi dan customer, karena mengubah cara kerja di lantai produksi.

### Hal yang perlu dikonfirmasi ke client

1. **Daftar mesin yang boleh dipakai bersamaan** (selain MANUAL dan Outsource, apakah ada yang lain?).
2. **Jadwal yang sudah disubmit** apakah boleh digeser lagi? (Usulan: belum, untuk tahap pertama.)
3. **Siapa yang boleh menggeser jadwal?** (Misalnya hanya PPIC.)
4. **Jadwal di jam lembur** yang belum terdaftar di jadwal lembur mesin: boleh langsung dipakai, atau harus didaftarkan dulu?
5. Apakah PPIC **wajib mengisi alasan** setiap kali menggeser jadwal?

---

## 1. Latar Belakang

Hasil `calculate` tiket jadwal produksi saat ini harus bisa diubah oleh PPIC, karena:

- Jam yang dihasilkan calculate bisa jatuh di jam mesin yang **sudah dipakai JO lain** (sudah ada di `jadwal_produksi`).
- Jadwal hasil geser tetap **tidak boleh bentrok dengan tahapan berikutnya**, yaitu: `jam selesai tahapan + drying time` harus ≤ `jam mulai tahapan berikutnya`.

---

## 2. Kondisi Sekarang

File utama: `controller/ppic/jadwalProduksiTiket/jadwalProduksiController.js`

| Endpoint                                | Fungsi                         | Catatan                                                                                                                                                                                                                                              |
| --------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /ppic/calculateJadwalProduksi/:id` | `calculateTiketJadwalProduksi` | Hitung mundur dari `tgl_kirim`, per jam, cek shift / libur / lembur per mesin. **Tidak cek apakah mesin sudah terisi JO lain.**                                                                                                                      |
| `PUT /ppic/jadwalProduksi/:id`          | `updateTiketJadwalProduksi`    | Geser 1 slot per jam, lalu semua slot setelahnya ikut digeser dengan selisih waktu yang sama. **Tidak cek bentrok mesin, tidak cek drying time.** Logika shift berbeda dengan calculate (pakai `toISOString()` / UTC, tidak pakai lembur per mesin). |
| `PUT /ppic/jadwalProduksi/submit/:id`   | `submitTiketJadwalProduksi`    | Copy semua slot `tiket_jadwal_produksi_per_jam` ke `jadwal_produksi`.                                                                                                                                                                                |

Struktur data terkait:

| Tabel                           | Isi                                                                                                                                                         | Kunci waktu                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `tiket_jadwal_produksi`         | Header tiket (JO / booking), `tgl_kirim`, `status`                                                                                                          | -                                                     |
| `tiket_jadwal_produksi_tahapan` | Tahapan tiket: `from` (`tgl`/`pcs`/`druk`), `mesin`, `id_mesin`, `id_tahapan`, `setting`, `kapasitas_per_jam`, `drying_time`, `tgl_from`, `tgl_to` (string) | -                                                     |
| `tiket_jadwal_produksi_per_jam` | Slot 1 jam per tahapan hasil calculate                                                                                                                      | `tanggal` (DATE) + `jam` (TIME)                       |
| `jadwal_produksi`               | Slot 1 jam yang sudah di-submit (jadwal resmi)                                                                                                              | `tanggal` (DATE) + `jam` (TIME), mesin pakai **nama** |

Temuan yang perlu diperhatikan:

- `jadwal_produksi` tidak punya `id_mesin` dan tidak punya `id_tiket_jadwal_produksi`, jadi cek bentrok saat ini hanya bisa pakai nama mesin dan `no_jo`/`no_booking`.
- Nama mesin seperti `MANUAL` (id 9) dan `Outsource` (id 6) dipakai oleh banyak tahapan sekaligus. Kalau ikut dicek bentrok, hasilnya akan selalu bentrok.
- `calculateTiketJadwalProduksi` tidak menghapus slot per jam yang lama sebelum membuat slot baru. Kalau calculate dijalankan dua kali pada tiket yang sama, slot bisa dobel. Perlu dicek apakah frontend sudah mencegah ini.
- Hasil calculate **rapat tanpa jeda**: tahapan sebelum FG selesai tepat di `tgl_kirim`, dan setiap tahapan selesai tepat di `mulai tahapan berikutnya − drying`. Artinya geser lebih lambat hampir selalu melanggar aturan, sedangkan geser lebih awal aman untuk tahapan sesudahnya.
- **Kemungkinan bug drying time (belum diuji):** setelah mengurangi drying, calculate memanggil `findNextAvailableShiftTime` yang mencari jam kerja **maju**, padahal penyusunannya mundur. Contoh: tahapan berikutnya mulai Senin 08:00, drying 4 jam, jadi hitungannya Senin 03:00 (bukan jam kerja). Pencarian maju sampai Senin 08:00, sehingga slot terakhir tahapan ini = slot pertama tahapan berikutnya dan drying terlewati. Perbaikan: cari jam kerja **mundur**.

---

## 3. Istilah

| Istilah                     | Arti                                                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slot**                    | 1 baris jadwal per jam (`tanggal` + `jam`) untuk 1 tahapan di 1 mesin                                                                                                       |
| **Blok tahapan**            | Semua slot milik 1 tahapan pada 1 tiket                                                                                                                                     |
| **Mulai / selesai tahapan** | `mulai` = slot pertama, `selesai` = slot terakhir + 1 jam                                                                                                                   |
| **Drying time**             | Jeda (jam biasa, tidak ikut shift) setelah sebuah tahapan selesai sebelum tahapan berikutnya boleh mulai. Mengikuti perilaku `addHoursWithoutShiftRestriction` di calculate |
| **Jendela waktu**           | Rentang waktu yang boleh dipakai sebuah tahapan supaya tidak melanggar urutan tahapan                                                                                       |
| **Bentrok mesin**           | Slot di mesin yang sama, jam yang sama, sudah dipakai tiket lain                                                                                                            |

---

## 4. Aturan Validasi

Yang digeser adalah **1 blok tahapan utuh**, bukan per slot. User memilih jam mulai baru, lalu backend menyusun ulang slot maju dari jam itu sesuai aturan shift / libur / lembur yang sama dengan calculate.

| #   | Aturan                                                           | Jenis      | Rumus                                                                                                                                                  |
| --- | ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Bentrok mesin                                                    | **Wajib**  | Tidak boleh ada slot `(id_mesin, tanggal, jam)` yang sudah ada di `jadwal_produksi` milik tiket lain. Hanya untuk mesin dengan `is_cek_bentrok = true` |
| R2  | Urutan dengan tahapan sebelumnya                                 | **Wajib**  | `mulai(i) ≥ selesai(i-1) + drying(i-1)`                                                                                                                |
| R3  | Urutan dengan tahapan berikutnya                                 | **Wajib**  | `selesai(i) + drying(i) ≤ mulai(i+1)`                                                                                                                  |
| R4  | Tanggal kirim                                                    | **Wajib**  | Tahapan terakhir sebelum FG selesai ≤ `tgl_kirim`                                                                                                      |
| R5  | Di luar shift normal                                             | Peringatan | Slot jatuh di jam lembur. Ditampilkan sebagai warning, bukan error                                                                                     |
| R6  | Bentrok dengan tiket lain yang sudah calculate tapi belum submit | Peringatan | Slot sama dengan `tiket_jadwal_produksi_per_jam` tiket lain yang statusnya `calculated`                                                                |

Dari R2 dan R3, setiap tahapan punya **jendela waktu**:

```
earliest_start(i) = selesai(i-1) + drying(i-1)
latest_end(i)     = mulai(i+1) - drying(i)
```

Tahapan bebas dipindah di dalam jendela ini selama R1 terpenuhi.

### 4.1 Tahapan dengan `from = "tgl"`

Tahapan `tgl` (plate, dan tahapan yang mesinnya tidak ada di master mesin) tidak punya slot per jam, hanya `tgl_from` / `tgl_to`. Untuk fase awal:

- Digeser per **tanggal**, bukan per jam.
- Hanya dicek R2, R3, R4. Tidak dicek bentrok mesin.

### 4.2 Tahapan FG

FG tidak bisa digeser. Selalu mengikuti `tgl_kirim`.

### 4.3 Dorong berantai (cascade)

Kalau tahapan i digeser dan melanggar R2 atau R3, tahapan lain ikut digeser **otomatis**, hanya yang melanggar, dan hanya secukupnya:

- **Geser lebih awal** → cek tahapan i-1. Kalau `selesai(i-1) + drying(i-1) > mulai(i)`, tahapan i-1 dimajukan sampai pas. Ulangi ke i-2, i-3, dan seterusnya sampai tahapan awal. Tahapan sesudah i tidak berubah.
- **Geser lebih lambat** → cek tahapan i+1. Kalau `selesai(i) + drying(i) > mulai(i+1)`, tahapan i+1 dimundurkan sampai pas. Ulangi ke i+2, dan seterusnya. Kalau tahapan terakhir melewati `tgl_kirim` (R4), seluruh perubahan ditolak.
- Tahapan yang ikut bergeser tetap dicek R1. Kalau bentrok mesin, tahapan itu dilompatkan ke slot kosong berikutnya **ke arah yang sama** dengan arah geser.
- Semua perubahan (tahapan yang digeser + yang ikut terdorong) disimpan dalam **satu transaction**.

---

## 5. Perubahan Data

### 5.1 Master mesin

Tambah penanda mesin mana yang perlu dicek bentrok:

```sql
ALTER TABLE ms_mesin_tahapan
  ADD COLUMN is_cek_bentrok TINYINT(1) NOT NULL DEFAULT 1 AFTER type_kapasitas;

-- mesin yang boleh dipakai paralel
UPDATE ms_mesin_tahapan SET is_cek_bentrok = 0
WHERE nama_mesin IN ('MANUAL', 'Outsource');  -- sesuaikan daftar lengkapnya
```

Alternatif yang lebih fleksibel: `kapasitas_paralel INT` (1 = hanya 1 job per jam, 0 = tidak dibatasi). Lihat bagian 9 (keputusan terbuka).

### 5.2 Slot per jam & jadwal produksi

```sql
ALTER TABLE tiket_jadwal_produksi_per_jam
  ADD COLUMN id_mesin INT NULL AFTER mesin,
  ADD COLUMN waktu DATETIME NULL AFTER jam;

ALTER TABLE jadwal_produksi
  ADD COLUMN id_tiket_jadwal_produksi INT NULL AFTER id,
  ADD COLUMN id_mesin INT NULL AFTER mesin,
  ADD COLUMN waktu DATETIME NULL AFTER jam,
  ADD INDEX idx_jadwal_mesin_waktu (id_mesin, waktu);
```

- `id_mesin` → cek bentrok pakai ID, bukan nama.
- `waktu` = gabungan `tanggal` + `jam`. Query rentang waktu jadi sederhana (`waktu BETWEEN ? AND ?`). `tanggal` dan `jam` tetap disimpan supaya kode lama tidak rusak.
- `id_tiket_jadwal_produksi` di `jadwal_produksi` → untuk mengecualikan slot milik tiket sendiri saat cek bentrok.

Data lama perlu di-backfill:

```sql
UPDATE tiket_jadwal_produksi_per_jam p
JOIN tiket_jadwal_produksi_tahapan t ON t.id = p.id_tiket_jadwal_produksi_tahapan
SET p.id_mesin = t.id_mesin,
    p.waktu    = TIMESTAMP(DATE(p.tanggal), p.jam);

UPDATE jadwal_produksi j
JOIN ms_mesin_tahapan m ON m.nama_mesin = j.mesin
SET j.id_mesin = m.id,
    j.waktu    = TIMESTAMP(DATE(j.tanggal), j.jam);
```

> Catatan: backfill `jadwal_produksi` via nama mesin bisa ambigu kalau ada nama mesin yang sama. Cek hasilnya sebelum dipakai.

### 5.3 Log perubahan (opsional)

```sql
CREATE TABLE tiket_jadwal_produksi_adjust_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket_jadwal_produksi INT NOT NULL,
  id_tiket_jadwal_produksi_tahapan INT NOT NULL,
  mulai_lama DATETIME NULL,
  selesai_lama DATETIME NULL,
  mulai_baru DATETIME NULL,
  selesai_baru DATETIME NULL,
  alasan VARCHAR(255) NULL,
  id_user INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

---

## 6. Backend

### 6.1 Pisahkan helper shift

Logika shift sekarang ada di dalam `calculateTiketJadwalProduksi` (`isWithinShiftHours`, `getLemburInfo`, `isDayOff`, `isInIstirahat`, `findNextAvailableShiftTime`, data libur & lembur). Pindahkan ke satu modul supaya calculate, simulasi, dan geser jadwal pakai aturan yang sama:

```
controller/ppic/jadwalProduksiTiket/service/
  jadwalShiftHelper.js      ← load shift, libur, lembur; isWorkingHour(date, mesin)
  jadwalOccupancyHelper.js  ← ambil slot terisi per mesin & rentang waktu
  jadwalMoveService.js      ← simulate, suggest, move
```

Contoh bentuk `jadwalShiftHelper`:

```js
// sekali load per request
const ctx = await loadShiftContext({
  tglMulai,
  tglSelesai,
  mesinList,
  isLemburGlobal,
});

ctx.isWorkingHour(date, mesin); // true / false
ctx.isLemburHour(date, mesin); // untuk warning R5
ctx.nextWorkingHour(date, mesin); // maju ke jam kerja berikutnya
```

### 6.2 Calculate ikut cek bentrok

Ubah `calculateTiketJadwalProduksi`: saat menyusun slot mundur, **lompati jam yang mesinnya sudah terisi** di `jadwal_produksi` (untuk mesin `is_cek_bentrok = true`). Dengan ini hasil calculate sudah jarang bentrok, dan geser manual hanya untuk penyesuaian.

Sekalian:

- Hapus slot per jam lama tiket ini sebelum membuat yang baru (cegah slot dobel).
- Simpan `id_mesin` dan `waktu` di setiap slot.

### 6.3 Endpoint baru

Semua pakai auth. Path mengikuti pola route yang sudah ada.

| Method | Path                                            | Fungsi                                                   |
| ------ | ----------------------------------------------- | -------------------------------------------------------- |
| GET    | `/ppic/jadwalProduksi/availability/:id_tahapan` | Jendela waktu + status per jam mesin untuk 1 tahapan     |
| POST   | `/ppic/jadwalProduksi/simulateMove/:id_tahapan` | Simulasi geser, **tidak menyimpan**                      |
| POST   | `/ppic/jadwalProduksi/suggestSlot/:id_tahapan`  | Cari jam mulai paling awal yang lolos semua aturan wajib |
| PUT    | `/ppic/jadwalProduksi/move/:id_tahapan`         | Validasi ulang + simpan                                  |

`:id_tahapan` = `tiket_jadwal_produksi_tahapan.id`.

#### GET `/ppic/jadwalProduksi/availability/:id_tahapan`

Query: `from`, `to` (opsional, default = jendela waktu ± 1 hari).

Response:

```json
{
  "tahapan": {
    "id": 120,
    "tahapan": "Cetak 1",
    "id_mesin": 2,
    "mesin": "R700",
    "durasi_jam": 6,
    "drying_time": 4,
    "mulai": "2026-11-20 08:00",
    "selesai": "2026-11-20 14:00"
  },
  "jendela": {
    "earliest_start": "2026-11-19 16:00",
    "latest_end": "2026-11-21 10:00"
  },
  "slots": [
    { "waktu": "2026-11-19 16:00", "status": "kosong" },
    {
      "waktu": "2026-11-19 17:00",
      "status": "terisi",
      "no_jo": "JO-0012",
      "tahapan": "Cetak 1"
    },
    { "waktu": "2026-11-19 20:00", "status": "lembur" },
    { "waktu": "2026-11-20 00:00", "status": "di_luar_shift" },
    { "waktu": "2026-11-20 08:00", "status": "milik_tiket_ini" }
  ]
}
```

Nilai `status`: `kosong`, `terisi`, `terisi_draft` (R6), `lembur`, `di_luar_shift`, `milik_tiket_ini`.

#### POST `/ppic/jadwalProduksi/simulateMove/:id_tahapan`

Body:

```json
{ "new_start": "2026-11-19 16:00", "is_lembur": false }
```

Response:

```json
{
  "valid": false,
  "mulai": "2026-11-19 16:00",
  "selesai": "2026-11-20 11:00",
  "slots": ["2026-11-19 16:00", "2026-11-19 18:00", "..."],
  "conflicts": [
    {
      "rule": "R1",
      "waktu": "2026-11-19 17:00",
      "no_jo": "JO-0012",
      "msg": "Mesin R700 sudah dipakai JO-0012"
    },
    {
      "rule": "R3",
      "msg": "Selesai + drying (2026-11-20 15:00) melewati mulai Pond (2026-11-20 14:00)"
    }
  ],
  "warnings": [
    { "rule": "R5", "waktu": "2026-11-19 20:00", "msg": "Jam lembur" }
  ]
}
```

#### POST `/ppic/jadwalProduksi/suggestSlot/:id_tahapan`

Body: `{ "after": "2026-11-19 16:00" }` (opsional, default = `earliest_start`).

Response: sama seperti `simulateMove` untuk jam mulai pertama yang `valid: true`, atau `404` + pesan kalau tidak ada slot di dalam jendela waktu.

#### PUT `/ppic/jadwalProduksi/move/:id_tahapan`

Body:

```json
{
  "new_start": "2026-11-19 16:00",
  "is_lembur": false,
  "alasan": "Mesin R700 dipakai JO urgent"
}
```

Proses:

1. Buka transaction.
2. Lock slot mesin di rentang waktu terkait: `SELECT ... FROM jadwal_produksi WHERE id_mesin = ? AND waktu BETWEEN ? AND ? FOR UPDATE`.
3. Jalankan validasi yang sama dengan `simulateMove`. Kalau ada konflik wajib → rollback, `409` + daftar konflik.
4. Hapus slot lama tahapan ini di `tiket_jadwal_produksi_per_jam`, insert slot baru.
5. Update `tgl_from` / `tgl_to` tahapan. Kalau tahapan pertama, update `tgl_mulai_produksi` tiket.
6. Insert log (5.3).
7. Commit.

Hanya boleh untuk tiket yang **belum di-submit** (`status = "calculated"`). Tiket yang sudah di-submit di luar cakupan fase ini.

### 6.4 Algoritma simulasi

```
function simulateMove(tahapan, newStart):
  ctx      = loadShiftContext(...)
  prev     = tahapan sebelumnya (skip yang from = "tgl" kalau perlu)
  next     = tahapan berikutnya
  durasi   = tahapan.total_waktu_produksi   // jam efektif
  occupied = slot terisi mesin ini di jadwal_produksi, kecuali tiket ini

  slots = []; conflicts = []; warnings = []
  cursor = newStart
  while slots.length < durasi:
    if not ctx.isWorkingHour(cursor, mesin):
      cursor += 1 jam; continue
    if mesin.is_cek_bentrok and occupied.has(cursor):
      conflicts.push(R1 di cursor)
    if ctx.isLemburHour(cursor, mesin):
      warnings.push(R5 di cursor)
    slots.push(cursor)
    cursor += 1 jam

  mulai   = slots[0]
  selesai = slots[last] + 1 jam

  if prev and mulai < prev.selesai + prev.drying_time: conflicts.push(R2)
  if next and selesai + tahapan.drying_time > next.mulai: conflicts.push(R3)
  if selesai > tgl_kirim: conflicts.push(R4)

  return { valid: conflicts.length == 0, mulai, selesai, slots, conflicts, warnings }
```

`suggestSlot` = loop `simulateMove` mulai dari `after`, maju per jam kerja, sampai ketemu yang `valid` atau melewati `latest_end`.

### 6.5 Endpoint lama

- `PUT /ppic/jadwalProduksi/:id` (`updateTiketJadwalProduksi`) diganti oleh `move`. Biarkan dulu sampai frontend pindah, lalu dihapus.
- `submitTiketJadwalProduksi` ditambah: isi `id_mesin`, `waktu`, `id_tiket_jadwal_produksi` di `jadwal_produksi`, dan validasi ulang R1 sebelum insert (slot mesin bisa saja sudah diambil tiket lain sejak calculate).

---

## 7. Frontend

### 7.1 Tampilan timeline / Gantt per tiket

```
             Sen 19        |        Sel 20         |      Rab 21
             08  12  16  20 | 00  04  08  12  16  20 | 00  04  08
Plate        ████████████████                          (tgl)
Cetak 1                  ▓▓▓██████░░░░                 ← drag
Pond                                   ████████░░
Lem                                              ██████
FG                                                         ◆ tgl kirim

██ = jadwal tahapan   ░░ = drying time
▓▓ = jam mesin terisi JO lain (tooltip: no JO)
background arsir = di luar shift, kuning = lembur
```

- 1 baris = 1 tahapan. Bar = blok tahapan. Bagian arsir di ujung bar = drying time.
- Background baris menampilkan kondisi mesin tahapan itu (dari endpoint `availability`).
- Library bisa pakai `frappe-gantt`, `vis-timeline`, atau grid buatan sendiri. Sesuaikan dengan stack frontend.

### 7.2 Alur geser

1. User klik / mulai drag bar tahapan → panggil `availability`. Jendela waktu disorot hijau, di luarnya merah.
2. User lepas bar (atau isi jam mulai lewat date-time picker) → panggil `simulateMove`.
3. Tampilkan preview: jam lama vs jam baru untuk **semua tahapan yang ikut berubah** (dorong berantai), daftar konflik (merah) dan warning (kuning).
4. Kalau ada konflik → tampilkan tombol **"Cari slot kosong terdekat"** → panggil `suggestSlot` → tampilkan hasilnya sebagai preview baru.
5. Kalau valid → tombol **Simpan** (wajib isi alasan, opsional) → panggil `move`.
6. Kalau `move` mengembalikan `409` (ada yang mengambil slot duluan) → tampilkan konflik dan muat ulang `availability`.

### 7.3 Aturan UI

- Tombol **Submit tiket** dinonaktifkan selama masih ada tahapan dengan konflik wajib.
- Tahapan `from = "tgl"` digeser per tanggal (date picker), bukan per jam.
- FG tidak bisa digeser.
- Tampilkan riwayat perubahan dari log (5.3) di detail tiket.

---

## 8. Fase Pengerjaan

### Fase 1: Fondasi data & helper

- [ ] Migrasi kolom: `is_cek_bentrok` di master mesin, `id_mesin` + `waktu` di slot per jam dan `jadwal_produksi`, `id_tiket_jadwal_produksi` di `jadwal_produksi`
- [ ] Backfill data lama
- [ ] Isi `is_cek_bentrok = 0` untuk mesin paralel (MANUAL, Outsource, dll.)
- [ ] Update model Sequelize terkait
- [ ] Pisahkan helper shift ke `jadwalShiftHelper.js`, calculate memakai helper ini (hasil harus sama persis dengan sebelumnya)
- [ ] Uji & perbaiki kemungkinan bug drying time di calculate (pencarian jam kerja harus mundur, bukan maju)

### Fase 2: Calculate cek bentrok

- [ ] Calculate melompati jam mesin yang sudah terisi
- [ ] Calculate menghapus slot lama sebelum membuat slot baru
- [ ] Calculate & submit mengisi `id_mesin`, `waktu`, `id_tiket_jadwal_produksi`
- [ ] Submit validasi ulang R1

### Fase 3: Endpoint geser

- [ ] `availability`
- [ ] `simulateMove`
- [ ] `suggestSlot`
- [ ] `move` (transaction + lock + log)
- [ ] Dorong berantai dua arah di `simulateMove` dan `move` (bagian 4.3), response menyertakan daftar semua tahapan yang ikut berubah
- [ ] Dokumentasi endpoint untuk frontend

### Fase 4: Frontend

- [ ] Timeline / Gantt per tiket
- [ ] Drag + preview + konflik
- [ ] Cari slot kosong terdekat
- [ ] Simpan + riwayat perubahan
- [ ] Ganti pemakaian endpoint lama `PUT /ppic/jadwalProduksi/:id`

---

## 9. Keputusan Terbuka

| #   | Pertanyaan                                                                                                       | Usulan                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | Kalau geser melanggar R2/R3: ditolak atau tahapan lain ikut terdorong?                                           | **Dorong berantai otomatis dua arah** (bagian 4.3). Karena hasil calculate rapat tanpa jeda, opsi "ditolak" membuat geser lebih lambat praktis tidak mungkin |
| K2  | Penanda mesin paralel: boolean `is_cek_bentrok` atau angka `kapasitas_paralel`?                                  | Mulai dengan boolean. Ganti ke angka kalau ada mesin yang bisa 2–3 job sekaligus                                                                             |
| K3  | Bentrok dengan tiket lain yang sudah calculate tapi belum submit: error atau warning?                            | **Warning**. Yang jadi patokan wajib hanya `jadwal_produksi`                                                                                                 |
| K4  | Boleh geser tiket yang sudah di-submit?                                                                          | Belum. Di luar cakupan dokumen ini                                                                                                                           |
| K5  | Siapa yang boleh geser?                                                                                          | Perlu ditentukan role-nya (misal hanya PPIC)                                                                                                                 |
| K6  | Lembur: kalau slot geser jatuh di jam lembur yang belum terdaftar di `jadwal_lembur_produksi`, boleh atau tidak? | Hanya boleh kalau user centang `is_lembur`, sama seperti calculate                                                                                           |

---

## 10. Risiko & Edge Case

- **Dua PPIC mengedit mesin yang sama bersamaan** → ditangani lock `FOR UPDATE` di `move` + validasi ulang di `submit`.
- **Nama mesin ambigu di data lama `jadwal_produksi`** → backfill `id_mesin` perlu dicek manual.
- **Drying time melewati hari libur** → tetap dihitung jam biasa (sesuai perilaku sekarang), tidak menunggu jam kerja.
- **Tahapan dengan mesin sama berurutan** (misal Cetak 1 dan Cetak 2 di R700) → slot tiket sendiri tidak dihitung bentrok, tapi R2/R3 tetap berlaku.
- **Timezone** → semua perhitungan pakai Asia/Jakarta. Jangan pakai `toISOString()` untuk ambil tanggal (bisa geser 1 hari).
- **Performa** → `suggestSlot` bisa loop banyak jam. Load slot terisi sekali per request untuk seluruh jendela waktu, lalu cek di memori (`Set` berisi `waktu`).
