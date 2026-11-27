# Perencanaan: Penguncian Data Absensi Mingguan (Gabungan Data Terkunci + Live)

Dokumen ini untuk tim backend. Isinya rencana untuk **menyimpan hasil hitungan absensi ke tabel dan menguncinya per minggu**, sehingga data minggu yang sudah lewat masa koreksi tidak berubah lagi, walaupun pengajuan, SPL, jadwal libur, atau master shift diubah belakangan.

Cakupan: semua pemakai `getAbsensiFunction` (get absen, rekap, payroll, outstanding, data karyawan). **Format hasilnya tidak berubah**: field, tipe data, dan urutan baris tetap sama seperti sekarang. Yang berubah hanya sumber datanya: tanggal yang sudah dikunci dibaca dari tabel, tanggal yang masih live dihitung seperti sekarang, lalu keduanya digabung otomatis.

Status: **rancangan, belum diimplementasikan.** Belum ada perubahan kode atau tabel.

---

## Ringkasan Aturan

### Periode dan masa koreksi

1. Data absensi dikelompokkan per minggu **Jumat s/d Kamis**.
2. Setiap minggu punya **masa koreksi 1 minggu** setelah minggu itu selesai. Selama masa koreksi, data masih live: absen, pengajuan, dan SPL yang diubah langsung terlihat.
3. **Setiap hari Jumat**, minggu yang masa koreksinya sudah habis **dikunci**. Hasil hitungan saat itu disimpan, dan sejak saat itu tidak berubah lagi.

Rumus (semua tanggal memakai WIB):

```
W0          = hari Jumat terakhir ≤ hari ini           (awal minggu berjalan)
live mulai  = W0 − 7 hari                              (awal minggu sebelumnya, masih masa koreksi)
dikunci     = semua tanggal ≤ W0 − 8 hari              (Kamis sebelum "live mulai")
```

| Hari ini | Minggu yang dikunci hari itu | Tanggal live | Tanggal terkunci |
|---|---|---|---|
| Kam 26 Nov 2026 | (tidak ada, hari kunci = Jumat) | Jum 13 Nov s/d Kam 26 Nov | ≤ Kam 12 Nov |
| **Jum 27 Nov 2026** | **Jum 13 – Kam 19 Nov** | **Jum 20 Nov s/d Jum 27 Nov** | **≤ Kam 19 Nov** |
| Kam 3 Des 2026 | (tidak ada) | Jum 20 Nov s/d Kam 3 Des | ≤ Kam 19 Nov |
| Jum 4 Des 2026 | Jum 20 – Kam 26 Nov | Jum 27 Nov s/d Jum 4 Des | ≤ Kam 26 Nov |

### Contoh permintaan data (hari ini Jum 27 Nov 2026)

| Permintaan | Sumber data |
|---|---|
| Get absen hari ini (27 Nov) | Live seluruhnya, sama seperti sekarang |
| Get absen 20–27 Nov | Live seluruhnya |
| Get absen 1–30 Nov | 1–19 Nov dari tabel terkunci, 20–30 Nov live, lalu digabung jadi satu hasil |
| Get absen 1–10 Nov | Dari tabel terkunci seluruhnya |
| Payroll periode 13–19 Nov | Dari tabel terkunci seluruhnya |

### Yang berubah dan yang tidak

| | Sebelum | Sesudah |
|---|---|---|
| Format hasil `getAbsensiFunction` | - | **Sama persis** (field, tipe, urutan) |
| Tanggal dalam masa live | Dihitung dari checkin/checkout + pengajuan | Sama, tetap dihitung |
| Tanggal yang sudah dikunci | Dihitung ulang setiap request, bisa berubah kalau sumbernya berubah | Dibaca dari tabel, **tidak berubah** |
| Pengajuan / SPL / jadwal libur / checkin-out untuk tanggal terkunci | Boleh dibuat dan diubah, langsung mengubah hasil | **Ditolak** dengan pesan "periode sudah dikunci" (D9) |
| Baris dinas di luar rentang permintaan | Ikut muncul | **Dipotong sesuai rentang**, sama seperti cuti/izin/sakit (D7) |
| Daftar "Belum Masuk" untuk get 1 hari yang sudah terkunci | Dibentuk dari daftar karyawan saat ini | **Disimpan saat dikunci** (D13) |
| Pemanggil (`absensiController`, payroll, dll.) | - | Tidak perlu diubah |

---

## 1. Latar Belakang

`getAbsensiFunction` di [helper/absenFunction.js](../helper/absenFunction.js) menghitung ulang absensi **setiap kali dipanggil** dari:

| Sumber | Tabel / model |
|---|---|
| Checkin / checkout | `checkinout` (diisi mesin fingerprint, di luar API) |
| Pengajuan | cuti, izin, dinas, sakit, mangkir, terlambat, terlambat user, pulang cepat, lembur (SPL, termasuk `status_ketidaksesuaian` / `penanganan`) |
| Jadwal | `jadwal_karyawan` (hari libur per tipe karyawan) |
| Master | master shift + istirahat, master absensi (toleransi, `terhitung_lembur_menit`), department, divisi |
| Karyawan | karyawan, biodata (department, divisi, tipe, foto), bagian mesin |

Akibatnya hasil untuk tanggal lama bisa berubah kapan saja, misalnya SPL yang di-approve belakangan, master shift yang diubah, atau logika hitung lembur yang diperbaiki. Untuk periode yang sudah diproses payroll, hasilnya harus tetap.

---

## 2. Kondisi Sekarang

### 2.1 Pemakai `getAbsensiFunction`

| File | Pemanggilan | Filter `obj` |
|---|---|---|
| [controller/hr/absensiController.js](../controller/hr/absensiController.js) `getAbsensi` | rentang bebas; khusus hari Sabtu memanggil juga hari sebelumnya | `id_department`, `id_divisi`, `is_active` |
| [controller/hr/absensiController.js](../controller/hr/absensiController.js) `getRekapAbsensi` | per rentang / per bulan | `id_department`, `id_divisi`, `id_karyawan`, `tipe_penggajian`, `is_active` |
| [controller/hr/payroll/payrollController.js](../controller/hr/payroll/payrollController.js) | 4 tempat (baris ±102, 232, 299, 362) | `obj`, `{ id_grade: { [Op.ne]: null } }`, `{}` |
| [controller/hr/karyawan/karyawanController.js](../controller/hr/karyawan/karyawanController.js) | baris ±847 | `{ id_karyawan }` |
| [controller/hr/outstanding/outstandingAbsen/outstandingAbsenController.js](../controller/hr/outstanding/outstandingAbsen/outstandingAbsenController.js) | hari ini saja | `{ is_active: true }` |

