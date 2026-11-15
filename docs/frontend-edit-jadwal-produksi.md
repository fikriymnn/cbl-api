# Frontend: Edit Hasil Calculate Jadwal Produksi

Dokumen ini untuk tim frontend. Isinya konsep, alur layar, endpoint, payload, response, dan aturan validasi untuk fitur **mengubah hasil calculate tiket jadwal produksi** sebelum tiket di-submit:

- **geser jadwal** sebuah tahapan, lebih cepat atau lebih lambat;
- **ubah kapasitas per jam** atau **drying time** sebuah tahapan.

Latar belakang dan aturan bisnis lengkap ada di [plan-edit-jadwal-produksi.md](plan-edit-jadwal-produksi.md).

---

## 1. Konsep Singkat

### 1.1 Kapan fitur ini aktif

Hanya untuk tiket dengan:

| Field tiket | Nilai |
|---|---|
| `status` | `calculated` |
| `status_tiket` | `incoming` (belum di-submit) |

Tiket di luar kondisi ini ditolak backend dengan `400`. Sembunyikan atau nonaktifkan tombol ubah jadwal untuk tiket seperti itu.

Tiket yang di-calculate **sebelum fitur ini rilis** belum punya data posisi baru. Backend membalas `409` dengan pesan *"Tiket ini di-calculate dengan versi lama. Calculate ulang tiket terlebih dahulu."* Tampilkan pesan itu beserta tombol **Calculate ulang**.

### 1.2 Istilah

| Istilah | Arti |
|---|---|
| **Tahapan** | Satu baris `tiket_jadwal_produksi_tahapan` (Plate, Potong, Cetak, Pond, ..., FG). Tahapan terakhir selalu **FG**. |
| **Slot** | Satu jam kerja sebuah tahapan di mesinnya. Hanya tahapan per jam (`from` = `druk` / `pcs`) yang punya slot. |
| **Tahapan tgl** | Tahapan dengan `from = "tgl"` (Plate, atau mesin yang tidak ada di master). Tidak punya slot, hanya rentang tanggal (jatah 2 hari kerja). |
| **Grup tgl** | Beberapa tahapan tgl yang **berurutan** berbagi rentang tanggal yang sama dan **selalu bergeser bersama**. Ditandai `grup_tgl` (angka yang sama). |
| **Drying** | Jeda setelah tahapan selesai sebelum tahapan berikutnya boleh mulai. Dihitung dengan jam biasa (tidak ikut shift). Ditampilkan sebagai data, tapi **tidak memakai jam mesin**. |
| **Target FG** | H-2 hari kerja sebelum tanggal kirim (Minggu dan hari libur tidak dihitung). Calculate menyusun jadwal mundur dari sini. |
| **Spare** | Rentang antara target FG dan tanggal kirim. Boleh dipakai saat jadwal mundur, dengan peringatan. |
| **Tahapan yang diubah** | Tahapan yang dipilih PPIC untuk digeser atau diubah parameternya (`peran: "diubah"`). |
| **Tahapan ikut** | Tahapan lain yang ikut bergeser karena perubahan itu (`peran: "ikut"`). Dipilih lewat **ceklis**. |

### 1.3 Aturan validasi

Setiap simulasi atau penyimpanan dicek terhadap aturan berikut. **Konflik** = perubahan tidak bisa disimpan. **Peringatan** = boleh disimpan, tapi tampilkan ke user.

| Kode | Jenis | Arti | Contoh pesan |
|---|---|---|---|
| R1 | Konflik | Mesin sudah dipakai JO lain di jam itu (jadwal resmi) | `Mesin R700 sudah dipakai JO-0012 (Cetak 1) pada 2026-11-19 13:00` |
| R2 | Konflik | Tahapan **sebelumnya** wajib ikut bergeser tapi tidak dicentang | `Potong wajib ikut bergeser (...), tapi tidak dicentang` |
| R3 | Konflik | Tahapan **sesudahnya** wajib ikut bergeser tapi tidak dicentang | `Pond wajib ikut bergeser (...), tapi tidak dicentang` |
| R4 | Konflik | Tahapan terakhir selesai **setelah tanggal kirim** | `Lem selesai 2026-11-24 16:00, melewati tanggal kirim 2026-11-24` |
| R5 | Konflik | Tahapan yang berubah mulai **sebelum waktu sekarang** | `Plate mulai 2026-11-10 08:00, sebelum waktu sekarang` |
| R6 | Peringatan | **Memakai spare** (selesai setelah target FG, masih sebelum tanggal kirim) | `Memakai spare: selesai 2026-11-22 12:00, melewati target FG 2026-11-21` |
| R7 | Peringatan | Ada jam yang jatuh di **jam lembur** | `Cetak 1: 3 jam jatuh di jam lembur` |
| R8 | Peringatan | Bentrok dengan **tiket lain yang belum di-submit** | `Pond: 2 jam bentrok dengan tiket lain yang belum di-submit` |

Backend selalu mengirim `msg` yang sudah siap ditampilkan. Frontend cukup menampilkan `msg`, dan boleh memakai `rule` untuk ikon atau warna.

Semua mesin **default dicek bentrok** (R1), termasuk mesin manual dan outsource. Mesin yang boleh dipakai beberapa JO sekaligus ditandai `allow_concurrent = true` di master mesin (lihat bagian 4.9).

### 1.4 Ceklis tahapan yang ikut berubah

Saat sebuah tahapan diubah, tahapan lain bisa terkena:

| Arah perubahan | Tahapan yang bisa wajib ikut |
|---|---|
| Lebih cepat | Tahapan **sebelumnya** (supaya selesai + drying-nya tidak melewati mulai yang baru) |
| Lebih lambat | Tahapan **sesudahnya** |

Aturan ceklis:

1. Panggilan `simulate` pertama **tanpa** `ikut`. Backend otomatis mencentang tahapan yang **wajib ikut** (`wajib_ikut: true`, `dicentang: true`).
2. User boleh **menambah** centang di tahapan yang `bisa_dicentang: true`. Tahapan yang dicentang **dirapatkan** ke tahapan di sebelahnya (geser secukupnya sampai tidak ada jeda selain drying).
3. User boleh **menghapus** centang. Kalau yang dihapus tahapan wajib, backend membalas konflik R2/R3 dan perubahan tidak bisa disimpan.
4. Setiap kali ceklis berubah, panggil `simulate` lagi dengan `ikut` = id semua tahapan yang dicentang.
5. Tahapan yang **tidak bersebelahan** dengan rangkaian yang bergeser tidak bisa dicentang (`bisa_dicentang: false`).
6. **Grup tgl**: semua anggota satu grup berbagi status ceklis. Kalau satu anggota dicentang atau dihapus, ubah semua anggota grup yang sama.

### 1.5 Ubah kapasitas / drying: mode A atau B

