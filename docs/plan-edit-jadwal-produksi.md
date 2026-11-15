# Perencanaan: Edit Hasil Calculate Jadwal Produksi (Cek Bentrok Mesin & Drying Time)

Dokumen ini untuk tim backend dan frontend. Isinya rencana fitur untuk **mengubah hasil calculate tiket jadwal produksi** sebelum tiket di-submit:

- menggeser jadwal tahapan lebih cepat atau lebih lambat;
- mengubah kapasitas atau drying time sebuah tahapan;

dengan validasi supaya hasilnya tidak bentrok dengan jadwal mesin yang sudah ada dan tidak melanggar urutan tahapan + drying time.

Cakupan: hanya tiket dengan status **`calculated`** (belum di-submit). `jadwal_produksi` hanya dipakai sebagai acuan jam mesin yang sudah terpakai, tidak ikut diubah.

Status: **backend sudah diimplementasikan** (Fase 1–3). Panduan frontend: [frontend-edit-jadwal-produksi.md](frontend-edit-jadwal-produksi.md). Migrasi SQL: [sql/2026-11-16-edit-jadwal-produksi.sql](sql/2026-11-16-edit-jadwal-produksi.sql).

Perbedaan implementasi dari rencana di bawah:

- Kolom `waktu` **tidak dibuat**. Query memakai `tanggal` + `jam` langsung, jadi tidak ada risiko `waktu` tidak sinkron saat jadwal diubah dari layar lain.
- `tiket_jadwal_produksi_per_jam` **tidak** diberi `id_mesin`. Mesin diambil dari tahapannya (join).
- Data lama `jadwal_produksi` **tidak di-backfill** `id_mesin`. Cek bentrok memakai id mesin kalau ada, dan nama mesin untuk data lama.
- Endpoint digabung menjadi `simulate` dan `apply` (melayani geser maupun ubah kapasitas/drying), ditambah `GET /ppic/jadwalProduksi/adjustLog/:id` untuk riwayat. Semua endpoint baru memakai middleware `auth`.
- **Grup tahapan tgl**: tahapan `tgl` yang berurutan berbagi satu jendela 2 hari kerja dan selalu bergeser bersama (perilaku calculate lama dipertahankan).
- **Calculate tidak melompati jam mesin yang terpakai** (mengganti bagian 6.2 "lompati jam yang mesinnya sudah terisi"). Melompati otomatis bisa memajukan jadwal jauh tanpa diketahui, misalnya saat mesin penuh seminggu. Calculate menaruh jadwal di posisi ideal dan mengembalikan bentrok (R1) di `data.conflicts`. PPIC menyelesaikannya lewat:
  - `GET /ppic/jadwalProduksi/conflicts/:id`: daftar bentrok tiket;
  - `POST` / `PUT /ppic/jadwalProduksi/resolveConflicts/:id`: **Selesaikan semua bentrok otomatis** (preview lalu simpan). Setiap tahapan yang bentrok dipindah ke jam valid terdekat, dari yang paling dekat ke FG. Hasilnya boleh disimpan sebagian; sisanya ditangani manual;
  - `suggestSlot` / geser manual per tahapan.
  Submit tetap ditolak selama masih ada bentrok.
- Kode ada di `controller/ppic/jadwalProduksiTiket/service/`: `jadwalShiftHelper.js`, `jadwalLayoutHelper.js`, `jadwalOccupancyHelper.js`, `jadwalCalculateService.js`, `jadwalAdjustService.js`.

---

## Ringkasan Aturan (untuk Dijelaskan ke Client)

Bagian ini memakai bahasa bisnis, tanpa istilah teknis. Detail teknis ada di bagian 1 dan seterusnya.

### Cara sistem menyusun jadwal

1. Jadwal dihitung **mundur dari H-2 hari kerja sebelum tanggal kirim**. Contoh: tanggal kirim Senin, maka target selesai (FG) adalah Jumat (Sabtu dan Jumat dihitung, Minggu dan hari libur dilewati).
2. 2 hari kerja antara FG dan tanggal kirim adalah **cadangan waktu (spare)**. Spare ini bisa dipakai kalau jadwal perlu dimundurkan.
3. Setiap tahapan ditaruh sedekat mungkin dengan target FG. Antar tahapan **tidak ada jeda**, kecuali drying time.
4. Jam kerja mengikuti shift, hari libur, dan jadwal lembur mesin.
5. Lama pengerjaan tiap tahapan mengikuti **tipe kapasitas mesinnya** di master mesin:
   - Mesin tipe **druk** → qty druk ÷ kapasitas per jam, ditambah waktu setting.
   - Mesin tipe **pcs** → qty pcs ÷ kapasitas per jam, ditambah waktu setting. Termasuk Sampling, Packing dan Final Inspection.
   - Tahapan **Plate** dan tahapan yang mesinnya **tidak ada di master mesin** → diberi jatah **2 hari kerja**.
6. **Drying time ditampilkan** di jadwal (jam mulai dan selesai drying), supaya terlihat jelas, tapi **tidak memakai jam mesin** dan tidak masuk ke jadwal produksi resmi.

### Yang bisa diubah PPIC

1. **Geser jadwal tahapan**, lebih cepat atau lebih lambat. Yang digeser adalah **satu tahapan utuh** (misalnya seluruh jam Cetak), bukan jam per jam.
2. **Ubah kapasitas atau drying time** sebuah tahapan. Tidak perlu calculate ulang, jadi perubahan lain yang sudah dibuat tetap ada.

Setiap perubahan dicek dulu oleh sistem dan ditampilkan sebagai **preview** sebelum disimpan.

### Aturan yang tidak boleh dilanggar

| No | Aturan | Penjelasan |
|---|---|---|
| 1 | **Satu mesin, satu pekerjaan per jam** | Mesin tidak boleh dipakai dua JO di jam yang sama. Berlaku untuk **semua mesin, termasuk manual dan outsource**, kecuali mesin yang di master mesin ditandai "boleh dipakai bersamaan". |
| 2 | **Tahapan berikutnya menunggu tahapan sebelumnya selesai + drying time** | Contoh: Cetak selesai jam 16:00 dengan drying 4 jam, maka Pond paling cepat mulai jam 20:00. Kalau jam 20:00 bukan jam kerja, Pond mulai di jam kerja berikutnya. |
| 3 | **Semua tahapan selesai sebelum tanggal kirim** | Boleh memakai spare H-2, tapi tidak boleh melewati tanggal kirim. |
| 4 | **Jadwal tidak boleh di masa lalu** | Saat dimajukan, tahapan tidak boleh jatuh sebelum waktu sekarang. |

### Kondisi yang boleh, tapi diberi tanda peringatan

| No | Kondisi | Penjelasan |
|---|---|---|
| 1 | **Memakai spare** | Tahapan terakhir selesai setelah H-2 tapi masih sebelum tanggal kirim. |
| 2 | Jadwal jatuh di **jam lembur** | PPIC diingatkan bahwa jam itu butuh lembur. |
| 3 | Bentrok dengan **jadwal lain yang masih draft** (sudah dihitung tapi belum disubmit) | Jadwal draft belum resmi, tapi PPIC diingatkan supaya tidak saling tumpang tindih. |

### Tahapan lain yang ikut berubah: pakai ceklis