`outstandingKaryawanController.js` meng-import fungsi ini, tapi tidak memanggilnya.

### 2.2 Alur di dalam fungsi

1. Ambil master, biodata (filter `obj`, termasuk `bagian_mesin_karyawan`), karyawan, jadwal libur.
2. Ambil checkin (`checktype = 0`, dalam rentang) dan checkout (`checktype = 1`, sampai **endDate + 1 hari**, untuk shift malam).
3. Ambil semua pengajuan yang beririsan dengan rentang. Lembur diambil sampai endDate + 1 hari jam 10:00.
4. Bentuk baris absen per checkin (`status_absen: "masuk"`), lalu tambahkan baris cuti, izin, dinas, sakit, dan mangkir.
5. Urutkan berdasarkan `waktu_masuk` (terbaru dulu).
6. Kalau `startDate === endDate`: gabungkan dengan daftar semua karyawan (`generatekaryawanList`) supaya karyawan yang belum absen muncul sebagai `"Belum Masuk"`.

### 2.3 Bentuk baris yang dihasilkan

Ada 3 bentuk baris. Setiap bentuk punya **daftar field dan urutan sendiri**. Field yang tidak ada di suatu bentuk memang tidak ada (bukan `null`).

| Field | `masuk` (sudah pulang) | `masuk_belum_pulang` | `pengajuan` (cuti, izin, dinas, sakit, mangkir) |
|---|:-:|:-:|:-:|
| `id_pengajuan_terlambat_user` | ✓ | ✓ | |
| `lama_pengajuan_terlambat` | ✓ | ✓ | |
| `id_pengajuan_lembur` | ✓ | ✓ | |
| `userid`, `waktu_masuk`, `waktu_keluar`, `tgl_absen`, `tgl_masuk`, `tgl_keluar`, `jam_masuk`, `jam_keluar` | ✓ | ✓ | ✓ |
| `menit_terlambat`, `jam_lembur`, `status_lembur`, `status_masuk` | ✓ | ✓ | ✓ |
| `jam_lembur_spl`, `jam_lembur_absen`, `status_lembur_spl`, `status_ketidaksesuaian` | ✓ | ✓ | |
| `jam_istirahat_lembur` | ✓ | | |
| `name`, `status_keluar`, `menit_pulang_cepat`, `shift`, `status_absen` | ✓ | ✓ | ✓ |
| `id_department`, `nama_department`, `id_divisi`, `nama_divisi`, `hari`, `jenis_hari_masuk`, `foto_karyawan` | ✓ | ✓ | ✓ |
| `jam_masuk_shift`, `jam_keluar_shift`, `tipe_karyawan`, `tipe_penggajian` | ✓ | ✓ | |
| `bagian_mesin` (array data `karyawan_bagian_mesin`) | ✓ | ✓ | |

Urutan field di setiap bentuk juga berbeda, misalnya `userid` ada di posisi ke-5 pada baris `masuk`, tapi di posisi pertama pada baris `pengajuan`. Urutan ini dijaga supaya `JSON.stringify` hasilnya identik (bagian 5.3).

Ada **bentuk ke-4, `belum_masuk`**, yang hanya muncul kalau `startDate === endDate`. Bentuk ini dibuat `generatekaryawanList`: 1 baris per karyawan (sesuai filter), kecuali di hari libur tipe karyawan itu. Field-nya sama dengan `masuk`, kecuali `jam_masuk_shift` dan `jam_keluar_shift`. Isinya:

- `status_absen: "Belum Masuk"`, `status_keluar: "Belum Keluar"`;
- `tgl_absen` = string tanggal **persis seperti yang dikirim pemanggil** (bisa `2026-11-7`, tanpa nol);
- `name`, department, divisi, tipe, `bagian_mesin`, dan foto dari data karyawan;
- field lain bernilai `null`.

Daftar ini lalu digabung dengan baris absen hari itu (`prosesHasilAbsensi`, bagian 5.1):

- karyawan yang punya baris absen: field di baris `belum_masuk`-nya ditimpa dengan nilai dari baris absen, tapi urutan field tetap mengikuti `belum_masuk`;
- baris absen yang karyawannya tidak ada di daftar ditambahkan sebagai objek baru.

Akibatnya bentuk hasil 1 hari berbeda dengan hasil rentang.

### 2.4 Temuan yang mempengaruhi rancangan

- **Ada field bertipe `Date`.** `waktu_masuk` dan `waktu_keluar` berupa objek `Date`, dan dipakai untuk sorting (`b.waktu_masuk - a.waktu_masuk`).
- **Ada field yang bernilai `undefined`, bukan `null`.** Contohnya `id_pengajuan_terlambat_user` dan `lama_pengajuan_terlambat` saat tidak ada pengajuan terlambat, atau `nama_department` kalau master department tidak ditemukan. `res.json` membuang field `undefined`, tapi menampilkan field `null`. Jadi keduanya harus dibedakan saat disimpan.
- **`bagian_mesin` berupa array** data `karyawan_bagian_mesin` (bisa kosong), bukan nilai tunggal. Field ini satu-satunya yang disimpan sebagai JSON (bagian 4.2).
- **Angka memakai `DOUBLE`/`FLOAT`** di sumbernya (`jam_lembur` pengajuan lembur, `lama_terlambat`), jadi di JS berupa `number`. Kolom baru juga harus `DOUBLE`, bukan `DECIMAL`, karena `mysql2` mengembalikan `DECIMAL` sebagai string.
- **`generateDailyDinas` tidak memotong rentang.** Dinas 15–25 Nov yang diminta untuk rentang 20–22 Nov tetap menghasilkan baris 15–25 Nov. Cuti, izin, dan sakit sudah dipotong. Diputuskan ikut dipotong (D7).
- **Tanggal masuk bisa beda format.** Outstanding mengirim `today` tanpa nol di depan (`2026-11-7`). Router harus menormalkan tanggal untuk perbandingan, tapi tetap meneruskan string aslinya ke perhitungan live.
- **Timezone.** `config/database.js` tidak mengatur `timezone`, dan kode membaca jam `checkinout` dengan `getUTC*` (jam WIB disimpan apa adanya). Kolom `DATETIME` baru disimpan dan dibaca lewat koneksi Sequelize yang sama, jadi nilainya kembali persis.
- `checkinout` diisi dari luar API, jadi tidak ada titik di kode untuk memicu update saat data fingerprint masuk.
- `node-cron` sudah ada di `package.json`, tapi belum ada cron yang aktif.