| Mode | Nilai `mode` | Yang tetap | Yang bisa ikut bergeser |
|---|---|---|---|
| **A (default)** | `mulai_tetap` | Jam mulai tahapan | Tahapan **sesudahnya** mundur (bisa memakai spare) |
| **B** | `selesai_tetap` | Jam selesai + drying tahapan | Tahapan ini dan tahapan **sebelumnya** maju |

- Tahapan tgl tidak punya kapasitas. Hanya `drying_time` yang bisa diubah.
- Nilai baru **hanya berlaku untuk tiket ini**. Master dan IO tidak berubah.

---

## 2. Aturan Umum API

### 2.1 Autentikasi

Endpoint baru (bagian 4.3–4.7) memakai middleware `auth`: cookie `access_token` wajib terkirim (`withCredentials: true` di axios).

| Kondisi | Response |
|---|---|
| Cookie tidak ada | `500 { "msg": "pliss login" }` |
| Token tidak valid | `403 { "status_code": 403, "message": "Access token invalid." }` |

### 2.2 Format waktu

- **Request & response endpoint baru** memakai waktu lokal WIB dengan format `"YYYY-MM-DD HH:mm"`, contoh `"2026-11-18 14:00"`. Tanggal saja: `"YYYY-MM-DD"`.
- Request juga menerima `"YYYY-MM-DDTHH:mm"` (format input `datetime-local`).
- **Endpoint lama** (`GET /ppic/jadwalProduksi/:id`) mengembalikan kolom `DATETIME` sebagai ISO UTC, contoh `"2026-11-18T07:00:00.000Z"`. Konversi ke WIB sebelum ditampilkan.

### 2.3 Format error

| Status | Kapan | Body |
|---|---|---|
| `400` | Input tidak valid, tiket tidak bisa diubah, FG diubah langsung | `{ "msg": "..." }` |
| `404` | Tahapan / tiket tidak ditemukan, `suggestSlot` tidak menemukan jam | `{ "msg": "..." }` |
| `409` | `apply` gagal validasi, tiket versi lama, submit bentrok | lihat endpoint masing-masing |
| `500` | Error server | `{ "msg": "..." }` |

### 2.4 Parameter `is_lembur`

Semua endpoint baru menerima `is_lembur` (opsional, default `false`), sama dengan `?is_lembur=true` di calculate: **semua tanggal dianggap lembur** (shift 08:00–20:00 dan 20:00–08:00). Kalau tidak dikirim, jam lembur mengikuti jadwal lembur per mesin.

---

## 3. Data Tahapan di Detail Tiket

`GET /ppic/jadwalProduksi/:id` (endpoint lama) sekarang punya kolom tambahan.

**Tiket:**

| Field | Tipe | Arti |
|---|---|---|
| `tgl_target_fg` | `"YYYY-MM-DD"` | Target FG (H-2 hari kerja) |

**Setiap item `tahap[]`:**

| Field | Tipe | Arti |
|---|---|---|
| `produksi_mulai` | ISO datetime | Mulai produksi |
| `produksi_selesai` | ISO datetime | Selesai produksi |
| `drying_mulai` | ISO datetime | Mulai drying (= selesai produksi) |
| `drying_selesai` | ISO datetime | Selesai drying |
| `is_diubah_manual` | boolean | Pernah diubah PPIC sejak calculate terakhir |
| `id_tahapan` | number | id master tahapan |
| `id_mesin` | number | id master mesin |
| `tgl_from` / `tgl_to` | string `"YYYY-MM-DD HH.mm.ss"` | Format lama. **Arti `tgl_to` berubah**: sekarang selesai produksi, bukan mulai tahapan berikutnya. |

Untuk timeline, pakai `produksi_mulai`/`produksi_selesai` dan `drying_mulai`/`drying_selesai`. Slot per jam ada di `tahap[].jadwal_per_jam[]` (`tanggal` + `jam`).

> Kalau `produksi_mulai` kosong untuk tahapan selain FG, tiket ini dihitung dengan versi lama dan perlu di-calculate ulang.

---

## 4. Endpoint

| # | Method | Path | Fungsi |
|---|---|---|---|
| 4.1 | GET | `/ppic/calculateJadwalProduksi/:id` | Calculate (berubah) |
| 4.2 | PUT | `/ppic/jadwalProduksi/submit/:id` | Submit (ada respons bentrok baru) |
| 4.3 | GET | `/ppic/jadwalProduksi/availability/:id_tahapan` | Status jam mesin + zona warna |
| 4.4 | POST | `/ppic/jadwalProduksi/simulate/:id_tahapan` | Simulasi perubahan (tidak menyimpan) |
| 4.5 | POST | `/ppic/jadwalProduksi/suggestSlot/:id_tahapan` | Cari jam mulai valid terdekat |
| 4.6 | PUT | `/ppic/jadwalProduksi/apply/:id_tahapan` | Simpan perubahan |
| 4.7 | GET | `/ppic/jadwalProduksi/adjustLog/:id` | Riwayat perubahan tiket |
| 4.8 | PUT | `/ppic/jadwalProduksi/:id` | **Lama, jangan dipakai lagi** |
| 4.9 | POST/PUT | master mesin | Field baru `allow_concurrent` |
| 4.10 | GET | `/ppic/jadwalProduksi/conflicts/:id` | Daftar bentrok mesin tiket |
| 4.11 | POST | `/ppic/jadwalProduksi/resolveConflicts/:id` | Preview "Selesaikan semua bentrok otomatis" |
| 4.12 | PUT | `/ppic/jadwalProduksi/resolveConflicts/:id` | Simpan "Selesaikan semua bentrok otomatis" |

`:id_tahapan` = `tiket_jadwal_produksi_tahapan.id` (tahapan yang diubah). `:id` = `tiket_jadwal_produksi.id`.

### 4.1 Calculate (berubah)

`GET /ppic/calculateJadwalProduksi/:id?is_lembur=true|false`

Perubahan perilaku:

- Jadwal dihitung mundur dari **target FG (H-2 hari kerja)**, bukan dari tanggal kirim. Hasilnya mulai lebih awal dibanding sebelumnya.
- Jam mesin yang sudah dipakai jadwal resmi lain **tidak dilompati**. Jadwal tetap ditaruh di posisi idealnya, dan bentroknya dikembalikan di `data.conflicts` (R1). PPIC yang menyelesaikannya (bagian 5.8): geser manual, cari jam kosong terdekat, atau selesaikan semua bentrok otomatis.
- Calculate ulang **menghapus semua perubahan manual** dan menyusun ulang dari awal. Tampilkan konfirmasi kalau ada tahapan dengan `is_diubah_manual: true`.

Response `200` (bentuk sama seperti sebelumnya, ditambah field baru):