Saat sebuah tahapan digeser atau diubah, preview menampilkan **daftar tahapan dengan ceklis**:

- Tahapan yang **wajib ikut** (kalau tidak ikut akan tumpang tindih) **otomatis tercentang**.
- PPIC boleh **menambah centang** di tahapan lain yang bersebelahan, supaya ikut dirapatkan.
- Kalau PPIC **menghapus centang** tahapan yang wajib, muncul konflik dan perubahan tidak bisa disimpan.
- Tahapan yang dicentang bergeser **secukupnya**, yaitu dirapatkan ke tahapan di sebelahnya supaya tidak tumpang tindih. Tahapan yang tidak dicentang tetap di tempatnya.
- Tahapan yang ikut bergeser juga dicek mesinnya. Kalau mesinnya sudah terpakai, sistem mencarikan jam kosong berikutnya.

| Arah geser | Yang wajib ikut |
|---|---|
| **Lebih cepat** | Tahapan **sebelumnya**, kalau jaraknya jadi kurang. Tahapan sesudahnya tidak wajib. |
| **Lebih lambat** | Tahapan **sesudahnya**, kalau jaraknya jadi kurang. Tahapan sebelumnya tidak wajib. Kalau akhirnya melewati tanggal kirim, perubahan ditolak. |

### Ubah kapasitas atau drying time: pilihan A atau B

Mengubah kapasitas membuat **lama pengerjaan** tahapan berubah. Mengubah drying time membuat **jarak ke tahapan berikutnya** berubah. PPIC memilih ke arah mana perubahan itu ditampung:

| Pilihan | Yang tetap | Yang ikut bergeser | Kapan dipakai |
|---|---|---|---|
| **A (default)** | Jam mulai tahapan | Tahapan **sesudahnya** mundur (memakai spare) | Jam mulai mesin sudah direncanakan atau sudah dikomunikasikan ke operator |
| **B** | Jam selesai tahapan | Tahapan ini dan tahapan **sebelumnya** maju | Spare ingin tetap disimpan |

Kalau durasinya **berkurang**, muncul jeda kosong (A: sesudah tahapan, B: sebelum tahapan). Tahapan lain tidak wajib ikut, kecuali PPIC mencentangnya.

Nilai kapasitas dan drying time yang diubah **hanya berlaku untuk tiket ini**. Master dan IO tidak ikut berubah.

Tombol **Calculate ulang** tetap ada, tapi semua perubahan manual akan hilang, jadi sistem meminta konfirmasi dulu.

### Contoh

Agar mudah dibaca, contoh ini menganggap jam kerja **08:00–16:00, Senin–Sabtu**, Minggu libur. Tanggal kirim: **Senin**. Target FG (H-2 hari kerja): **Jumat**. Spare: **Jumat dan Sabtu**.

**Hasil calculate:**

| Tahapan | Mesin | Jadwal | Drying |
|---|---|---|---|
| Potong | ITTOH | Rabu 08:00–10:00 | - |
| Cetak | R700 | Rabu 10:00–16:00 | 4 jam: Rabu 16:00–20:00 |
| Pond | BAODER | Kamis 08:00–12:00 | - |
| Lem | JK 1000 | Kamis 12:00–16:00 | - |
| FG | - | Jumat (H-2) | - |

Drying Cetak selesai Rabu 20:00. Jam itu bukan jam kerja, jadi Pond mulai Kamis 08:00.

**Contoh 1: geser lebih cepat.**
Mesin R700 sudah dipakai JO-0012 pada Rabu 12:00–16:00. PPIC menggeser Cetak supaya mulai **Selasa 14:00**.

| Ceklis | Tahapan | Sebelum | Sesudah | Keterangan |
|---|---|---|---|---|
| ☑ wajib | Potong | Rabu 08:00–10:00 | **Selasa 12:00–14:00** | Harus selesai sebelum Cetak mulai |
| (diubah) | Cetak | Rabu 10:00–16:00 | **Selasa 14:00–16:00 dan Rabu 08:00–12:00** | Tidak lagi bentrok dengan JO-0012 |
| ☐ | Pond | Kamis 08:00–12:00 | Kamis 08:00–12:00 | Tetap (Cetak selesai Rabu 12:00 + drying = Rabu 16:00) |
| ☐ | Lem | Kamis 12:00–16:00 | Kamis 12:00–16:00 | Tetap |

**Contoh 2: geser lebih lambat, memakai spare.**
PPIC menggeser Cetak ke **Kamis 08:00–14:00**. Drying selesai Kamis 18:00, jadi Pond dan Lem wajib ikut mundur.

| Ceklis | Tahapan | Sebelum | Sesudah | Keterangan |
|---|---|---|---|---|
| ☐ | Potong | Rabu 08:00–10:00 | Rabu 08:00–10:00 | Tidak wajib. Kalau dicentang, dirapatkan ke Rabu 14:00–16:00 |
| (diubah) | Cetak | Rabu 10:00–16:00 | **Kamis 08:00–14:00** | Drying Kamis 14:00–18:00 |
| ☑ wajib | Pond | Kamis 08:00–12:00 | **Jumat 08:00–12:00** | Mulai setelah drying Cetak selesai |
| ☑ wajib | Lem | Kamis 12:00–16:00 | **Jumat 12:00–16:00** | Selesai di hari spare |

Lem selesai Jumat 16:00: lewat target FG (Jumat) tapi masih sebelum tanggal kirim (Senin). **Boleh, dengan peringatan "memakai spare".**

**Contoh 3: geser lebih lambat, ditolak.**
PPIC menggeser Cetak ke **Sabtu 08:00–14:00**. Pond jadi Senin 08:00–12:00 dan Lem Senin 12:00–16:00, sehingga melewati tanggal kirim. **Ditolak.** Pilihan PPIC: geser lebih cepat, pakai lembur, atau ajukan perubahan tanggal kirim.

**Contoh 4: ubah kapasitas Cetak, dari 6 jam menjadi 8 jam.**

| Tahapan | Pilihan A (jam mulai tetap) | Pilihan B (jam selesai tetap) |
|---|---|---|
| Potong | Tetap Rabu 08:00–10:00 | ☑ wajib, maju ke **Selasa 14:00–16:00** |
| Cetak | Rabu 10:00–16:00 + **Kamis 08:00–10:00** | **Rabu 08:00–16:00** |
| Pond | ☑ wajib, mundur ke **Kamis 14:00–16:00 + Jumat 08:00–10:00** | Tetap Kamis 08:00–12:00 |
| Lem | ☑ wajib, mundur ke **Jumat 10:00–14:00** | Tetap Kamis 12:00–16:00 |
| Hasil | Boleh, dengan peringatan "memakai spare" | Boleh, spare tetap utuh |

**Contoh 5: mesin manual / outsource.**
Tahapan Lem Samping dengan mesin MANUAL **tidak boleh** dijadwalkan di jam yang sama dengan JO lain yang juga memakai MANUAL, karena semua mesin default dicek bentrok. Kalau ternyata pekerjaan MANUAL memang bisa dikerjakan bersamaan, admin menandai mesin MANUAL sebagai "boleh dipakai bersamaan" di master mesin. Setelah itu kedua JO boleh dijadwalkan di jam yang sama.

### Usulan agar jadwal bisa lebih cepat atau lebih lambat