### 2.5 Rekap dan payroll: bagian yang tidak lewat `getAbsensiFunction`

| Bagian | Sumber sekarang | Ikut terkunci? |
|---|---|---|
| Payroll mingguan & bulanan: upah harian, uang hadir, lembur (`jam_lembur`, `jam_lembur_spl`, `jam_istirahat_lembur`), potongan sakit/izin/mangkir, pulang cepat, terlambat | Baris `getAbsensiFunction` | **Ya, otomatis** |
| Payroll: `data_pengajuan_lembur` di rincian per hari | Query `pengajuan_lembur` langsung | Tidak. Hanya ditempel sebagai info, tidak dipakai menghitung uang |
| Payroll: grade, gaji, potongan karyawan, pinjaman | Master karyawan / pinjaman | Tidak. Di luar data absensi |
| Rekap: `jam_lembur_biasa`, `jam_lembur_libur`, `jumlah_hari_terlambat`, `absensi` | Baris `getAbsensiFunction` | **Ya, otomatis** |
| Rekap: `jumlah_hari_cuti_khusus`, `jumlah_hari_cuti_tahunan`, `jumlah_hari_sakit`, `jumlah_hari_izin`, `jumlah_hari_mangkir` + array `cuti_khusus`, `cuti_tahunan`, `sakit`, `izin`, `mangkir` | Query tabel pengajuan langsung | Tidak, dan tidak diubah di tahap ini (D10). Karena pengajuan untuk tanggal terkunci ditolak (D9), angkanya praktis tetap |

---

## 3. Istilah

| Istilah | Arti |
|---|---|
| **Periode** | 1 minggu Jumat s/d Kamis |
| **Masa koreksi** | 1 minggu setelah periode selesai. Data masih live |
| **Dikunci** | Hasil hitungan periode disimpan ke tabel, dan sejak itu dibaca dari tabel |
| **Live** | Dihitung saat request, seperti sekarang |
| **Baris** | 1 objek di array hasil `getAbsensiFunction` |
| **Bentuk baris** | `masuk`, `masuk_belum_pulang`, `pengajuan`, atau `belum_masuk` (bagian 2.3) |
| **Router** | `getAbsensiFunction` versi baru yang memecah rentang menjadi bagian terkunci dan live |

---

## 4. Perubahan Data

Dibuat lewat migration `sequelize-cli` (lihat [migration.md](migration.md)), beserta modelnya. **Setiap field baris disimpan sebagai kolom sendiri.** Pengecualiannya hanya `bagian_mesin`, yang isinya array sehingga disimpan sebagai JSON.

### 4.1 Tabel `absensi_periode_kunci`

Satu baris per periode yang sudah dikunci.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK AI | |
| `periode_mulai` | DATE, **UNIQUE** | Hari Jumat |
| `periode_selesai` | DATE | Hari Kamis |
| `status` | VARCHAR(20) | `terkunci` / `dibuka` |
| `jumlah_baris` | INT | Jumlah baris yang disimpan (untuk cek cepat) |
| `versi` | INT, default 1 | Naik setiap kali periode dikunci ulang |
| `versi_logika` | VARCHAR(50) NULL | Penanda versi kode hitung absensi saat dikunci (misal git commit) |
| `dikunci_at` | DATETIME | |
| `dikunci_oleh` | VARCHAR(50) | `cron`, `backfill`, atau id user |
| `dibuka_at`, `dibuka_oleh`, `alasan_buka` | NULL | Diisi kalau periode dibuka lagi (bagian 6.4) |
| `createdAt`, `updatedAt` | DATETIME | |

`UNIQUE (periode_mulai)` mencegah satu periode dikunci dua kali, misalnya kalau API jalan di beberapa instance.

### 4.2 Tabel `absensi_terkunci`

Satu baris tabel = satu baris hasil `getAbsensiFunction`, ditambah baris `belum_masuk` per karyawan per hari (D13). Nama kolom sama dengan nama field.

**Kolom bantu:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT PK AI | |
| `id_periode` | INT, index | FK ke `absensi_periode_kunci` |
| `bentuk_baris` | VARCHAR(20) | `masuk` / `masuk_belum_pulang` / `pengajuan` / `belum_masuk`. Menentukan field apa saja yang dikembalikan dan urutannya |
| `urutan` | INT | Urutan baris saat periode dihitung, untuk menjaga urutan hasil |
| `field_undefined` | VARCHAR(255) NULL | Nama field yang nilainya `undefined` saat dikunci, dipisah koma. Contoh: `id_pengajuan_terlambat_user,lama_pengajuan_terlambat`. Saat dibaca, field ini diisi `undefined`, bukan `null` |
| `createdAt` | DATETIME | |

**Kolom data:**

| Kolom | Tipe | Bentuk baris |
|---|---|---|
| `id_pengajuan_terlambat_user` | INT NULL | masuk, belum pulang |
| `lama_pengajuan_terlambat` | DOUBLE NULL | masuk, belum pulang |
| `id_pengajuan_lembur` | INT NULL | masuk, belum pulang |
| `tgl_absen` | DATE | semua |
| `userid` | INT | semua |
| `waktu_masuk` | DATETIME(3) NULL | semua (`NULL` untuk `belum_masuk`) |
| `waktu_keluar` | DATETIME(3) NULL | semua |
| `tgl_masuk` | VARCHAR(30) NULL | semua (`NULL` untuk `belum_masuk`) |
| `tgl_keluar` | VARCHAR(30) NULL | semua |
| `jam_masuk` | VARCHAR(10) NULL | semua |
| `jam_keluar` | VARCHAR(10) NULL | semua |
| `menit_terlambat` | DOUBLE NULL | semua |
| `jam_lembur` | DOUBLE NULL | semua |
| `jam_lembur_spl` | DOUBLE NULL | masuk, belum pulang |
| `jam_istirahat_lembur` | DOUBLE NULL | masuk |
| `jam_lembur_absen` | DOUBLE NULL | masuk, belum pulang |
| `status_lembur` | VARCHAR(50) NULL | semua |
| `status_lembur_spl` | VARCHAR(50) NULL | masuk, belum pulang |
| `status_masuk` | VARCHAR(100) NULL | semua |
| `status_ketidaksesuaian` | TEXT NULL | masuk, belum pulang |
| `name` | VARCHAR(255) NULL | semua |
| `status_keluar` | VARCHAR(100) NULL | semua |
| `menit_pulang_cepat` | DOUBLE NULL | semua |
| `shift` | VARCHAR(20) NULL | semua |
| `status_absen` | VARCHAR(50) | semua |
| `id_department` | INT NULL | semua |
| `nama_department` | VARCHAR(255) NULL | semua |
| `id_divisi` | INT NULL | semua |
| `nama_divisi` | VARCHAR(255) NULL | semua |
| `jam_masuk_shift` | VARCHAR(10) NULL | masuk, belum pulang |
| `jam_keluar_shift` | VARCHAR(10) NULL | masuk, belum pulang |
| `hari` | VARCHAR(20) NULL | semua |
| `jenis_hari_masuk` | VARCHAR(20) NULL | semua |
| `tipe_karyawan` | VARCHAR(50) NULL | masuk, belum pulang |
| `tipe_penggajian` | VARCHAR(50) NULL | masuk, belum pulang |
| `bagian_mesin` | JSON NULL | masuk, belum pulang |
| `foto_karyawan` | VARCHAR(255) NULL | semua |