```json
{
  "data": {
    "id": 160,
    "item": "BOX ...",
    "no_jo": "JO-00806/06/2026",
    "no_booking": null,
    "tgl_kirim": "03 Jul 2026",
    "tgl_target_fg": "2026-07-01",
    "qty_pcs": 100000,
    "qty_druk": 13100,
    "status": "calculated",
    "tahap": [
      {
        "id": 1201,
        "tahapan": "Cetak 1",
        "tahapan_ke": 3,
        "from": "druk",
        "mesin": "SM",
        "id_mesin": 3,
        "kapasitas_per_jam": 3000,
        "drying_time": 24,
        "setting": 60,
        "kapasitas": 4.36,
        "total_waktu_produksi": 5.36,
        "tgl_from": "2026-06-10 20.00.00",
        "tgl_to": "2026-06-11 02.00.00",
        "produksi_mulai": "2026-06-10 20:00",
        "produksi_selesai": "2026-06-11 02:00",
        "drying_mulai": "2026-06-11 02:00",
        "drying_selesai": "2026-06-12 02:00",
        "listJadwalPerJam": [
          { "tgl": "2026-06-10", "tanggal": "2026-06-10", "jam": "20:00:00", "mesin": "SM", "is_lembur": false }
        ]
      }
    ],
    "conflicts": [
      {
        "rule": "R1",
        "id_tahapan": 1201,
        "tahapan": "Cetak 1",
        "mesin": "SM",
        "waktu": "2026-06-10 21:00",
        "no_jo": "JO-0012",
        "no_booking": null,
        "tahapan_lain": "Cetak 1",
        "msg": "Mesin SM sudah dipakai JO-0012 (Cetak 1) pada 2026-06-10 21:00"
      }
    ]
  },
  "jadwalPerJam": []
}
```

Kalau `data.conflicts` tidak kosong, tampilkan peringatan bentrok setelah calculate (bagian 5.8).

Error: `404 { msg: "data tidak ditemukan" }`, `400 { msg: "data belum lengkap" }`, `400 { msg: "Tidak ditemukan jam kerja kosong untuk tahapan ..." }`.

### 4.2 Submit (respons bentrok baru)

`PUT /ppic/jadwalProduksi/submit/:id`

Sebelum disimpan ke jadwal resmi, backend mengecek ulang bentrok mesin (slot bisa sudah diambil tiket lain sejak calculate). Kalau bentrok:

`409`

```json
{
  "msg": "Jadwal bentrok dengan jadwal produksi yang sudah ada. Ubah jadwal tiket terlebih dahulu.",
  "conflicts": [
    {
      "rule": "R1",
      "tahapan": "Cetak 1",
      "mesin": "R700",
      "waktu": "2026-11-19 13:00",
      "no_jo": "JO-0012",
      "no_booking": null,
      "tahapan_lain": "Cetak 1",
      "msg": "Mesin R700 sudah dipakai JO-0012 (Cetak 1) pada 2026-11-19 13:00"
    }
  ]
}
```

Tampilkan daftar konflik dan arahkan user ke layar ubah jadwal (bagian 5).

### 4.3 Availability

`GET /ppic/jadwalProduksi/availability/:id_tahapan?from=&to=&is_lembur=`

| Query | Wajib | Default | Keterangan |
|---|---|---|---|
| `from` | Tidak | jam sekarang | `"YYYY-MM-DD HH:mm"` |
| `to` | Tidak | tanggal kirim | Maksimal 31 hari dari `from` |

Untuk setiap jam di rentang itu, backend mengembalikan **status mesin** tahapan ini dan **zona** (apa yang terjadi kalau tahapan dimulai di jam itu).

Response `200`:

```json
{
  "data": {
    "tahapan": {
      "id": 1201,
      "tahapan": "Cetak 1",
      "mesin": "R700",
      "id_mesin": 2,
      "from": "druk",
      "allow_concurrent": false,
      "durasi_jam": 6,
      "drying_time": 4,
      "mulai": "2026-11-19 10:00",
      "selesai": "2026-11-19 16:00",
      "drying_mulai": "2026-11-19 16:00",
      "drying_selesai": "2026-11-19 20:00"
    },
    "tgl_kirim": "2026-11-24",
    "tgl_target_fg": "2026-11-21",
    "from": "2026-11-17 09:00",
    "to": "2026-11-24 00:00",
    "slots": [
      { "waktu": "2026-11-18 14:00", "status": "kosong", "zona": "kuning" },
      { "waktu": "2026-11-18 15:00", "status": "terisi", "zona": "merah", "no_jo": "JO-0012", "no_booking": null, "tahapan": "Cetak 1" },
      { "waktu": "2026-11-18 16:00", "status": "di_luar_shift", "zona": null },
      { "waktu": "2026-11-18 20:00", "status": "lembur", "zona": "hijau" },
      { "waktu": "2026-11-19 10:00", "status": "milik_tiket_ini", "zona": "hijau" }
    ]
  }
}
```

`status` (kondisi mesin di jam itu):

| Nilai | Arti | Saran warna |
|---|---|---|
| `kosong` | Jam kerja, mesin kosong | putih |
| `lembur` | Jam kerja karena lembur | kuning muda |
| `di_luar_shift` | Bukan jam kerja | abu-abu arsir |
| `terisi` | Dipakai JO lain (jadwal resmi). Ada `no_jo` / `no_booking` / `tahapan` | abu-abu gelap |
| `terisi_draft` | Dipakai tiket lain yang belum di-submit | abu-abu muda |
| `milik_tiket_ini` | Slot tiket ini sendiri di mesin yang sama | warna bar tahapan |

`zona` (kalau tahapan **dimulai** di jam itu):

| Nilai | Arti | Saran warna |
|---|---|---|
| `hijau` | Valid tanpa menggeser tahapan lain | hijau |
| `kuning` | Valid, tapi ada tahapan lain yang wajib ikut bergeser | kuning |
| `merah` | Tidak valid (bentrok, lewat tanggal kirim, sebelum sekarang, dll.) | merah |
| `null` | Bukan jam kerja, tidak bisa jadi jam mulai | tanpa warna |

> Availability menjalankan simulasi untuk setiap jam, jadi butuh waktu. Panggil saat user **mulai** drag atau membuka panel, bukan di setiap gerakan mouse. Simpan hasilnya selama panel terbuka.

### 4.4 Simulate

`POST /ppic/jadwalProduksi/simulate/:id_tahapan`

Tidak menyimpan apa pun. Dipakai untuk preview, dan dipanggil ulang setiap kali input atau ceklis berubah.

**Body: geser jadwal**

```json
{
  "jenis": "geser",
  "new_start": "2026-11-18 14:00",
  "ikut": [1200],
  "is_lembur": false
}
```

**Body: ubah kapasitas dan/atau drying**

```json
{
  "jenis": "ubah_parameter",
  "kapasitas_per_jam": 800,
  "drying_time": 6,
  "mode": "mulai_tetap",
  "ikut": [1202, 1203]
}
```