Selain menggeser dan mengubah kapasitas/drying, ada opsi lain untuk membuka ruang gerak. Kolom **Sistem** menunjukkan seberapa besar perubahan program yang dibutuhkan.

#### A. Agar pekerjaan bisa selesai lebih cepat

| No | Opsi | Cara kerja | Kelebihan | Kekurangan | Sistem |
|---|---|---|---|---|---|
| A1 | **Lembur** | Membuka jam di luar shift (malam, Sabtu sore, Minggu) untuk mesin tertentu. Jadwal lembur per mesin sudah ada di sistem. | Sudah tersedia. Tahapan selesai lebih cepat tanpa mengubah urutan. | Biaya lembur. Butuh ketersediaan operator. | Kecil. Tinggal ditampilkan sebagai pilihan saat menggeser. |
| A2 | **Pindah ke mesin lain** | Tahapan dipindah ke mesin lain yang bisa mengerjakan tahapan yang sama. Contoh: Cetak 1 bisa di R700, SM atau GTO. Pond bisa di BAODER, KSB atau Eterna. | Bentrok bisa diselesaikan tanpa menggeser jam. | Kapasitas per jam tiap mesin berbeda, jadi lama pengerjaan bisa berubah. | Sedang. Sistem menawarkan mesin alternatif yang kosong dan menghitung ulang durasinya. |
| A3 | **Outsource** | Tahapan dikerjakan pihak luar. | Tidak bergantung pada mesin internal. | Biaya, kontrol kualitas, dan waktu kirim-ambil barang. Default tetap dicek bentrok seperti mesin lain, kecuali ditandai "boleh dipakai bersamaan". | Kecil. Outsource sudah ada sebagai mesin. |
| A4 | **Bagi ke 2 mesin sekaligus** | Qty satu tahapan dibagi dua dan dikerjakan bersamaan di 2 mesin. | Lama pengerjaan bisa hampir setengahnya. | Setting dua kali, dua mesin terpakai sekaligus. | Besar. Satu tahapan jadi punya beberapa mesin dan beberapa blok jadwal. |
| A5 | **Tahapan tumpang tindih** | Tahapan berikutnya boleh mulai setelah sebagian hasil tahapan sebelumnya selesai (misal 30%). | Paling efektif mempersingkat total waktu produksi. | Butuh pengaturan alur barang setengah jadi. Drying time harus dihitung per bagian. | Besar. Aturan "tunggu selesai + drying" berubah menjadi per bagian. |
| A6 | **Tinjau ulang drying time di master** | Drying time di master dicek ulang. Banyak tahapan saat ini memakai 24 jam. | Kalau bisa lebih pendek, semua jadwal langsung lebih rapat. | Harus dipastikan tidak menurunkan kualitas. | Kecil. Cukup ubah data master. |
| A7 | **Prioritas JO** | JO yang lebih mendesak boleh mengambil jam mesin JO lain, lalu JO yang tergeser dihitung ulang. | Pesanan mendesak bisa didahulukan. | Bisa memicu efek berantai ke banyak JO. Perlu persetujuan atasan. | Besar. Butuh aturan prioritas dan persetujuan. |

#### B. Agar jadwal boleh dimundurkan

| No | Opsi | Cara kerja | Kelebihan | Kekurangan | Sistem |
|---|---|---|---|---|---|
| B1 | **Ubah tanggal kirim** | Tanggal kirim dinegosiasikan ulang dengan customer. Fitur pengajuan dan persetujuan perubahan tanggal kirim sudah ada. | Sudah tersedia. | Tergantung persetujuan customer. | Kecil. Tinggal dihubungkan ke layar geser jadwal. |
| B2 | **Hitung maju dari tanggal mulai** | Pilihan menghitung maju dari tanggal mulai produksi secepat mungkin. Sisa waktu sampai tanggal kirim menjadi toleransi. | Ruang mundur lebih besar. | Barang menumpuk lebih lama di gudang. Mesin terisi lebih awal. | Sedang. Calculate punya mode kedua. |
| B3 | **Spare sebelum tanggal kirim** | FG ditargetkan H-2 hari kerja sebelum tanggal kirim. | Toleransi jelas dan sama untuk semua tiket. | Jadwal mulai 2 hari kerja lebih awal. | **Sudah diputuskan dipakai** (bagian 9, D1). |
| B4 | **Kirim sebagian** | Sebagian qty dikirim tepat di tanggal kirim, sisanya menyusul. | Customer tetap menerima sebagian pesanan tepat waktu. | Butuh persetujuan customer dan pengiriman lebih dari sekali. | Besar. Satu tiket jadi punya beberapa target qty dan tanggal. |

#### Usulan urutan penerapan

1. **Masuk rencana ini**: B3 Spare H-2, ubah kapasitas/drying per tiket.
2. **Langsung bisa dipakai** karena fiturnya sudah ada: A1 Lembur, B1 Ubah tanggal kirim, A6 Tinjau drying time di master.
3. **Tahap berikutnya**: A2 Pindah ke mesin lain, B2 Hitung maju.
4. **Jangka panjang**: A4, A5, A7, B4. Perlu dibicarakan dulu dengan produksi dan customer.

### Hal yang perlu dikonfirmasi ke client

1. **Mesin yang boleh dipakai bersamaan.** Semua mesin, termasuk manual dan outsource, default dicek bentrok. Apakah ada mesin yang sejak awal perlu ditandai "boleh dipakai bersamaan"? Kandidatnya: mesin yang namanya mengandung "MANUAL" atau "OUTSOURCE" (MANUAL, MANUAL 2, MANUAL 3, RABUT MANUAL, Sortir Manual, PACKING MANUAL, SAMPLING MANUAL, FINAL INSPECTION MANUAL, Outsource, OUTSOURCE - CETAK, OUTSOURCE - FOIL, Full Outsorch, dll.).
2. **Mesin gabungan** seperti "R700 / SM" dan "SM / GTO": kalau dijadwalkan, apakah memakai kedua mesin, salah satu, atau dianggap mesin sendiri?
3. **Sabtu** (shift hanya sampai 13:00) dihitung 1 hari kerja penuh untuk H-2, atau tidak?
4. **Jadwal yang sudah disubmit** apakah boleh diubah lagi? (Usulan: belum, untuk tahap pertama.)
5. **Siapa yang boleh mengubah jadwal?** (Misalnya hanya PPIC.)
6. **Jadwal di jam lembur** yang belum terdaftar di jadwal lembur mesin: boleh langsung dipakai, atau harus didaftarkan dulu?
7. Apakah PPIC **wajib mengisi alasan** setiap kali mengubah jadwal?

---

## 1. Latar Belakang

Hasil `calculate` tiket jadwal produksi perlu bisa diubah oleh PPIC, karena:

- Jam yang dihasilkan calculate bisa jatuh di jam mesin yang **sudah dipakai JO lain** (sudah ada di `jadwal_produksi`).
- Kapasitas atau drying time sebuah tahapan bisa perlu disesuaikan dengan kondisi lapangan.
- Jadwal hasil perubahan tetap **tidak boleh bentrok dengan tahapan lain**: `jam selesai tahapan + drying time` harus ≤ `jam mulai tahapan berikutnya`.

---

## 2. Kondisi Sekarang