Bentuk `belum_masuk` memakai kolom yang sama dengan bentuk `masuk`, kecuali `jam_masuk_shift` dan `jam_keluar_shift`.

Index: `(tgl_absen, userid)`, `(id_periode, urutan)`, dan `(tgl_absen, bentuk_baris)`.

Isi `bagian_mesin` adalah array data `karyawan_bagian_mesin` milik karyawan itu, sama seperti yang dikirim `res.json` sekarang:

```json
[
  { "id": 12, "id_karyawan": 44, "id_biodata_karyawan": 40, "id_bagian_mesin": 3,
    "nama_bagian_mesin": "R700", "createdAt": "2025-02-01T08:00:00.000Z", "updatedAt": "2025-02-01T08:00:00.000Z" }
]
```

Kalau karyawan tidak punya bagian mesin, isinya `[]`.

Kalau versi MySQL/MariaDB tidak mendukung tipe `JSON`, pakai `TEXT` dan `JSON.parse` / `JSON.stringify` di kode.

> Tipe akhir setiap kolom disamakan dengan tipe di model sumbernya saat implementasi. Contohnya kalau `id_department` di biodata ternyata string, kolomnya juga string. Skrip pembanding (bagian 7) memastikan tipenya sama.

### 4.3 Ukuran

Perkiraan untuk 300 karyawan per tahun:

| Baris | Jumlah | Ukuran |
|---|---|---|
| Absen dan pengajuan (±0,7 KB) | 300 × 365 ≈ 110 ribu | ±75 MB |
| `belum_masuk`, 1 per karyawan per hari kerja (±0,5 KB) | 300 × ±310 ≈ 93 ribu | ±45 MB |
| **Total** | ±200 ribu | **±120 MB** |

Jumlah sebenarnya dicek sebelum backfill (bagian 6.3).

---

## 5. Backend: Router `getAbsensiFunction`

### 5.1 Pecah fungsi yang ada

Isi `getAbsensiFunction` sekarang dipecah menjadi dua fungsi internal:

```
hitungBarisAbsensi(startDate, endDate, obj)
  → { results, konteks }        // langkah 1–4 di bagian 2.2, sebelum sorting
    konteks = { karyawan, karyawanBiodata, masterDepartment, masterDivisi, resultJadwalKaryawan }

prosesHasilAbsensi(results, startDate, endDate, daftarKaryawan)
  → array akhir                 // langkah 5–6: sort + gabung daftarKaryawan kalau 1 hari
                                // daftarKaryawan = hasil generatekaryawanList (live),
                                // atau baris belum_masuk dari tabel (tanggal terkunci)
```

Di langkah yang sama, `generateDailyDinas` dipotong sesuai rentang seperti `generateDailyCuti` (D7).

Setelah langkah ini, hasilnya **harus identik** dengan sebelumnya, kecuali baris dinas di luar rentang yang memang sengaja dibuang. Ini dicek dengan skrip pembanding (bagian 7) sebelum lanjut ke tahap berikutnya.

### 5.2 Alur router

```
getAbsensiFunction(startDate, endDate, obj, isLibur):
  S, E = normalisasi(startDate), normalisasi(endDate)       // 'YYYY-MM-DD'

  if fitur kunci tidak aktif (env ABSENSI_KUNCI_AKTIF != true):
    return fungsi lama                                       // jalur aman / rollback

  periode = absensi_periode_kunci WHERE status = 'terkunci'
            AND periode_mulai <= E AND periode_selesai >= S
  if periode kosong:
    return fungsi lama                                       // 100% live, sama seperti sekarang

  // 1. bagian terkunci
  userids    = KaryawanBiodata.findAll({ where: obj }).map(id_karyawan)   // filter sama dengan live
  rowsKunci  = absensi_terkunci WHERE id_periode IN (periode)
               AND bentuk_baris <> 'belum_masuk'
               AND tgl_absen BETWEEN S AND E AND userid IN (userids)
               ORDER BY periode_mulai, urutan
  barisKunci = rowsKunci.map(susunBaris)                    // bagian 5.3

  // 2. bagian live: rentang di [S, E] yang tidak tercakup periode terkunci
  barisLive = []
  for seg in segmenLive(S, E, periode):
    { results } = hitungBarisAbsensi(seg.mulai, seg.selesai, obj)
    barisLive += results

  // 3. daftar karyawan untuk get 1 hari
  daftarKaryawan = null
  if startDate === endDate:
    if S terkunci:
      daftarKaryawan = absensi_terkunci WHERE tgl_absen = S AND bentuk_baris = 'belum_masuk'
                       AND userid IN (userids) ORDER BY urutan
                       .map(susunBaris)                     // tgl_absen diisi startDate asli
    else:
      daftarKaryawan = generatekaryawanList(...)            // live, sama seperti sekarang

  // 4. gabung lalu proses seperti biasa
  results = [...barisLive, ...barisKunci]
  return prosesHasilAbsensi(results, startDate, endDate, daftarKaryawan)
```

Catatan:

- **Tanggal terkunci ditentukan dari tabel `absensi_periode_kunci`, bukan dari rumus tanggal.** Kalau cron gagal mengunci, tanggal itu tetap live (hasilnya benar tapi belum beku), bukan hilang.
- Filter `obj` tetap memakai **biodata saat ini**, sama seperti live, jadi siapa yang muncul ditentukan dengan cara yang sama. Isi barisnya (nama department, divisi, dan lainnya) memakai data saat dikunci (D12).
- Satu hari terkunci (`startDate === endDate`) memakai **daftar "Belum Masuk" yang disimpan saat dikunci** (D13). Jadi yang muncul adalah karyawan yang ada saat periode dikunci, lalu disaring dengan filter saat ini. Contohnya, karyawan yang baru masuk kerja setelah periode dikunci tidak muncul sebagai "Belum Masuk" di tanggal lama.
- Logika Sabtu di `absensiController.getAbsensi` (memanggil hari sebelumnya untuk Shift 2) tidak perlu diubah, karena memanggil `getAbsensiFunction` dua kali.
- Parameter `isLibur` tidak dipakai di fungsi sekarang. Tetap diterima supaya signature tidak berubah.

### 5.3 Menyimpan dan menyusun ulang baris

Di kode ada daftar field per bentuk, dengan urutan yang sama persis dengan objek yang dibuat sekarang:

```js
const FIELD_BARIS = {
  masuk: ["id_pengajuan_terlambat_user", "lama_pengajuan_terlambat", "id_pengajuan_lembur",
          "tgl_absen", "userid", "waktu_masuk", /* ... */ "bagian_mesin", "foto_karyawan"],
  masuk_belum_pulang: [/* ... tanpa jam_istirahat_lembur */],
  pengajuan: ["userid", "waktu_masuk", "waktu_keluar", "tgl_absen", /* ... */ "foto_karyawan"],
  belum_masuk: [/* urutan field generatekaryawanList, tanpa jam_masuk_shift / jam_keluar_shift */],
};
```

**Saat dikunci** (`simpanBaris`):

1. Tentukan bentuk baris dengan mencocokkan `Object.keys(baris)` ke `FIELD_BARIS` (urutan harus sama persis).
2. **Kalau tidak ada bentuk yang cocok, penguncian periode gagal** dan tidak ada yang disimpan. Ini menjaga supaya field baru (misalnya seperti `jam_lembur_absen` yang baru ditambahkan) tidak hilang diam-diam. Setiap field baru wajib ditambahkan sebagai kolom (migration) dan ke `FIELD_BARIS`.
3. Setiap field disalin ke kolomnya. Field bernilai `undefined` dicatat di `field_undefined`, dan kolomnya diisi `NULL`.
4. `bagian_mesin` disimpan sebagai JSON (hasil `toJSON()` setiap item, sama dengan yang dikirim `res.json`).

**Saat dibaca** (`susunBaris`):

1. Ambil `FIELD_BARIS[bentuk_baris]`, lalu buat objek baru dengan field **sesuai urutan itu saja**.
2. Field yang tercantum di `field_undefined` diisi `undefined`.
3. `waktu_masuk`, `waktu_keluar` dikembalikan sebagai `Date` (otomatis dari kolom `DATETIME` lewat Sequelize). `tgl_absen` dikembalikan sebagai string `'YYYY-MM-DD'` (`DATEONLY`).
4. `bagian_mesin` diambil dari kolom JSON-nya.
5. Khusus `belum_masuk`: `tgl_absen` diisi string `startDate` **persis seperti yang dikirim pemanggil**, sama seperti `generatekaryawanList` sekarang.

| Hal | Penanganan |
|---|---|
| Field berbeda per bentuk baris | `bentuk_baris` + `FIELD_BARIS` |
| Urutan field | `FIELD_BARIS` mengikuti urutan objek sekarang |
| `undefined` vs `null` | `field_undefined` |
| `Date` | Kolom `DATETIME(3)`, dibaca kembali sebagai `Date` |
| Angka | Kolom `DOUBLE`, dibaca kembali sebagai `number` |
| `bagian_mesin` (array) | Kolom JSON |
| Daftar "Belum Masuk" untuk get 1 hari | Disimpan sebagai bentuk `belum_masuk` per karyawan per hari |
| Urutan baris dengan `waktu_masuk` sama | Kolom `urutan`, dibaca `ORDER BY urutan` sebelum sort (sort JS stabil) |
| Checkout shift malam di hari berikutnya | Periode dihitung dengan rentang Jumat–Kamis, dan checkout tetap diambil sampai Jumat berikutnya (+1 hari), sama seperti live |
| Format tanggal input (`2026-11-7`) | Dinormalkan hanya untuk perbandingan. String asli tetap dikirim ke perhitungan live |

Satu perbedaan kecil yang tidak terlihat dari `res.json`: di hasil live, isi `bagian_mesin` berupa instance model Sequelize dengan `createdAt` / `updatedAt` bertipe `Date`, sedangkan dari JSON berupa objek biasa dengan tanggal berupa string ISO. Hasil `res.json`-nya sama persis. Tidak ada pemanggil yang memakai method model atau tanggal di `bagian_mesin`.

---

## 6. Proses Penguncian

### 6.1 Mengunci satu periode

```
kunciPeriode(periode_mulai, oleh):
  periode_selesai = periode_mulai + 6 hari
  { results, konteks } = hitungBarisAbsensi(periode_mulai, periode_selesai, {})   // semua karyawan, termasuk non-aktif

  belumMasuk = []
  for tanggal in periode_mulai .. periode_selesai:                     // 7 hari
    belumMasuk += generatekaryawanList(konteks..., tanggal)            // bentuk belum_masuk

  transaction:
    insert absensi_periode_kunci (status 'terkunci', jumlah_baris, versi_logika, dikunci_oleh)
      // gagal karena UNIQUE → periode sudah dikunci proses lain → berhenti
    bulk insert absensi_terkunci (simpanBaris(results), urutan = index)  // gagal kalau ada bentuk baris tak dikenal
    bulk insert absensi_terkunci (simpanBaris(belumMasuk), bentuk 'belum_masuk', urutan = index per hari)
  commit
```

- Dihitung **tanpa filter** (`obj = {}`), jadi semua karyawan tersimpan. Filter diterapkan saat dibaca.
- Daftar `belum_masuk` dibuat untuk setiap hari di periode, dengan daftar karyawan dan data biodata saat dikunci. Di hari libur tipe karyawan tertentu, karyawan tipe itu memang tidak dibuatkan baris, sama seperti `generatekaryawanList` sekarang.
- Karena dinas sudah dipotong sesuai rentang (D7), semua baris hasil hitungan berada di dalam periode.
- Satu transaksi: periode dianggap terkunci hanya kalau semua barisnya tersimpan.

### 6.2 Cron mingguan

File baru, misalnya `jobs/kunciAbsensiMingguan.js`, didaftarkan di `app.listen` di [index.js](../index.js).