| Field | Wajib | Keterangan |
|---|---|---|
| `jenis` | Ya | `"geser"` atau `"ubah_parameter"` |
| `new_start` | Ya untuk `geser` | Jam mulai baru. Kalau bukan jam kerja, tahapan mulai di jam kerja berikutnya. |
| `kapasitas_per_jam` | Salah satu wajib untuk `ubah_parameter` | Angka > 0. Tidak boleh untuk tahapan tgl. |
| `drying_time` | Salah satu wajib untuk `ubah_parameter` | Bilangan bulat jam ≥ 0 |
| `mode` | Tidak | `"mulai_tetap"` (default) atau `"selesai_tetap"` |
| `ikut` | Tidak | Array id tahapan yang dicentang. **Jangan kirim** di panggilan pertama supaya backend mencentang yang wajib. |
| `is_lembur` | Tidak | Lihat 2.4 |

Response `200`:

```json
{
  "data": {
    "valid": true,
    "jenis": "geser",
    "id_tahapan": 1201,
    "tgl_kirim": "2026-11-24",
    "tgl_target_fg": "2026-11-21",
    "parameter": null,
    "tahapan": [
      {
        "id": 1199,
        "tahapan": "Plate",
        "tahapan_ke": 1,
        "mesin": "CTP",
        "id_mesin": 1,
        "from": "tgl",
        "is_fg": false,
        "grup_tgl": null,
        "peran": "tetap",
        "wajib_ikut": false,
        "dicentang": false,
        "bisa_dicentang": false,
        "lama": { "mulai": "2026-11-13 08:00", "selesai": "2026-11-17 08:00", "drying_mulai": "2026-11-17 08:00", "drying_selesai": "2026-11-17 08:00" },
        "baru": { "mulai": "2026-11-13 08:00", "selesai": "2026-11-17 08:00", "drying_mulai": "2026-11-17 08:00", "drying_selesai": "2026-11-17 08:00" }
      },
      {
        "id": 1200,
        "tahapan": "Potong",
        "tahapan_ke": 2,
        "mesin": "ITTOH",
        "id_mesin": 5,
        "from": "druk",
        "is_fg": false,
        "grup_tgl": null,
        "peran": "ikut",
        "wajib_ikut": true,
        "dicentang": true,
        "bisa_dicentang": true,
        "lama": { "mulai": "2026-11-19 08:00", "selesai": "2026-11-19 10:00", "drying_mulai": "2026-11-19 10:00", "drying_selesai": "2026-11-19 10:00" },
        "baru": { "mulai": "2026-11-18 12:00", "selesai": "2026-11-18 14:00", "drying_mulai": "2026-11-18 14:00", "drying_selesai": "2026-11-18 14:00" },
        "slots_baru": ["2026-11-18 12:00", "2026-11-18 13:00"]
      },
      {
        "id": 1201,
        "tahapan": "Cetak 1",
        "peran": "diubah",
        "wajib_ikut": false,
        "dicentang": false,
        "bisa_dicentang": false,
        "lama": { "mulai": "2026-11-19 10:00", "selesai": "2026-11-19 16:00", "drying_mulai": "2026-11-19 16:00", "drying_selesai": "2026-11-19 20:00" },
        "baru": { "mulai": "2026-11-18 14:00", "selesai": "2026-11-19 12:00", "drying_mulai": "2026-11-19 12:00", "drying_selesai": "2026-11-19 16:00" },
        "slots_baru": ["2026-11-18 14:00", "2026-11-18 15:00", "2026-11-19 08:00", "2026-11-19 09:00", "2026-11-19 10:00", "2026-11-19 11:00"]
      },
      {
        "id": 1202,
        "tahapan": "Pond",
        "peran": "tetap",
        "wajib_ikut": false,
        "dicentang": false,
        "bisa_dicentang": true,
        "lama": { "...": "..." },
        "baru": { "...": "..." }
      },
      {
        "id": 1205,
        "tahapan": "FG",
        "is_fg": true,
        "peran": "tetap",
        "bisa_dicentang": false,
        "lama": { "mulai": "2026-11-21 00:00", "selesai": "2026-11-21 00:00", "drying_mulai": "2026-11-21 00:00", "drying_selesai": "2026-11-21 00:00" },
        "baru": { "mulai": "2026-11-21 00:00", "selesai": "2026-11-21 00:00", "drying_mulai": "2026-11-21 00:00", "drying_selesai": "2026-11-21 00:00" }
      }
    ],
    "conflicts": [],
    "warnings": [
      { "rule": "R7", "id_tahapan": 1201, "tahapan": "Cetak 1", "waktu": ["2026-11-18 20:00"], "msg": "Cetak 1: 1 jam jatuh di jam lembur" }
    ]
  }
}
```

Field setiap item `tahapan[]`:

| Field | Arti |
|---|---|
| `peran` | `diubah` (tahapan yang diubah PPIC), `ikut` (ikut bergeser), `tetap` (tidak berubah). FG bisa `ikut` kalau tahapan terakhir mundur ke area spare. |
| `wajib_ikut` | Tahapan ini harus ikut bergeser. Tampilkan badge **Wajib**. |
| `dicentang` | Status ceklis. |
| `bisa_dicentang` | Ceklis aktif (boleh diubah user). |
| `grup_tgl` | Angka grup kalau tahapan ini anggota grup tgl, selain itu `null`. Anggota dengan angka sama berbagi ceklis. |
| `is_fg` | Tahapan FG (tidak punya ceklis, tidak bisa diubah). |
| `lama` / `baru` | Posisi sebelum dan sesudah perubahan (`mulai`, `selesai`, `drying_mulai`, `drying_selesai`). |
| `geser_jam` | Selisih jam mulai baru dikurangi lama (negatif = lebih cepat, positif = lebih lambat). |
| `slots_baru` | Daftar jam baru, hanya untuk tahapan yang berubah dan punya slot. |

`parameter` (hanya untuk `ubah_parameter`):

```json
{
  "mode": "mulai_tetap",
  "kapasitas_per_jam": { "lama": 1000, "baru": 800 },
  "drying_time": { "lama": 4, "baru": 4 },
  "durasi_jam": { "lama": 6, "baru": 7 }
}
```

Bentuk `conflicts[]` / `warnings[]`:

| `rule` | Field tambahan |
|---|---|
| R1 | `id_tahapan`, `tahapan`, `mesin`, `waktu`, `no_jo`, `no_booking`, `tahapan_lain` (ada kalau bentrok di jam tertentu) |
| R2, R3, R4, R5 | `id_tahapan`, `tahapan` |
| R6 | `spare_terpakai_jam` |
| R7 | `id_tahapan`, `tahapan`, `waktu` (array) |
| R8 | `id_tahapan`, `tahapan`, `detail` (array `{ waktu, no_jo, no_booking }`) |