File utama: `controller/ppic/jadwalProduksiTiket/jadwalProduksiController.js`

| Endpoint | Fungsi | Catatan |
|---|---|---|
| `GET /ppic/calculateJadwalProduksi/:id` | `calculateTiketJadwalProduksi` | Hitung mundur dari `tgl_kirim`, per jam, cek shift / libur / lembur per mesin. **Tidak cek apakah mesin sudah terisi JO lain.** |
| `PUT /ppic/jadwalProduksi/:id` | `updateTiketJadwalProduksi` | Geser 1 slot per jam, lalu semua slot setelahnya ikut digeser dengan selisih waktu yang sama. **Tidak cek bentrok mesin, tidak cek drying time.** Logika shift berbeda dengan calculate (pakai `toISOString()` / UTC, tidak pakai lembur per mesin). |
| `PUT /ppic/jadwalProduksi/submit/:id` | `submitTiketJadwalProduksi` | Copy semua slot `tiket_jadwal_produksi_per_jam` ke `jadwal_produksi`. |

Struktur data terkait:

| Tabel | Isi | Kunci waktu |
|---|---|---|
| `tiket_jadwal_produksi` | Header tiket (JO / booking), `tgl_kirim`, `status` | - |
| `tiket_jadwal_produksi_tahapan` | Tahapan tiket: `from` (`tgl`/`pcs`/`druk`), `mesin`, `id_mesin`, `id_tahapan`, `setting`, `kapasitas_per_jam`, `drying_time`, `tgl_from`, `tgl_to` (string) | - |
| `tiket_jadwal_produksi_per_jam` | Slot 1 jam per tahapan hasil calculate | `tanggal` (DATE) + `jam` (TIME) |
| `jadwal_produksi` | Slot 1 jam yang sudah di-submit (jadwal resmi) | `tanggal` (DATE) + `jam` (TIME), mesin pakai **nama** |
| `jadwal_produksi_lembur` | Jadwal lembur per mesin per tanggal (`shift_1`, `shift_2`) | `tanggal_lembur` |

Temuan yang perlu diperhatikan:

- `jadwal_produksi` tidak punya `id_mesin` dan tidak punya `id_tiket_jadwal_produksi`, jadi cek bentrok saat ini hanya bisa pakai nama mesin dan `no_jo`/`no_booking`.
- Banyak mesin manual dan outsource (MANUAL, RABUT MANUAL, Outsource, dll.) dipakai banyak tahapan sekaligus. Karena semua mesin default dicek bentrok, mesin-mesin ini akan sering terdeteksi bentrok sampai ditandai `allow_concurrent = 1`. RABUT MANUAL saja sudah memakai 168 slot di `jadwal_produksi` (data dev).
- Ada mesin gabungan "R700 / SM" (id 14) dan "SM / GTO" (id 22) yang aturan bentroknya belum jelas.
- `calculateTiketJadwalProduksi` tidak menghapus slot per jam yang lama sebelum membuat slot baru. Kalau calculate dijalankan dua kali pada tiket yang sama, slot bisa dobel.
- Hasil calculate **rapat tanpa jeda**: tahapan sebelum FG selesai tepat di `tgl_kirim`, dan setiap tahapan selesai tepat di `mulai tahapan berikutnya − drying`. Tanpa spare, geser lebih lambat hampir selalu melanggar aturan.
- **Kemungkinan bug drying time (belum diuji):** setelah mengurangi drying, calculate memanggil `findNextAvailableShiftTime` yang mencari jam kerja **maju**, padahal penyusunannya mundur. Contoh: tahapan berikutnya mulai Senin 08:00, drying 4 jam, jadi hitungannya Senin 03:00 (bukan jam kerja). Pencarian maju sampai Senin 08:00, sehingga slot terakhir tahapan ini = slot pertama tahapan berikutnya dan drying terlewati. Perbaikan: cari jam kerja **mundur**. Bug ini akan langsung terlihat begitu drying ditampilkan sebagai data.
- `tgl_to` tahapan saat ini berisi jam mulai tahapan berikutnya (sudah termasuk drying), bukan jam selesai produksi yang sebenarnya.
- `decrementDate` (dipakai untuk tahapan `tgl`) hanya melewati tanggal di jadwal libur karyawan, **tidak otomatis melewati hari Minggu**. Perlu diperbaiki sebelum dipakai untuk H-2 hari kerja.

---

## 3. Istilah

| Istilah | Arti |
|---|---|
| **Slot** | 1 baris jadwal per jam (`tanggal` + `jam`) untuk 1 tahapan di 1 mesin |
| **Blok tahapan** | Semua slot milik 1 tahapan pada 1 tiket |
| **Mulai / selesai tahapan** | `mulai` = slot pertama, `selesai` = slot terakhir + 1 jam |
| **Drying time** | Jeda (jam biasa, tidak ikut shift) setelah tahapan selesai sebelum tahapan berikutnya boleh mulai. Disimpan sebagai `drying_mulai` / `drying_selesai`, tidak memakai jam mesin |
| **Target FG** | H-2 hari kerja sebelum `tgl_kirim`. Calculate menghitung mundur dari sini |
| **Spare** | Rentang antara target FG dan `tgl_kirim`. Boleh dipakai dengan peringatan |
| **Tahapan wajib ikut** | Tahapan yang akan tumpang tindih kalau tidak ikut bergeser. Otomatis tercentang |
| **Dirapatkan** | Tahapan disusun ulang sedekat mungkin dengan tahapan di sebelahnya, tanpa tumpang tindih (memperhitungkan drying) |
| **Bentrok mesin** | Slot di mesin yang sama, jam yang sama, sudah dipakai tiket lain |

---

## 4. Aturan Validasi

| # | Aturan | Jenis | Rumus |
|---|---|---|---|
| R1 | Bentrok mesin | **Wajib** | Tidak boleh ada slot `(id_mesin, waktu)` yang sudah ada di `jadwal_produksi` milik tiket lain. Tidak berlaku untuk mesin dengan `allow_concurrent = 1` |
| R2 | Urutan dengan tahapan sebelumnya | **Wajib** | `mulai(i) ≥ drying_selesai(i-1)`, yaitu `selesai(i-1) + drying(i-1)` |
| R3 | Urutan dengan tahapan berikutnya | **Wajib** | `drying_selesai(i) ≤ mulai(i+1)` |
| R4 | Tanggal kirim | **Wajib** | Tahapan terakhir sebelum FG selesai ≤ `tgl_kirim` |
| R5 | Tidak di masa lalu | **Wajib** | Semua slot ≥ waktu sekarang (dibulatkan ke jam berikutnya) |
| R6 | Memakai spare | Peringatan | Tahapan terakhir sebelum FG selesai > target FG |
| R7 | Di luar shift normal | Peringatan | Slot jatuh di jam lembur |
| R8 | Bentrok dengan tiket draft | Peringatan | Slot sama dengan `tiket_jadwal_produksi_per_jam` tiket lain yang statusnya `calculated` |

### 4.1 Tahapan dengan `from = "tgl"`

Tahapan `tgl` (Plate, dan tahapan yang mesinnya tidak ada di master mesin) tidak punya slot per jam, hanya rentang tanggal (2 hari kerja). Untuk fase awal:

- Digeser per **tanggal**, bukan per jam.
- Hanya dicek R2, R3, R4, R5. Tidak dicek bentrok mesin.
- Tidak bisa diubah kapasitasnya (tidak punya kapasitas), tapi drying time-nya bisa diubah.

### 4.2 Tahapan FG

- Calculate menaruh FG di **target FG** (H-2 hari kerja sebelum `tgl_kirim`).
- FG tidak digeser langsung oleh PPIC. Kalau tahapan terakhir mundur melewati target FG (memakai spare), FG mengikuti selesainya tahapan terakhir.
- FG tidak pernah boleh melewati `tgl_kirim` (R4).

### 4.3 Ceklis tahapan yang ikut berubah

Berlaku untuk geser jadwal maupun ubah kapasitas/drying.

1. Sistem menghitung **tahapan wajib ikut**: tahapan yang melanggar R2/R3 kalau tidak ikut bergeser. Tahapan ini otomatis tercentang.
2. PPIC boleh menambah centang pada tahapan yang **bersebelahan** dengan rangkaian yang sudah bergeser (ke arah sebelum maupun sesudah). Tahapan yang tidak bersebelahan tidak bisa dicentang, supaya tidak ada tahapan yang "loncat" sendiri.
3. Tahapan yang dicentang **dirapatkan secukupnya** ke tahapan di sebelahnya (ke arah tahapan yang diubah):
   - tahapan **sesudah**: mulai = jam kerja pertama ≥ `drying_selesai` tahapan sebelumnya;
   - tahapan **sebelum**: selesai = jam kerja terakhir ≤ `mulai tahapan sesudahnya − drying tahapan ini`.
4. Saat dirapatkan, jam yang mesinnya sudah terpakai (R1) dilompati ke jam kosong berikutnya **ke arah yang sama**.
5. Kalau tahapan wajib **dihapus centangnya**, R2/R3 dilaporkan sebagai konflik dan perubahan tidak bisa disimpan.
6. Tahapan yang tidak dicentang tidak berubah sama sekali.

### 4.4 Ubah kapasitas atau drying time

- Nilai baru disimpan di `tiket_jadwal_produksi_tahapan` tiket ini saja. Master mesin, master drying time, dan IO tidak berubah.
- Kapasitas berubah → hitung ulang `kapasitas = qty / kapasitas_per_jam` dan `total_waktu_produksi = ceil(setting / 60) + kapasitas`, lalu susun ulang blok tahapan.
- Drying berubah → hitung ulang `drying_mulai` / `drying_selesai`.
- PPIC memilih mode:
  - **A `mulai_tetap` (default)**: blok tahapan disusun **maju** dari jam mulai yang sama. Tahapan sesudahnya bisa jadi wajib ikut.
  - **B `selesai_tetap`**: blok tahapan disusun **mundur** dari jam selesai yang sama. Untuk perubahan drying, tahapan ini ikut dimajukan supaya `drying_selesai` tetap. Tahapan sebelumnya bisa jadi wajib ikut.
- Setelah itu ceklis berlaku seperti 4.3.
- **Tidak perlu calculate ulang.** Calculate ulang menyusun semua tahapan dari nol dan menghapus semua perubahan manual, jadi harus lewat konfirmasi.

### 4.5 Drying time sebagai data

- Setiap tahapan menyimpan `produksi_mulai`, `produksi_selesai`, `drying_mulai`, `drying_selesai`.
- `drying_mulai = produksi_selesai`, `drying_selesai = drying_mulai + drying_time` (jam biasa, tidak ikut shift).
- Drying **tidak** dibuat sebagai slot di `tiket_jadwal_produksi_per_jam`, tidak di-copy ke `jadwal_produksi` saat submit, dan tidak dihitung sebagai mesin terpakai.
- Kalau frontend butuh tampilan per jam, API memecah rentang drying saat ditampilkan.

---

## 5. Perubahan Data

### 5.1 Master mesin

Tambah penanda mesin yang **boleh dipakai beberapa JO di jam yang sama**. Mesin seperti ini tidak dicek bentrok (R1).

| `allow_concurrent` | Arti |
|---|---|
| `0` (default) | Hanya 1 JO per jam, dicek bentrok |
| `1` | Boleh beberapa JO sekaligus, tidak dicek bentrok |

**Semua mesin default `0`, termasuk mesin manual dan outsource.** Migrasi tidak mengubah mesin mana pun menjadi `1`. Kalau ada mesin yang memang boleh dipakai bersamaan, admin mengubahnya sendiri dari layar master mesin.

```sql
ALTER TABLE ms_mesin_tahapan
  ADD COLUMN allow_concurrent TINYINT(1) NOT NULL DEFAULT 0 AFTER type_kapasitas;
```

> Akibatnya: mesin yang dipakai banyak tahapan sekaligus, seperti MANUAL, RABUT MANUAL dan Outsource, akan sering terdeteksi bentrok sampai `allow_concurrent`-nya diubah menjadi `1`. Lihat bagian 10.

Alternatif yang lebih fleksibel: `max_concurrent_jobs INT` (1 = hanya 1 JO per jam, 3 = maksimal 3 JO per jam, 0 = tidak dibatasi). Lihat K1.

### 5.2 Tiket & tahapan

```sql
ALTER TABLE tiket_jadwal_produksi
  ADD COLUMN tgl_target_fg DATE NULL AFTER tgl_kirim;   -- H-2 hari kerja

ALTER TABLE tiket_jadwal_produksi_tahapan
  ADD COLUMN produksi_mulai DATETIME NULL,
  ADD COLUMN produksi_selesai DATETIME NULL,
  ADD COLUMN drying_mulai DATETIME NULL,
  ADD COLUMN drying_selesai DATETIME NULL,
  ADD COLUMN is_diubah_manual TINYINT(1) NOT NULL DEFAULT 0;
```

`tgl_from` / `tgl_to` tetap diisi supaya tampilan lama tidak rusak.

### 5.3 Slot per jam & jadwal produksi

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
- `waktu` = gabungan `tanggal` + `jam`, supaya query rentang waktu sederhana. `tanggal` dan `jam` tetap disimpan.
- `id_tiket_jadwal_produksi` → untuk mengecualikan slot milik tiket sendiri dan untuk penelusuran.

Backfill data lama:

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

### 5.4 Log perubahan

```sql
CREATE TABLE tiket_jadwal_produksi_adjust_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_tiket_jadwal_produksi INT NOT NULL,
  id_tiket_jadwal_produksi_tahapan INT NOT NULL,   -- tahapan yang diubah PPIC
  jenis VARCHAR(30) NOT NULL,                       -- geser | ubah_kapasitas | ubah_drying
  mode VARCHAR(20) NULL,                            -- mulai_tetap | selesai_tetap
  nilai_lama TEXT NULL,                             -- JSON: posisi/kapasitas/drying lama
  nilai_baru TEXT NULL,                             -- JSON: posisi/kapasitas/drying baru
  tahapan_ikut TEXT NULL,                           -- JSON: daftar tahapan yang ikut bergeser + posisi lama/baru
  alasan VARCHAR(255) NULL,
  id_user INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

---

## 6. Backend

### 6.1 Pisahkan helper

Logika shift sekarang ada di dalam `calculateTiketJadwalProduksi` (`isWithinShiftHours`, `getLemburInfo`, `isDayOff`, `isInIstirahat`, `findNextAvailableShiftTime`, data libur & lembur). Pindahkan ke modul bersama supaya calculate, simulasi, dan apply memakai aturan yang sama:

```
controller/ppic/jadwalProduksiTiket/service/
  jadwalShiftHelper.js      ← load shift, libur, lembur; jam kerja; hari kerja
  jadwalOccupancyHelper.js  ← slot terisi per mesin & rentang waktu
  jadwalLayoutHelper.js     ← layForward / layBackward satu tahapan
  jadwalAdjustService.js    ← simulate, suggestSlot, apply