```js
cron.schedule("5 0 * * 5", kunciPeriodeJatuhTempo, { timezone: "Asia/Jakarta" }); // Jumat 00:05 WIB
```

`kunciPeriodeJatuhTempo()` mengunci **semua** periode yang `periode_selesai ≤ W0 − 8 hari` dan belum ada di `absensi_periode_kunci`. Dengan begitu:

- Kalau server mati saat Jumat, periode yang terlewat ikut dikunci saat cron berikutnya jalan.
- Fungsi yang sama dipanggil sekali saat server start (dibatasi beberapa periode terakhir supaya start tidak lama).
- Kalau API jalan di beberapa instance (pm2 cluster), `UNIQUE (periode_mulai)` mencegah kunci ganda. Lebih baik lagi kalau cron hanya aktif di 1 instance (env `CRON_AKTIF=true`).

### 6.3 Backfill semua data lama

Skrip terpisah, misalnya `scripts/backfillAbsensiTerkunci.js`. Tidak dijalankan otomatis saat server start.

```
node scripts/backfillAbsensiTerkunci.js [--dari 2023-01-06] [--sampai 2026-11-19]
```

1. Default `--dari` = Jumat terakhir ≤ `MIN(checktime)` di `checkinout`.
2. Default `--sampai` = `W0 − 8 hari` (batas kunci hari ini).
3. Ulangi per minggu: lewati periode yang sudah terkunci, panggil `kunciPeriode(..., "backfill")`, lalu cetak progres (periode, jumlah baris, durasi).
4. Bisa dihentikan dan dilanjutkan, karena periode yang sudah terkunci dilewati.

Sebelum dijalankan di production:

- Ukur durasi 1 periode di DB dev, lalu kalikan dengan jumlah minggu untuk perkiraan total.
- Jalankan di luar jam kerja.
- **Data lama dibekukan dengan logika dan master data saat ini.** Aturan atau master shift yang berlaku di masa lalu tidak bisa direkonstruksi. Setelah backfill, hasil tanggal lama = hasil live hari ini, lalu tidak berubah lagi.

### 6.4 Membuka kunci periode

Untuk kasus koreksi setelah periode dikunci (misalnya data fingerprint terlambat masuk):

```
bukaKunciPeriode(periode_mulai, oleh, alasan):
  transaction:
    delete absensi_terkunci WHERE id_periode = ?
    update absensi_periode_kunci SET status = 'dibuka', dibuka_at, dibuka_oleh, alasan_buka
```

- Setelah dibuka, periode itu live lagi.
- Periode dikunci ulang dengan `kunciPeriode` (manual atau di cron berikutnya). Saat dikunci ulang, `versi` dinaikkan dan baris `absensi_periode_kunci` yang sama dipakai lagi (bukan insert baru), supaya `UNIQUE` tetap berlaku.
- Tahap awal, buka kunci hanya lewat skrip (`node scripts/bukaKunciAbsensi.js --periode 2026-11-13 --alasan "..."`). Setelah itu dibuat endpoint khusus admin HR dengan alasan wajib diisi (D14).
- Daftar `belum_masuk` periode itu ikut dihapus dan dibuat ulang saat periode dikunci ulang.
- Membuka kunci adalah satu-satunya cara mengoreksi data di periode terkunci, karena pengajuan untuk tanggal terkunci ditolak (bagian 6.5).

### 6.5 Menolak perubahan untuk tanggal terkunci

Semua endpoint yang **membuat, mengubah, menyetujui, menolak, atau menghapus** data sumber absensi dicek dulu. Kalau ada **satu saja** tanggal yang jatuh di periode terkunci, request ditolak:

```json
// 400
{ "msg": "Periode absensi 13-11-2026 s/d 19-11-2026 sudah dikunci, data tidak bisa diubah" }
```

Helper bersama, misalnya `helper/absensiKunciHelper.js`:

```js
// dipanggil sebelum create / update / approve / reject / delete
// lempar error berisi pesan di atas kalau ada tanggal yang terkunci
await pastikanTanggalTidakTerkunci(dari, sampai);
```

- Rentang yang **sebagian** terkunci (misalnya cuti 18–22 Nov saat ≤ 19 Nov sudah terkunci) juga ditolak. User memecah pengajuannya sendiri: bagian yang masih live diajukan ulang.
- Untuk update dan delete, yang dicek adalah tanggal **lama dan baru**, supaya data di periode terkunci tidak bisa dipindah keluar.
- Membaca data (GET) tetap boleh.
- Pengecekan memakai tabel `absensi_periode_kunci` (status `terkunci`), sama seperti router.

Endpoint yang dicek:

| Controller | Fungsi | Tanggal yang dicek |
|---|---|---|
| [pengajuanCutiController.js](../controller/hr/pengajuanCuti/pengajuanCutiController.js) | `createPengajuanCuti`, `approvePengajuanCuti`, `rejectPengajuanCuti` | `dari` – `sampai` |
| [pengajuanLemburController.js](../controller/hr/pengajuanLembur/pengajuanLemburController.js) | `createPengajuanLembur`, `updatePengajuanLembur`, `sendPengajuanLembur`, `approveUserPengajuanLembur`, `rejectUserPengajuanLembur`, `approvePengajuanLembur`, `rejectPengajuanLembur`, `kirimPengajuanLemburTidakSesuai`, `responPengajuanLemburTidakSesuai` | `dari` – `sampai` (dan `dari_2` – `sampai_2` kalau ada) |
| [pengajuanIzinController.js](../controller/hr/pengajuanIzin/pengajuanIzinController.js), [pengajuanSakitController.js](../controller/hr/pengajuanSakit/pengajuanSakitController.js), [pengajuanDinasController.js](../controller/hr/pengajuanDinas/pengajuanDinasController.js) | create, update, approve, reject, delete | `dari` – `sampai` |
| [pengajuanMangkirController.js](../controller/hr/pengajuanMangkir/pengajuanMangkirController.js), [pengajuanTerlambatController.js](../controller/hr/pengajuanTerlambat/pengajuanTerlambatController.js), [pengajuanTerlambatUserController.js](../controller/hr/pengajuanTerlambatuser/pengajuanTerlambatUserController.js), [pengajuanPulangCepatController.js](../controller/hr/pengajuanPulangCepat/pengajuanPulangCepatController.js) | create, update, approve, reject, delete | `tanggal` |
| [jadwalKaryawanController.js](../controller/hr/jadwalKaryawan/jadwalKaryawanController.js) | `createJadwalKaryawan`, `createJadwalKaryawanSatuTahun`, `updateJadwalKaryawan`, `deleteJadwalKaryawan`, `deleteJadwalKaryawanSatuTahun` | `tanggal`. Untuk yang "satu tahun": tanggal terkunci dilewati, bukan menolak seluruh request (D11) |
| [absenCheckInOutController.js](../controller/hr/absenCheckInOutController.js) | `createAbsensiCheckinOut`, `updateAbsensiCheckinOut`, `deleteAbsensiCheckinOut` | `checktime` |