Error `400` contoh: `jenis harus salah satu dari: geser, ubah_parameter`, `new_start wajib diisi, format YYYY-MM-DD HH:mm`, `kapasitas_per_jam harus angka lebih dari 0`, `Tahapan FG tidak bisa diubah langsung`, `Jadwal hanya bisa diubah untuk tiket yang sudah di-calculate dan belum di-submit`.

### 4.5 Suggest slot

`POST /ppic/jadwalProduksi/suggestSlot/:id_tahapan`

Mencari jam mulai valid **terdekat** dari `around` (arah lebih cepat didahulukan), hanya memakai tahapan wajib ikut. Dipakai untuk tombol **"Cari jam kosong terdekat"**.

Body:

```json
{ "around": "2026-11-19 10:00", "is_lembur": false }
```

`around` opsional, default posisi tahapan sekarang.

Response `200`: sama seperti `simulate`, ditambah `new_start`:

```json
{ "data": { "new_start": "2026-11-18 14:00", "valid": true, "tahapan": [], "conflicts": [], "warnings": [] } }
```

Kalau tidak ketemu: `404 { "msg": "Tidak ditemukan jam mulai yang valid sampai tanggal kirim" }`.

Setelah dapat hasil, tampilkan sebagai preview. Untuk menyimpan, panggil `apply` dengan `new_start` dari hasil ini.

### 4.6 Apply

`PUT /ppic/jadwalProduksi/apply/:id_tahapan`

Body sama dengan `simulate`, ditambah `alasan` (**wajib**):

```json
{
  "jenis": "geser",
  "new_start": "2026-11-18 14:00",
  "ikut": [1200],
  "alasan": "R700 dipakai JO-0012"
}
```

- **Selalu kirim `ikut`** dari hasil simulate terakhir (`tahapan.filter(t => t.dicentang).map(t => t.id)`), supaya yang disimpan sama dengan yang dilihat user.
- Backend menjalankan ulang validasi di dalam transaction (mesin bisa diambil orang lain sejak simulate).

Response `200`:

```json
{ "msg": "Perubahan jadwal disimpan", "data": { "valid": true, "tahapan": [], "conflicts": [], "warnings": [] } }
```

Response `409` (validasi gagal; field hasil simulasi ada di **level atas**, bukan di `data`):

```json
{
  "msg": "Perubahan jadwal tidak valid",
  "valid": false,
  "tahapan": [],
  "conflicts": [{ "rule": "R1", "msg": "Mesin R700 sudah dipakai JO-0099 ..." }],
  "warnings": []
}
```

Saat `409`: tampilkan `conflicts`, muat ulang availability, dan biarkan user mengubah lagi.

Error lain: `400 { msg: "alasan wajib diisi" }`.

Setelah `200`: muat ulang detail tiket (`GET /ppic/jadwalProduksi/:id`) dan timeline.

### 4.7 Riwayat perubahan

`GET /ppic/jadwalProduksi/adjustLog/:id` (`:id` = id tiket)

Response `200` (urut terbaru dulu):

```json
{
  "data": [
    {
      "id": 12,
      "id_tiket_jadwal_produksi": 160,
      "id_tiket_jadwal_produksi_tahapan": 1201,
      "jenis": "geser",
      "mode": null,
      "nilai_lama": { "mulai": "2026-11-19 10:00", "selesai": "2026-11-19 16:00", "drying_mulai": "2026-11-19 16:00", "drying_selesai": "2026-11-19 20:00", "kapasitas_per_jam": 1000, "drying_time": 4, "durasi_jam": 6 },
      "nilai_baru": { "mulai": "2026-11-18 14:00", "selesai": "2026-11-19 12:00", "drying_mulai": "2026-11-19 12:00", "drying_selesai": "2026-11-19 16:00", "kapasitas_per_jam": 1000, "drying_time": 4, "durasi_jam": 6 },
      "tahapan_ikut": [
        { "id": 1200, "tahapan": "Potong", "lama": { "mulai": "2026-11-19 08:00", "selesai": "2026-11-19 10:00" }, "baru": { "mulai": "2026-11-18 12:00", "selesai": "2026-11-18 14:00" } }
      ],
      "alasan": "R700 dipakai JO-0012",
      "id_user": 7,
      "createdAt": "2026-11-17T03:12:45.000Z"
    }
  ]
}
```

`jenis`: `geser`, `ubah_kapasitas`, `ubah_drying`, `ubah_kapasitas_drying`, `selesaikan_bentrok`. `mode` hanya terisi untuk ubah parameter.

Untuk `selesaikan_bentrok`, isi `nilai_lama` = `{ bentrok: [...] }` (ringkasan bentrok sebelum), `nilai_baru` = `{ diselesaikan: [...], belum_terselesaikan: [...] }`, dan `tahapan_ikut` berisi semua tahapan yang berubah (dengan `peran` `diubah` / `ikut`).

Riwayat **tidak dihapus** saat calculate ulang.

### 4.8 Endpoint lama: `PUT /ppic/jadwalProduksi/:id`

Endpoint lama ini menggeser satu slot per jam tanpa cek bentrok dan drying. **Ganti semua pemakaiannya dengan `simulate` + `apply`.** Endpoint ini akan dihapus setelah frontend pindah.

### 4.9 Master mesin: `allow_concurrent`

`POST` (create) dan `PUT` (update) master mesin tahapan menerima field baru:

```json
{ "allow_concurrent": true }
```

| Nilai | Arti |
|---|---|
| `false` (default) | Mesin hanya bisa dipakai 1 JO per jam, dicek bentrok |
| `true` | Mesin boleh dipakai beberapa JO di jam yang sama (tidak dicek bentrok) |

Tambahkan switch **"Boleh dipakai bersamaan"** di form master mesin. Di update, `false` juga harus bisa dikirim.

### 4.10 Cek bentrok

`GET /ppic/jadwalProduksi/conflicts/:id` (`:id` = id tiket)

Daftar jam tahapan tiket ini yang memakai mesin yang sudah dipakai jadwal resmi lain. Panggil saat membuka tiket yang sudah di-calculate, dan setelah setiap perubahan jadwal, karena jadwal resmi bisa berubah kapan saja oleh tiket lain.

Response `200`:

```json
{
  "data": {
    "id_tiket_jadwal_produksi": 160,
    "ada_bentrok": true,
    "per_tahapan": [
      { "id_tahapan": 1201, "tahapan": "Cetak 1", "mesin": "SM", "jumlah_jam": 3, "no_jo": ["JO-0012"] }
    ],
    "conflicts": [
      { "rule": "R1", "id_tahapan": 1201, "tahapan": "Cetak 1", "mesin": "SM", "waktu": "2026-06-10 21:00", "no_jo": "JO-0012", "no_booking": null, "tahapan_lain": "Cetak 1", "msg": "Mesin SM sudah dipakai JO-0012 (Cetak 1) pada 2026-06-10 21:00" }
    ]
  }
}
```