```

Contoh bentuk helper:

```js
const ctx = await loadShiftContext({ tglMulai, tglSelesai, mesinList, isLemburGlobal });

ctx.isWorkingHour(date, mesin);      // true / false
ctx.isLemburHour(date, mesin);       // untuk R7
ctx.subtractWorkingDays(date, 2);    // H-2 hari kerja (lewati Minggu + libur)

const occ = await loadOccupancy({ idMesinList, from, to, excludeIdTiket });
occ.isOccupied(idMesin, waktu);      // R1
occ.isDraftOccupied(idMesin, waktu); // R8

// susun 1 tahapan; lompati jam bukan kerja dan jam terisi (kalau skipOccupied)
layForward(tahapan, start, { ctx, occ, skipOccupied });   // → { slots, mulai, selesai }
layBackward(tahapan, end,   { ctx, occ, skipOccupied });  // → { slots, mulai, selesai }
```

### 6.2 Perubahan calculate

- Hitung mundur dari **target FG = H-2 hari kerja** sebelum `tgl_kirim` (`ctx.subtractWorkingDays`). Simpan di `tiket_jadwal_produksi.tgl_target_fg`.
- Perbaiki pencarian jam kerja setelah drying: cari **mundur**, bukan maju (bug di bagian 2).
- **Lompati jam yang mesinnya sudah terisi** di `jadwal_produksi` (kecuali mesin `allow_concurrent = 1`).
- Isi `produksi_mulai`, `produksi_selesai`, `drying_mulai`, `drying_selesai` per tahapan. `tgl_to` diisi selesai produksi yang sebenarnya.
- Hapus slot per jam lama tiket ini sebelum membuat yang baru, dan reset `is_diubah_manual`.
- Simpan `id_mesin` dan `waktu` di setiap slot.

### 6.3 Endpoint baru

Semua pakai auth. `:id_tahapan` = `tiket_jadwal_produksi_tahapan.id` (tahapan yang diubah PPIC).

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ppic/jadwalProduksi/availability/:id_tahapan` | Status per jam mesin + zona warna untuk 1 tahapan |
| POST | `/ppic/jadwalProduksi/simulate/:id_tahapan` | Simulasi geser / ubah kapasitas / ubah drying, **tidak menyimpan** |
| POST | `/ppic/jadwalProduksi/suggestSlot/:id_tahapan` | Cari jam mulai valid terdekat |
| PUT | `/ppic/jadwalProduksi/apply/:id_tahapan` | Validasi ulang + simpan |

Endpoint lama `PUT /ppic/jadwalProduksi/:id` tidak bentrok dengan path di atas (beda jumlah segmen).

#### Body `simulate` dan `apply`

```json
// geser jadwal
{
  "jenis": "geser",
  "new_start": "2026-11-18 14:00",
  "ikut": [118],
  "is_lembur": false,
  "alasan": "R700 dipakai JO-0012"
}

// ubah kapasitas dan/atau drying
{
  "jenis": "ubah_parameter",
  "kapasitas_per_jam": 800,
  "drying_time": 6,
  "mode": "mulai_tetap",
  "ikut": [121, 122],
  "alasan": "Kapasitas R700 turun"
}
```

- `ikut` opsional di `simulate`. Kalau tidak dikirim, sistem memakai tahapan wajib ikut saja (centang otomatis). Frontend mengirim `ikut` setelah PPIC mengubah ceklis.
- `alasan` hanya dipakai di `apply`.

#### Response `simulate`

```json
{
  "valid": true,
  "tgl_target_fg": "2026-11-21",
  "tgl_kirim": "2026-11-24",
  "tahapan": [
    {
      "id": 118,
      "tahapan": "Potong",
      "peran": "ikut",
      "wajib_ikut": true,
      "dicentang": true,
      "bisa_dicentang": true,
      "lama": { "mulai": "2026-11-19 08:00", "selesai": "2026-11-19 10:00" },
      "baru": {
        "mulai": "2026-11-18 12:00",
        "selesai": "2026-11-18 14:00",
        "drying_mulai": "2026-11-18 14:00",
        "drying_selesai": "2026-11-18 14:00"
      }
    },
    {
      "id": 120,
      "tahapan": "Cetak",
      "peran": "diubah",
      "lama": { "mulai": "2026-11-19 10:00", "selesai": "2026-11-19 16:00" },
      "baru": {
        "mulai": "2026-11-18 14:00",
        "selesai": "2026-11-19 12:00",
        "drying_mulai": "2026-11-19 12:00",
        "drying_selesai": "2026-11-19 16:00"
      }
    },
    {
      "id": 121,
      "tahapan": "Pond",
      "peran": "tetap",
      "wajib_ikut": false,
      "dicentang": false,
      "bisa_dicentang": true
    }
  ],
  "conflicts": [],
  "warnings": [
    { "rule": "R7", "waktu": "2026-11-18 20:00", "msg": "Jam lembur" }
  ]
}
```

Nilai `peran`: `diubah` (tahapan yang diubah PPIC), `ikut` (dicentang, ikut bergeser), `tetap`.

Contoh konflik:

```json
{ "rule": "R1", "id_tahapan": 120, "waktu": "2026-11-19 13:00", "no_jo": "JO-0012", "msg": "Mesin R700 sudah dipakai JO-0012" }
{ "rule": "R3", "id_tahapan": 121, "msg": "Pond wajib ikut, tapi tidak dicentang" }
{ "rule": "R4", "msg": "Lem selesai 2026-11-24 16:00, melewati tanggal kirim" }
{ "rule": "R5", "id_tahapan": 117, "msg": "Plate jatuh sebelum waktu sekarang" }
```

#### GET `availability`

Query: `from`, `to` (opsional, default = dari sekarang sampai `tgl_kirim`).

Mengembalikan status tiap jam di mesin tahapan itu, plus **zona** jam mulai:

| Zona | Arti |
|---|---|
| `hijau` | Bisa mulai di jam ini tanpa menggeser tahapan lain |
| `kuning` | Bisa, tapi ada tahapan yang wajib ikut bergeser |
| `merah` | Tidak mungkin: lewat tanggal kirim, sebelum waktu sekarang, atau bentrok mesin |

Status per jam: `kosong`, `terisi` (+ `no_jo`), `terisi_draft`, `lembur`, `di_luar_shift`, `milik_tiket_ini`.

Zona dihitung dengan menjalankan simulasi ringan untuk setiap kandidat jam mulai di rentang itu. Slot terisi dan konteks shift di-load sekali per request.

#### POST `suggestSlot`

Body: `{ "jenis": "geser", "around": "2026-11-19 10:00" }` (opsional, default = posisi sekarang).