Nama fungsi di controller izin, sakit, dinas, mangkir, terlambat, terlambat user, dan pulang cepat dipastikan saat implementasi.

Yang **tidak** dicek:

- Master shift, master istirahat, master absensi, department, divisi, dan biodata karyawan. Perubahan di master hanya mempengaruhi tanggal live, karena tanggal terkunci sudah tidak dihitung ulang.
- Data fingerprint yang masuk langsung ke `checkinout` dari mesin (di luar API). Data ini tidak terlihat di tanggal terkunci sampai periodenya dibuka.

---

## 7. Verifikasi

Syarat utama: **sesaat setelah periode dikunci, selama tidak ada sumber data yang berubah, hasil router harus identik dengan hasil live.**

Skrip pembanding `scripts/bandingkanAbsensi.js --dari --sampai [--obj '{...}']`:

1. Jalankan perhitungan live murni dan router untuk rentang dan filter yang sama.
2. Bandingkan `JSON.stringify` keduanya (sama dengan yang dikirim `res.json`, termasuk urutan field).
3. Bandingkan tipe setiap field per baris (`Date`, `number`, `string`, `null`, `undefined`) dan jumlah baris per `status_absen`.
4. Cetak baris dan field pertama yang berbeda kalau tidak identik.

Kasus yang wajib dicek:

| # | Kasus |
|---|---|
| V1 | Rentang di dalam 1 periode terkunci |
| V2 | Rentang beberapa periode terkunci |
| V3 | Rentang gabungan terkunci + live (misal 1–30 Nov) |
| V4 | 1 hari terkunci (daftar `belum_masuk` dari tabel), termasuk hari Sabtu (logika Shift 2 kemarin di controller), hari libur, dan `startDate` tanpa nol di depan (`2026-11-7`) |
| V5 | Semua filter yang dipakai pemanggil: `{}`, `is_active`, `id_department`, `id_divisi` (`Op.in`), `id_karyawan`, `tipe_penggajian`, `id_grade ≠ null` |
| V6 | Shift 2 yang checkout-nya di hari Jumat (batas periode) |
| V7 | Cuti, izin, sakit, dan dinas yang melewati batas periode dan batas rentang permintaan |
| V8 | Lembur dengan SPL, tanpa SPL, `status_ketidaksesuaian = approved`, dan Sabtu Shift 2 |
| V9 | Baris `masuk_belum_pulang`, baris dengan field `undefined`, karyawan tanpa bagian mesin dan dengan beberapa bagian mesin |
| V10 | Hasil akhir pemakai: rekap (`jam_lembur_biasa`, `jam_lembur_libur`, dan lainnya) dan payroll untuk periode terkunci, dibandingkan sebelum dan sesudah |
| V11 | Setelah periode dikunci: tambah karyawan baru dan ubah department karyawan lama, lalu get 1 hari terkunci. Karyawan baru tidak muncul sebagai "Belum Masuk". Karyawan yang pindah department muncul sesuai filter department **baru**, tapi isi barisnya memakai department **lama** |

Uji pembekuan (di DB dev):

- Kunci sebuah periode, lalu coba buat, approve, ubah, dan hapus pengajuan, SPL, jadwal libur, dan checkin-out di tanggal dalam periode itu lewat API. Semuanya harus ditolak (bagian 6.5), termasuk rentang yang hanya sebagian terkunci.
- Ubah sumber data langsung di DB (misalnya master shift, atau status pengajuan lewat SQL). Router harus tetap sama, sedangkan perhitungan live berubah.
- Buka kunci periode itu. Router harus ikut berubah (live lagi), dan pengajuan untuk tanggal itu bisa dibuat lagi.

Uji performa: bandingkan waktu respons get absen 1 bulan dan rekap 1 bulan, sebelum dan sesudah.

---

## 8. Fase Pengerjaan

### Fase 1: Refactor + potong dinas

- [ ] Pecah `getAbsensiFunction` menjadi `hitungBarisAbsensi` + `prosesHasilAbsensi` (bagian 5.1)
- [ ] Potong `generateDailyDinas` sesuai rentang (D7)
- [ ] Skrip pembanding (bagian 7). Hasil harus identik dengan sebelumnya, kecuali baris dinas di luar rentang

### Fase 2: Tabel dan penguncian

- [ ] Migration + model `absensi_periode_kunci`, `absensi_terkunci`
- [ ] `FIELD_BARIS` (4 bentuk), `simpanBaris`, `susunBaris`, `kunciPeriode` (termasuk daftar `belum_masuk` per hari), `bukaKunciPeriode`
- [ ] Skrip buka kunci (D14)
- [ ] Skrip backfill, uji di DB dev, ukur durasi

### Fase 3: Router

- [ ] Router di `getAbsensiFunction` dengan flag `ABSENSI_KUNCI_AKTIF` (default `false`)
- [ ] Helper `pastikanTanggalTidakTerkunci` + pengecekan di semua endpoint di bagian 6.5 (D9)
- [ ] Jalankan V1–V11 dan uji pembekuan di DB dev

### Fase 4: Cron dan production

- [ ] Cron mingguan (Jumat 00:05 WIB) + kunci periode tertunda saat server start
- [ ] `npm run migrate` di production, jalankan backfill di luar jam kerja (D15)
- [ ] Aktifkan `ABSENSI_KUNCI_AKTIF=true`. Kalau ada masalah, cukup set `false` lagi untuk kembali ke perilaku lama

### Fase 5: Lanjutan (opsional)

- [ ] Endpoint buka/kunci ulang periode untuk admin HR, alasan wajib diisi (D14)
- [ ] Jumlah hari cuti/sakit/izin/mangkir di rekap dihitung dari baris absen (D10), kalau nanti diputuskan

---

## 9. Keputusan

### Sudah diputuskan