Error sama seperti endpoint lain: `400` kalau tiket sudah di-submit, `409` kalau tiket versi lama.

### 4.11 Selesaikan semua bentrok otomatis: preview

`POST /ppic/jadwalProduksi/resolveConflicts/:id` (`:id` = id tiket)

Body (opsional): `{ "is_lembur": false }`

Tidak menyimpan apa pun. Backend memproses tahapan yang bentrok satu per satu, **mulai dari yang paling dekat ke FG**. Setiap tahapan dipindah ke jam valid terdekat (sama seperti `suggestSlot`: arah lebih cepat didahulukan, antara waktu sekarang dan tanggal kirim). Tahapan yang wajib ikut bergeser ikut dirapatkan.

Response `200`:

```json
{
  "data": {
    "valid": false,
    "bisa_disimpan": true,
    "tgl_kirim": "2026-11-24",
    "tgl_target_fg": "2026-11-21",
    "bentrok_awal": [
      { "id_tahapan": 1201, "tahapan": "Cetak 1", "mesin": "SM", "jumlah_jam": 3, "no_jo": ["JO-0012"] },
      { "id_tahapan": 1203, "tahapan": "Lem", "mesin": "JK 650", "jumlah_jam": 2, "no_jo": ["JO-0020"] }
    ],
    "diselesaikan": [
      { "id_tahapan": 1201, "tahapan": "Cetak 1", "mesin": "SM", "dari": "2026-11-19 10:00", "ke": "2026-11-18 14:00", "geser_jam": -20 }
    ],
    "belum_terselesaikan": [
      { "id_tahapan": 1203, "tahapan": "Lem", "mesin": "JK 650", "jumlah_jam": 2, "no_jo": ["JO-0020"] }
    ],
    "tahapan": [
      { "id": 1200, "tahapan": "Potong", "peran": "ikut", "geser_jam": -20, "lama": { "...": "..." }, "baru": { "...": "..." } },
      { "id": 1201, "tahapan": "Cetak 1", "peran": "diubah", "geser_jam": -20, "lama": { "...": "..." }, "baru": { "...": "..." } }
    ],
    "conflicts": [
      { "rule": "R1", "id_tahapan": 1203, "tahapan": "Lem", "msg": "Mesin JK 650 sudah dipakai JO-0020 (...) pada ..." }
    ],
    "warnings": []
  }
}
```

| Field | Arti |
|---|---|
| `valid` | Semua bentrok selesai dan tidak ada pelanggaran lain |
| `bisa_disimpan` | Minimal satu bentrok bisa diselesaikan dan tidak ada pelanggaran R4/R5. Boleh disimpan walau sebagian bentrok belum selesai. |
| `bentrok_awal` | Ringkasan bentrok sebelum diselesaikan |
| `diselesaikan` | Tahapan yang dipindah otomatis, dengan jam lama → baru dan selisih jam |
| `belum_terselesaikan` | Tahapan yang tetap bentrok (tidak ada jam valid). Harus ditangani manual. |
| `tahapan` | Sama seperti `simulate` (`peran`: `diubah` = dipindah karena bentrok, `ikut` = ikut bergeser, `tetap`). Tidak ada ceklis di sini. |

### 4.12 Selesaikan semua bentrok otomatis: simpan

`PUT /ppic/jadwalProduksi/resolveConflicts/:id`

Body:

```json
{ "alasan": "Menyelesaikan bentrok setelah calculate", "is_lembur": false }
```

- `alasan` wajib (`400` kalau kosong).
- Backend **menghitung ulang** di dalam transaction. Kalau jadwal resmi lain berubah sejak preview, hasilnya bisa sedikit berbeda dari preview. Hasil yang benar-benar disimpan dikembalikan di response.

Response `200`:

```json
{ "msg": "Bentrok jadwal diselesaikan", "data": { "valid": true, "bisa_disimpan": true, "diselesaikan": [], "belum_terselesaikan": [], "tahapan": [] } }
```

Response `409` (field hasil di level atas):

```json
{ "msg": "Tidak ada bentrok yang bisa diselesaikan otomatis", "valid": false, "bisa_disimpan": false, "belum_terselesaikan": [] }
```

---

## 5. Alur Layar

### 5.1 Timeline tiket

Satu baris per tahapan. Sumber data: detail tiket (bagian 3).

```
             Sel 18             | Rab 19                 | Kam 20        | Jum 21 (FG) | Sab 22 | Sen 24
             08  12  16  20     | 08  10  12  14  16  20 | 08  12  16    |             |        | kirim
Plate        ████████████       |                        |               :             :        :
Potong                          | ██                     |               :             :        :
Cetak 1                         |   ▓▓▓██████░░░░        |               :             :        :
Pond                            |                        | ████          :             :        :
Lem                             |                        |     ████      :             :        :
FG                                                                       ◆ target FG   :        ◆ kirim
                                                                         |<-------- spare ------>|

██ produksi   ░░ drying (data, bukan jam mesin)   ▓▓ jam mesin dipakai JO lain
```

- Bar produksi: `produksi_mulai` → `produksi_selesai`. Untuk tahapan per jam boleh digambar per slot (`jadwal_per_jam`), karena slotnya bisa terputus oleh jam istirahat atau di luar shift.
- Bar drying (arsir): `drying_mulai` → `drying_selesai`, tooltip "Drying X jam".
- Grup tgl: anggota grup punya rentang yang sama. Boleh digabung visualnya atau diberi penanda grup.
- Area **spare** (target FG sampai tanggal kirim) diberi warna latar sendiri.
- Tahapan dengan `is_diubah_manual: true` diberi ikon "diubah manual".
- FG: penanda di tanggal FG.

### 5.2 Geser jadwal

```
[drag / klik bar] -> GET availability -> tampilkan zona
       |
[lepas / pilih jam] -> POST simulate (tanpa ikut) -> panel preview
       |
[ubah ceklis] -> POST simulate (dengan ikut) -> panel preview
       |
  valid? -- tidak --> [Cari jam kosong terdekat] -> POST suggestSlot -> preview
       |
      ya -> [Simpan + alasan] -> PUT apply -> 200: reload | 409: tampilkan konflik, reload availability
```

1. User mulai drag bar tahapan (atau klik → menu **Geser jadwal**). Tahapan FG tidak bisa di-drag.
2. Panggil `availability` untuk tahapan itu. Warnai background baris tahapan:
   - latar per jam pakai `status`;
   - saat drag, sorot jam mulai sesuai `zona` (hijau / kuning / merah).