Mencari jam mulai valid **terdekat** dari `around`, ke arah **lebih cepat dulu**, lalu ke arah lebih lambat. Response sama seperti `simulate`, atau `404` kalau tidak ada jam yang valid antara sekarang dan `tgl_kirim`.

#### PUT `apply`

Proses:

1. Buka transaction.
2. Lock slot mesin yang terkait: `SELECT ... FROM jadwal_produksi WHERE id_mesin IN (?) AND waktu BETWEEN ? AND ? FOR UPDATE`.
3. Jalankan simulasi yang sama dengan `ikut` dari body. Kalau ada konflik wajib, atau ada tahapan wajib ikut yang tidak ada di `ikut` → rollback, `409` + daftar konflik.
4. Untuk setiap tahapan yang berubah: hapus slot lama di `tiket_jadwal_produksi_per_jam`, insert slot baru, update `produksi_*`, `drying_*`, `tgl_from`, `tgl_to`, `is_diubah_manual = 1`.
5. Untuk `ubah_parameter`: update `kapasitas_per_jam`, `drying_time`, `kapasitas`, `total_waktu_produksi`, `total_waktu` tahapan itu.
6. Update `tgl_mulai_produksi` tiket kalau tahapan pertama berubah.
7. Insert log (5.4).
8. Commit.

Hanya boleh untuk tiket dengan `status = "calculated"`.

### 6.4 Algoritma simulasi

```
function simulate(tiket, k, perubahan, ikut = null):
  ctx  = loadShiftContext(...)
  occ  = loadOccupancy(semua mesin tiket, sekarang .. tgl_kirim, kecuali tiket ini)
  plan = salinan posisi semua tahapan sekarang
  conflicts = []; warnings = []

  // 1. susun ulang tahapan k (tidak melompati jam terisi: bentrok dilaporkan)
  if perubahan.jenis == "geser":
    plan[k] = layForward(k, perubahan.new_start, skipOccupied = false)
  else:
    terapkan kapasitas_per_jam / drying_time baru ke k, hitung ulang durasi
    if perubahan.mode == "mulai_tetap":
      plan[k] = layForward(k, plan[k].mulai, skipOccupied = false)
    else:  // selesai_tetap
      batasSelesai = plan[k].drying_selesai_lama - drying_baru(k)
      plan[k] = layBackward(k, batasSelesai, skipOccupied = false)
  laporkan R1 untuk slot k yang terisi

  // 2. tahapan sesudah k
  for j = k+1 .. tahapan terakhir sebelum FG:
    batas = plan[j-1].drying_selesai
    wajib = plan[j].mulai < batas
    dicentang = (ikut == null) ? wajib : (j in ikut)
    if wajib and not dicentang: conflicts.push(R3 di j); break
    if not dicentang: break                          // rangkaian berhenti
    plan[j] = layForward(j, batas, skipOccupied = true)   // dirapatkan

  // 3. tahapan sebelum k
  for j = k-1 .. tahapan pertama:
    batas = plan[j+1].mulai - drying(j)
    wajib = plan[j].selesai > batas
    dicentang = (ikut == null) ? wajib : (j in ikut)
    if wajib and not dicentang: conflicts.push(R2 di j+1); break
    if not dicentang: break
    plan[j] = layBackward(j, batas, skipOccupied = true)  // dirapatkan

  // 4. validasi global
  akhir = plan[tahapan terakhir sebelum FG].selesai
  if akhir > tgl_kirim: conflicts.push(R4)
  else if akhir > tgl_target_fg: warnings.push(R6)
  if ada slot < sekarang: conflicts.push(R5)
  untuk tiap slot yang berubah: cek R7 (lembur), R8 (draft)
  hitung drying_mulai / drying_selesai semua tahapan yang berubah

  return { valid: conflicts kosong, tahapan: plan + peran + ceklis, conflicts, warnings }
```

`bisa_dicentang` = tahapan yang bersebelahan dengan rangkaian yang sudah bergeser (tahapan pertama yang `break` di langkah 2 dan 3).

Tahapan `from = "tgl"` disusun per hari kerja (2 hari), bukan per jam, dan tidak dicek R1.

### 6.5 Endpoint lama

- `PUT /ppic/jadwalProduksi/:id` (`updateTiketJadwalProduksi`) diganti oleh `apply`. Biarkan dulu sampai frontend pindah, lalu dihapus.
- `submitTiketJadwalProduksi` ditambah: isi `id_mesin`, `waktu`, `id_tiket_jadwal_produksi` di `jadwal_produksi`, dan validasi ulang R1 sebelum insert (slot mesin bisa sudah diambil tiket lain sejak calculate). Drying tidak di-copy.

---

## 7. Frontend

### 7.1 Tampilan timeline / Gantt per tiket

```
             Sel           |  Rab                  |  Kam            |  Jum (FG)  |  Sab   | Sen
             08  12  16    |  08  10  12  14  16   |  08  12  16     |  08    16  |  08 13 | kirim
Potong                        ██                                         :            :
Cetak                            ▓▓▓██████░░                             :            :
Pond                                               ████                  :            :
Lem                                                    ████              :            :
FG                                                                       ◆ target     :
                                                                         |<--- spare --->|

██ = jadwal produksi   ░░ = drying (data, bukan jam mesin)
▓▓ = jam mesin terisi JO lain (tooltip: no JO)
background arsir = di luar shift, kuning = lembur, area spare diberi warna sendiri
```

- 1 baris = 1 tahapan. Bar = blok produksi. Bagian arsir sesudah bar = drying, dengan tooltip jam mulai dan selesai drying.
- Background baris menampilkan kondisi mesin tahapan itu (dari `availability`).
- Area **spare** (target FG sampai tanggal kirim) diberi warna sendiri.
- Tahapan yang pernah diubah manual diberi tanda.
- Library bisa pakai `frappe-gantt`, `vis-timeline`, atau grid buatan sendiri.

### 7.2 Alur geser jadwal

1. User mulai drag bar tahapan → panggil `availability`. Jam mulai diwarnai **hijau / kuning / merah**.
2. User lepas bar (atau isi jam mulai lewat date-time picker) → panggil `simulate` tanpa `ikut`.
3. Tampilkan **panel preview**:
   - tabel tahapan dengan **ceklis**: wajib ikut tercentang otomatis, yang `bisa_dicentang` aktif, sisanya nonaktif;
   - kolom jam lama vs jam baru (produksi dan drying);
   - daftar konflik (merah) dan peringatan (kuning, termasuk "memakai spare").
4. Setiap kali ceklis diubah → panggil `simulate` lagi dengan `ikut` yang baru.
5. Kalau ada konflik → tombol **"Cari jam kosong terdekat"** → panggil `suggestSlot`.
6. Kalau valid → tombol **Simpan** (isi alasan) → panggil `apply`.
7. Kalau `apply` mengembalikan `409` → tampilkan konflik dan muat ulang data.

### 7.3 Alur ubah kapasitas / drying

1. Di detail tahapan, tombol **Ubah kapasitas / drying** → form berisi nilai sekarang.
2. User isi nilai baru, pilih **A Jam mulai tetap (default)** atau **B Jam selesai tetap**.
3. Panggil `simulate` dengan `jenis: "ubah_parameter"`. Preview dan ceklis sama seperti 7.2 langkah 3–7.