| # | Keputusan |
|---|---|
| D1 | Tujuan: **membekukan histori**, bukan sekadar mempercepat |
| D2 | Periode **Jumat s/d Kamis**, dengan **masa koreksi 1 minggu** sebelum dikunci |
| D3 | **Semua pemakai** `getAbsensiFunction` otomatis memakai gabungan data terkunci + live. Format hasil sama persis |
| D4 | **Backfill semua data lama** |
| D5 | Sabtu Shift 2 tetap dihitung lembur tanpa SPL (aturan yang sudah berlaku) |
| D6 | Penguncian dilakukan **setiap hari Jumat** |
| D7 | Baris dinas **dipotong sesuai rentang** permintaan, sama seperti cuti/izin/sakit. Berlaku untuk perhitungan live juga |
| D8 | Data terkunci disimpan **per kolom**. Hanya `bagian_mesin` (array) yang disimpan sebagai JSON |
| D9 | Pengajuan, approval, SPL, jadwal libur, dan checkin-out untuk tanggal terkunci **ditolak** (bagian 6.5) |
| D10 | Jumlah hari cuti/sakit/izin/mangkir di rekap **tidak diubah** di tahap ini, tetap dari tabel pengajuan (lihat catatan di bawah) |
| D11 | `createJadwalKaryawanSatuTahun` / `deleteJadwalKaryawanSatuTahun` **melewati tanggal yang terkunci** dan menyebutkannya di response, bukan menolak seluruh request. Fungsi ini dipakai untuk menyiapkan jadwal tahun baru / tahun depan, jadi dalam pemakaian normal tidak ada tanggal yang terkunci. Aturan ini hanya pengaman |
| D12 | Filter `obj` untuk tanggal terkunci memakai **biodata saat ini** (sama dengan live). Isi baris memakai data saat dikunci. Contohnya, karyawan yang pindah department muncul di filter department baru, tapi `nama_department` di barisnya tetap department lama |
| D13 | Daftar **"Belum Masuk" ikut disimpan** saat periode dikunci (bentuk `belum_masuk`, 1 baris per karyawan per hari). Get 1 hari terkunci memakai daftar ini, tidak dibentuk ulang dari daftar karyawan saat ini |
| D14 | Buka kunci periode hanya oleh **admin HR**, dengan **alasan wajib diisi**. Tahap awal lewat skrip, lalu endpoint |
| D15 | Backfill di production dijalankan **di luar jam kerja**, setelah durasinya diukur di dev |

### Masih terbuka

Tidak ada. Rancangan siap dikerjakan mulai Fase 1.

**Catatan D10 (dampak kalau nanti diubah):**

- **Payroll tidak terdampak.** Semua perhitungan uang di payroll sudah memakai baris `getAbsensiFunction`, jadi otomatis ikut terkunci tanpa perubahan.
- Yang terdampak hanya **2 endpoint rekap** (`GET /hr/absensiRekap` dan `GET /hr/absensiRekapPeriode`), di 5 angka jumlah hari.
- Kalau 5 angka itu dihitung dari baris absen (jumlah baris per `status_absen`), **nilainya bisa berubah dari sekarang**:
  - Sekarang dihitung dari `jumlah_hari` pengajuan yang **tanggal mulainya** di dalam rentang. Cuti 28 Nov – 3 Des dihitung penuh di rekap November, dan tidak dihitung sama sekali di Desember.
  - Dari baris absen, yang dihitung hanya hari di dalam rentang, dan hari libur tidak ikut dihitung (baris cuti/izin/sakit tidak dibuat di hari libur).
- Array `cuti_khusus`, `cuti_tahunan`, `sakit`, `izin`, `mangkir` berisi data pengajuan asli (alasan, approval, dan lainnya). Datanya tidak bisa dibentuk dari baris absen, jadi tetap diambil live dari tabel pengajuan.
- Karena pengajuan untuk tanggal terkunci ditolak (D9), 5 angka ini praktis juga tidak berubah untuk periode terkunci, walaupun tetap dibaca live.
- Kalau nanti ingin konsisten, hitung 5 angka itu dari baris absen dan konfirmasi dulu ke HR bahwa cara hitungnya berubah.

---

## 10. Risiko & Edge Case

- **Bug di logika hitung ikut terkunci.** Kalau logika absensi diperbaiki setelah periode dikunci, periode lama tidak ikut berubah. Ini sesuai tujuan, tapi perbaikan untuk periode lama harus lewat buka kunci lalu kunci ulang. `versi_logika` membantu menelusuri versi kode yang dipakai.
- **Field baru di baris absen.** Setiap field baru wajib ditambahkan sebagai kolom (migration) dan ke `FIELD_BARIS`. Kalau lupa, penguncian periode gagal dengan pesan jelas (bagian 5.3), bukan menyimpan data yang tidak lengkap. Periode yang gagal tetap live sampai diperbaiki.
- **Data fingerprint terlambat masuk** ke `checkinout` setelah periode dikunci → tidak terlihat sampai periode dibuka dan dikunci ulang.
- **Koreksi terlambat untuk periode terkunci** (pengajuan yang lupa diajukan, SPL yang belum di-approve) → ditolak API (D9). Satu-satunya jalan adalah buka kunci, koreksi, lalu kunci ulang (bagian 6.4). HR perlu diberi tahu bahwa batas koreksinya adalah Kamis, 1 minggu setelah minggu itu selesai.
- **Pengajuan lintas batas kunci** (misalnya cuti 18–22 Nov) → ditolak seluruhnya, dan user memecah pengajuannya. Perlu pesan error yang jelas supaya user tahu tanggal mana yang terkunci.
- **Cron gagal** → periode tetap live (aman), lalu dikunci saat cron berikutnya atau saat server start.
- **Beberapa instance API** → `UNIQUE (periode_mulai)` + cron hanya di 1 instance.
- **Backfill lama dan berat** untuk DB → per periode, bisa dilanjutkan, dan dijalankan di luar jam kerja.
- **Tipe data berubah** (`Date` jadi string, angka jadi string karena `DECIMAL`) → kolom `DATETIME(3)` dan `DOUBLE`, dicek di skrip pembanding.
- **Timezone** → tanggal periode dan rumus W0 memakai WIB dengan konvensi yang sama dengan kode sekarang (`getUTC*` pada `checktime`). Jangan pakai `toISOString()` untuk mengambil tanggal hari ini, karena bisa bergeser 1 hari.
- **Ukuran tabel** → ±120 MB per tahun untuk 300 karyawan, termasuk daftar `belum_masuk` (perkiraan, bagian 4.3). Cek jumlah karyawan dan rentang data sebenarnya sebelum backfill.
- **Rollback** → `ABSENSI_KUNCI_AKTIF=false` mengembalikan perilaku lama tanpa menghapus data.