3. User lepas bar, atau isi jam mulai lewat date-time picker. Snap ke jam penuh (menit = 00).
4. Panggil `simulate` dengan `jenis: "geser"` dan `new_start`, **tanpa** `ikut`.
5. Tampilkan **panel preview** (5.4).
6. User boleh mengubah ceklis. Setiap perubahan → panggil `simulate` lagi dengan `ikut` baru.
7. Kalau `valid: false` → tampilkan `conflicts`, tombol **Simpan** nonaktif, tampilkan tombol **Cari jam kosong terdekat** (memanggil `suggestSlot` dengan `around` = jam yang dipilih user).
8. Kalau `valid: true` → tombol **Simpan** aktif. Klik → minta **alasan** (wajib) → `apply`.
9. `200` → tutup panel, muat ulang detail tiket dan timeline.
10. `409` → tampilkan `conflicts` dari response, muat ulang availability, panel tetap terbuka.

Selama simulasi berjalan, timeline boleh menampilkan posisi `baru` sebagai bayangan (ghost bar) di atas posisi `lama`.

### 5.3 Ubah kapasitas / drying

1. Di detail tahapan (atau menu klik kanan bar), tombol **Ubah kapasitas / drying**. Tidak ada untuk FG.
2. Form:
   - **Kapasitas per jam** (angka, > 0). Sembunyikan untuk tahapan tgl (`from = "tgl"`).
   - **Drying time (jam)** (bilangan bulat, ≥ 0).
   - **Mode**: radio
     - **A. Jam mulai tetap** (default): "Tahapan sesudahnya ikut mundur kalau perlu."
     - **B. Jam selesai tetap**: "Tahapan ini dan tahapan sebelumnya maju kalau perlu."
   - Tampilkan nilai sekarang di samping input.
3. Setiap input berubah (pakai debounce ±400 ms) → `simulate` dengan `jenis: "ubah_parameter"`. Kirim hanya field yang diubah.
4. Panel preview sama dengan 5.4, ditambah ringkasan `parameter` (kapasitas, drying, durasi jam lama → baru).
5. Simpan → `apply` dengan body yang sama + `ikut` + `alasan`.

### 5.4 Panel preview

| Kolom | Isi |
|---|---|
| Ceklis | Checkbox. Tidak ada untuk tahapan `diubah` dan FG. `checked = dicentang`, `disabled = !bisa_dicentang`. |
| Tahapan | Nama + badge **Wajib** kalau `wajib_ikut`, badge **Diubah** kalau `peran = "diubah"`, penanda grup kalau `grup_tgl` tidak `null` |
| Mesin | `mesin` |
| Jadwal lama | `lama.mulai` – `lama.selesai` |
| Jadwal baru | `baru.mulai` – `baru.selesai` (tebalkan kalau berubah) |
| Drying baru | `baru.drying_mulai` – `baru.drying_selesai` (kalau drying > 0) |

Di bawah tabel:

- **Konflik** (merah): `conflicts[].msg`
- **Peringatan** (kuning): `warnings[].msg`. Untuk R6 tampilkan juga sisa spare.
- Ringkasan: tanggal kirim, target FG, tanggal FG baru (baris FG `baru.mulai`).
- Tombol **Cari jam kosong terdekat** (hanya untuk geser, saat tidak valid), **Batal**, **Simpan** (aktif hanya kalau `valid`).

Logika ceklis:

```js
// rows = data.tahapan dari simulate terakhir
function toggle(row, checked) {
  const ids = new Set(rows.filter((r) => r.dicentang).map((r) => r.id));
  const targets =
    row.grup_tgl !== null ? rows.filter((r) => r.grup_tgl === row.grup_tgl) : [row];
  targets.forEach((r) => (checked ? ids.add(r.id) : ids.delete(r.id)));
  return simulate({ ...lastBody, ikut: [...ids] });
}
```

### 5.5 Submit tiket

- Nonaktifkan **Submit** selama panel preview punya konflik yang belum diselesaikan.
- Tangani `409` dari submit (4.2): tampilkan daftar konflik, lalu arahkan ke tahapan yang bentrok.

### 5.6 Calculate ulang

Kalau ada tahapan dengan `is_diubah_manual: true`, tampilkan konfirmasi sebelum calculate:

> "Calculate ulang akan menyusun ulang semua jadwal dari awal. Semua perubahan manual akan hilang. Lanjutkan?"

### 5.7 Riwayat perubahan

Di detail tiket, tab **Riwayat perubahan jadwal** dari `adjustLog`: waktu (`createdAt`), jenis, tahapan, lama → baru, tahapan yang ikut, alasan, user.

### 5.8 Bentrok setelah calculate

Calculate tidak lagi memindahkan jadwal secara diam-diam saat mesin sudah terpakai. Bentroknya ditampilkan, lalu PPIC yang memutuskan.

**Kapan dicek:**

- setelah calculate: pakai `data.conflicts` dari response;
- saat membuka tiket yang sudah di-calculate, dan setelah setiap simpan perubahan: panggil `GET conflicts/:id` (4.10).

**Tampilan:**

- Banner di atas timeline: *"3 tahapan bentrok dengan jadwal mesin lain"*, dengan daftar dari `per_tahapan` (tahapan, mesin, jumlah jam, JO yang bentrok).
- Di timeline, slot yang bentrok diberi warna merah, dengan tooltip `msg`.
- Tombol di banner: **Selesaikan semua otomatis**.
- Di setiap tahapan yang bentrok: tombol **Cari jam kosong terdekat**. Tombol ini memanggil `suggestSlot` lalu membuka panel preview (5.4), dan disimpan lewat `apply`.

**Alur "Selesaikan semua otomatis":**

```text
[Selesaikan semua otomatis] -> POST resolveConflicts/:id -> modal preview
        |
  bisa_disimpan? -- tidak --> pesan "Tidak ada bentrok yang bisa diselesaikan otomatis",
        |                     arahkan ke penyelesaian manual per tahapan
       ya
        |
 [Simpan + alasan] -> PUT resolveConflicts/:id -> 200: reload tiket + cek bentrok lagi
                                               -> 409: tampilkan pesan, reload preview
```

Isi modal preview:

| Bagian | Isi |
|---|---|
| Ringkasan | "X dari Y tahapan bentrok bisa diselesaikan" (`diselesaikan.length` / `bentrok_awal.length`) |
| Tabel diselesaikan | Tahapan, mesin, jam lama (`dari`), jam baru (`ke`), selisih (`geser_jam`, tampilkan "maju 20 jam" / "mundur 6 jam") |
| Tabel semua perubahan | Dari `tahapan` dengan `peran` bukan `tetap`: lama → baru, `geser_jam`. Tandai yang `ikut`. |
| Belum terselesaikan | Dari `belum_terselesaikan`, merah: "Perlu diselesaikan manual" |
| Peringatan | `warnings[].msg` (spare, lembur, draft) |