### 7.4 Aturan UI

- Tombol **Submit tiket** dinonaktifkan selama masih ada konflik wajib.
- Tombol **Calculate ulang** menampilkan konfirmasi kalau ada tahapan yang `is_diubah_manual`: "Semua perubahan manual akan hilang".
- Tahapan `from = "tgl"` digeser per tanggal (date picker), bukan per jam.
- FG tidak bisa digeser langsung.
- Tampilkan riwayat perubahan dari log (5.4) di detail tiket.

---

## 8. Fase Pengerjaan

### Fase 1: Fondasi data & helper

- [ ] Migrasi kolom: `allow_concurrent` (master mesin), `tgl_target_fg` (tiket), `produksi_*` / `drying_*` / `is_diubah_manual` (tahapan), `id_mesin` + `waktu` (slot per jam & `jadwal_produksi`), `id_tiket_jadwal_produksi` (`jadwal_produksi`)
- [ ] Tabel log perubahan
- [ ] Backfill data lama
- [ ] Layar master mesin bisa mengubah `allow_concurrent` (semua mesin default `0`, tidak ada yang diset otomatis)
- [ ] Update model Sequelize terkait
- [ ] Pisahkan helper shift, occupancy, layout. Calculate memakai helper ini (hasil harus sama persis dengan sebelumnya)
- [ ] Hari kerja melewati Minggu + libur (`subtractWorkingDays`)
- [ ] Uji & perbaiki bug drying time di calculate (pencarian jam kerja mundur)

### Fase 2: Calculate

- [ ] Hitung mundur dari target FG H-2 hari kerja, simpan `tgl_target_fg`
- [ ] Isi `produksi_*` dan `drying_*`, perbaiki isi `tgl_to`
- [ ] Lompati jam mesin yang sudah terisi
- [ ] Hapus slot lama sebelum membuat slot baru
- [ ] Isi `id_mesin`, `waktu` di slot; submit mengisi `id_mesin`, `waktu`, `id_tiket_jadwal_produksi` di `jadwal_produksi`
- [ ] Submit validasi ulang R1, drying tidak di-copy

### Fase 3: Endpoint ubah jadwal

- [ ] `simulate` jenis `geser` + ceklis (wajib ikut, bisa dicentang, dirapatkan secukupnya)
- [ ] `simulate` jenis `ubah_parameter` + mode A/B
- [ ] `availability` + zona hijau/kuning/merah
- [ ] `suggestSlot` (terdekat, lebih cepat dulu)
- [ ] `apply` (transaction + lock + log)
- [ ] Dokumentasi endpoint untuk frontend

### Fase 4: Frontend

- [ ] Timeline / Gantt per tiket, termasuk drying dan area spare
- [ ] Drag + zona warna + panel preview dengan ceklis
- [ ] Form ubah kapasitas / drying dengan pilihan A/B
- [ ] Cari jam kosong terdekat
- [ ] Simpan + riwayat perubahan
- [ ] Konfirmasi calculate ulang
- [ ] Ganti pemakaian endpoint lama `PUT /ppic/jadwalProduksi/:id`

---

## 9. Keputusan

### Sudah diputuskan (hasil meeting)

| # | Keputusan |
|---|---|
| D1 | FG ditargetkan **H-2 hari kerja** sebelum tanggal kirim, sebagai spare untuk mundur |
| D2 | Tahapan yang ikut berubah dipilih lewat **ceklis**. Wajib ikut tercentang otomatis, PPIC boleh menambah |
| D3 | Tahapan yang dicentang bergeser **secukupnya** (dirapatkan) supaya tidak tumpang tindih |
| D4 | Kapasitas dan drying time bisa diubah per tiket **tanpa calculate ulang**, dengan pilihan **A jam mulai tetap (default)** atau **B jam selesai tetap** |
| D5 | Drying time **disimpan dan ditampilkan sebagai data**, tapi tidak masuk jadwal dan tidak memakai jam mesin |
| D6 | Bentrok dengan tiket lain yang masih draft hanya **peringatan**. Yang jadi patokan wajib hanya `jadwal_produksi` |

### Masih terbuka

| # | Pertanyaan | Usulan |
|---|---|---|
| K1 | Penanda mesin yang boleh dipakai bersamaan: boolean `allow_concurrent` atau angka `max_concurrent_jobs`? | Boolean `allow_concurrent`, **default `0` untuk semua mesin termasuk manual dan outsource**. Mesin yang boleh bersamaan diubah manual oleh admin |
| K2 | Mesin gabungan ("R700 / SM", "SM / GTO"): memakai kedua mesin, salah satu, atau mesin sendiri? | Perlu jawaban client. Kalau memakai kedua mesin, cek R1 ke kedua id mesin |
| K3 | Sabtu (shift sampai 13:00) dihitung 1 hari kerja untuk H-2? | Dihitung, karena tetap ada jam kerja |
| K4 | Boleh ubah tiket yang sudah di-submit? | Belum. Di luar cakupan dokumen ini |
| K5 | Siapa yang boleh mengubah jadwal? | Perlu ditentukan role-nya (misal hanya PPIC) |
| K6 | Slot jatuh di jam lembur yang belum terdaftar di `jadwal_produksi_lembur`: boleh atau tidak? | Hanya boleh kalau user centang `is_lembur`, sama seperti calculate |
| K7 | Alasan perubahan wajib diisi? | Wajib, supaya log bisa ditelusuri |

---

## 10. Risiko & Edge Case

- **Dua PPIC mengedit mesin yang sama bersamaan** → lock `FOR UPDATE` di `apply` + validasi ulang di `submit`.
- **Calculate ulang menghapus perubahan manual** → konfirmasi di UI, `is_diubah_manual` sebagai penanda.
- **Mesin manual / outsource sering bentrok** karena semua mesin default dicek bentrok. Contoh: RABUT MANUAL yang sudah memakai banyak slot bisa membuat calculate mendorong tahapan jauh ke depan atau gagal. Solusinya: admin menandai mesin itu `allow_concurrent = 1` di master mesin. Pesan konflik sebaiknya menyebut nama mesinnya supaya mudah ditelusuri.
- **Spare habis** → perubahan berikutnya yang mundur akan ditolak (R4). Tampilkan sisa spare di preview.
- **Nama mesin ambigu di data lama `jadwal_produksi`** → backfill `id_mesin` perlu dicek manual.
- **Drying time melewati hari libur** → tetap dihitung jam biasa (sesuai perilaku sekarang), tidak menunggu jam kerja.
- **Tahapan dengan mesin sama berurutan** (misal Cetak 1 dan Cetak 2 di R700) → slot tiket sendiri tidak dihitung bentrok, tapi R2/R3 tetap berlaku.
- **Dirapatkan ke arah lebih cepat melewati waktu sekarang** → R5 menolak. `suggestSlot` tidak mencari sebelum waktu sekarang.
- **Timezone** → semua perhitungan pakai Asia/Jakarta. Jangan pakai `toISOString()` untuk ambil tanggal (bisa geser 1 hari).
- **Performa** → `availability` dan `suggestSlot` menjalankan banyak simulasi. Load shift, lembur, libur, dan slot terisi sekali per request, lalu cek di memori (`Set` berisi `id_mesin|waktu`).