Tampilkan `geser_jam` dengan jelas, terutama kalau besar (misalnya lebih dari 24 jam). Dengan begitu PPIC tahu seberapa jauh jadwal bergeser sebelum menyimpan.

Setelah disimpan, sisa bentrok (kalau ada) diselesaikan per tahapan dengan **Cari jam kosong terdekat**, geser manual, lembur, atau pindah mesin. Submit tetap ditolak selama masih ada bentrok (4.2).

---

## 6. Contoh Kode (axios)

```js
const api = axios.create({ baseURL: API_URL, withCredentials: true });

const availability = (idTahapan, params) =>
  api.get(`/ppic/jadwalProduksi/availability/${idTahapan}`, { params }).then((r) => r.data.data);

const simulate = (idTahapan, body) =>
  api.post(`/ppic/jadwalProduksi/simulate/${idTahapan}`, body).then((r) => r.data.data);

const suggestSlot = (idTahapan, body) =>
  api.post(`/ppic/jadwalProduksi/suggestSlot/${idTahapan}`, body).then((r) => r.data.data);

async function applyChange(idTahapan, body) {
  try {
    const r = await api.put(`/ppic/jadwalProduksi/apply/${idTahapan}`, body);
    return { ok: true, result: r.data.data };
  } catch (e) {
    if (e.response && e.response.status === 409) {
      // field hasil simulasi ada di level atas response
      return { ok: false, result: e.response.data };
    }
    throw e;
  }
}

const adjustLog = (idTiket) =>
  api.get(`/ppic/jadwalProduksi/adjustLog/${idTiket}`).then((r) => r.data.data);

const getConflicts = (idTiket) =>
  api.get(`/ppic/jadwalProduksi/conflicts/${idTiket}`).then((r) => r.data.data);

const resolvePreview = (idTiket) =>
  api.post(`/ppic/jadwalProduksi/resolveConflicts/${idTiket}`, {}).then((r) => r.data.data);

async function resolveApply(idTiket, alasan) {
  try {
    const r = await api.put(`/ppic/jadwalProduksi/resolveConflicts/${idTiket}`, { alasan });
    return { ok: true, result: r.data.data };
  } catch (e) {
    if (e.response && e.response.status === 409) return { ok: false, result: e.response.data };
    throw e;
  }
}

// contoh alur geser
async function onDrop(idTahapan, newStart) {
  const lastBody = { jenis: "geser", new_start: newStart };
  const preview = await simulate(idTahapan, lastBody); // tanpa ikut
  showPreview(preview, lastBody);
}

async function onSave(idTahapan, lastBody, preview, alasan) {
  const ikut = preview.tahapan.filter((t) => t.dicentang).map((t) => t.id);
  const res = await applyChange(idTahapan, { ...lastBody, ikut, alasan });
  if (res.ok) reloadTiket();
  else showConflicts(res.result.conflicts);
}
```

Format `new_start` dari `Date` lokal:

```js
const pad = (n) => String(n).padStart(2, "0");
const toApi = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`;
```

---

## 7. Checklist Implementasi

- [ ] Timeline: bar produksi, bar drying, area spare, penanda FG dan tanggal kirim, ikon diubah manual
- [ ] Sembunyikan fitur ubah jadwal untuk tiket yang bukan `calculated` + `incoming`
- [ ] Tangani `409` "versi lama" dengan tombol calculate ulang
- [ ] Drag bar + availability (status + zona), snap ke jam penuh
- [ ] Date-time picker sebagai alternatif drag
- [ ] Panel preview: ceklis (wajib, bisa dicentang, grup tgl), lama vs baru, konflik, peringatan
- [ ] Simulasi ulang setiap ceklis berubah (dengan `ikut`)
- [ ] Tombol cari jam kosong terdekat (`suggestSlot`)
- [ ] Form ubah kapasitas / drying + mode A/B + debounce
- [ ] Simpan dengan alasan wajib (`apply`), tangani `409`
- [ ] Konfirmasi calculate ulang kalau ada perubahan manual
- [ ] Tangani `409` dari submit
- [ ] Tab riwayat perubahan (`adjustLog`), termasuk jenis `selesaikan_bentrok`
- [ ] Banner bentrok setelah calculate (`data.conflicts`) dan saat membuka tiket (`conflicts/:id`)
- [ ] Slot bentrok merah di timeline + tombol cari jam kosong per tahapan
- [ ] Tombol "Selesaikan semua otomatis": preview (`POST resolveConflicts`) + simpan dengan alasan (`PUT resolveConflicts`)
- [ ] Switch `allow_concurrent` di form master mesin
- [ ] Hapus pemakaian `PUT /ppic/jadwalProduksi/:id`
- [ ] Semua request endpoint baru memakai `withCredentials: true`

---

## 8. Pertanyaan Umum

**Kenapa geser lebih lambat sering ditolak?**
Hasil calculate sudah rapat sampai target FG. Geser lebih lambat hanya bisa sejauh spare (2 hari kerja sampai tanggal kirim). Cara yang realistis: geser lebih cepat, pakai lembur, atau ajukan perubahan tanggal kirim.

**Kenapa tahapan yang saya centang tidak bergeser?**
Tahapan yang dicentang dirapatkan ke tahapan di sebelahnya. Kalau posisinya sudah rapat, hasilnya sama dengan posisi lama.

**Kenapa ceklis sebuah tahapan tidak bisa diklik?**
Hanya tahapan yang bersebelahan dengan rangkaian yang bergeser yang bisa dicentang. Centang dulu tahapan di antaranya.

**Kenapa beberapa tahapan selalu bergeser bersama?**
Tahapan tgl yang berurutan (misalnya Plate lalu tahapan lain yang mesinnya tidak ada di master) menjadi satu grup (`grup_tgl` sama) dan berbagi rentang tanggal, jadi selalu bergeser bersama.

**Kenapa calculate tidak langsung menghindari jam yang bentrok?**
Supaya jadwal tidak bergeser jauh tanpa diketahui. Contohnya kalau mesin penuh seminggu, pencarian otomatis bisa memajukan tahapan lebih dari seminggu. Sekarang bentrok ditampilkan, dan setiap pergeseran terlihat di preview (`geser_jam`) sebelum disimpan.

**"Selesaikan semua otomatis" tidak menyelesaikan semua tahapan, kenapa?**
Untuk tahapan di `belum_terselesaikan`, tidak ada jam valid antara waktu sekarang dan tanggal kirim (dimajukan jatuh di masa lalu, dimundurkan melewati tanggal kirim). Selesaikan manual: lembur, pindah mesin, atau ajukan perubahan tanggal kirim.

**Jam mulai yang saya pilih berubah sedikit di preview, kenapa?**
Kalau jam yang dipilih bukan jam kerja (istirahat, di luar shift, libur), tahapan mulai di jam kerja berikutnya.
