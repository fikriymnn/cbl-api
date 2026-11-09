# Flow NCR dan CAPA

Dokumen ini untuk tim frontend. Isinya alur tiket, aturan terbentuknya NCR dan CAPA, endpoint, payload, dan aturan tampilan yang perlu diikuti.

---

## 1. Konsep Singkat

| | NCR (Non-Conformance Report) | CAPA (Corrective and Preventive Action) |
|---|---|---|
| Tujuan | Mencatat ketidaksesuaian | Mencatat penyebab, perbaikan, dan pencegahannya |
| Dibuat oleh | Otomatis dari modul lain, atau manual | Otomatis dari NCR, tidak ada input manual |
| Isi | Header + department + poin ketidaksesuaian | Header per department + poin ketidaksesuaian |
| Pemeriksa | QA lalu MR (kecuali tipe `frekuensi`) | Department mengisi, lalu QA dan MR memverifikasi |
| Nomor | `NCR-0001/CBL/1126` | `CAPA-0001/CBL/1126` |

Alur besarnya:

```
[Sumber: inspeksi, kendala LKH, maintenance, manual]
                     │
                     ▼
                [NCR terbentuk]
          │                         │
   tipe frekuensi            qty / waktu / manual
          │                         │
          ▼                         ▼
   [Melewati batas?]         [Validasi QA] ──tidak sesuai──► di tolak qa (history)
     │ belum  │ ya                  │ sesuai
     ▼        │                     ▼
  tercatat    │              [Validasi MR] ──tidak sesuai──► di tolak mr (history)
 (tanpa CAPA) │                     │ sesuai
              ▼                     ▼
     [CAPA dibuat, satu tiket per department]
                     │
                     ▼
     [Department mengisi analisa dan perbaikan]  ◄────────┐
                     │                                    │
                     ▼                                    │ tidak sesuai
              [Verifikasi QA] ────────────────────────────┤ (di tolak qa / di tolak mr)
                     │ sesuai                             │
                     ▼                                    │
              [Verifikasi MR] ────────────────────────────┘
                     │ sesuai
                     ▼
              di teruskan (history)
```

---

## 2. Sumber dan Tipe NCR

Tipe tersimpan di `tipe_ncr` dan bisa dipakai sebagai filter.

| `tipe_ncr` | Sumber | Syarat NCR terbentuk | Batas diambil dari |
|---|---|---|---|
| `qty` | Selesai inspeksi Cetak, Coating, Pond, Lem, Rabut, Ampar Lem | `defect / pcs x 100 >= persen_kriteria`, dihitung per kode masalah, dan sumber masalah bukan `Mesin` | `id_kriteria_qty_produksi` di master kode produksi, dibaca backend saat inspeksi selesai |
| `frekuensi` | QC memvalidasi tiket Kendala LKH atau Maintenance | Selalu terbentuk di setiap validasi. Batas hanya menentukan apakah CAPA dibuat (lihat bagian 3) | `id_kriteria_frekuensi_produksi` di master kode produksi |
| `waktu` | Analisis Maintenance selesai (bukan rework), atau tiket Kendala LKH ditutup | Durasi pengerjaan (menit) melebihi batas | `id_kriteria_waktu_produksi` di master kode produksi |
| `manual` | `POST /ncr` | Tanpa syarat | – |

Catatan:

- `kategori_laporan` berbeda dari tipe. Untuk `qty` isinya sumber masalah, untuk `frekuensi` dan `waktu` isinya jenis kendala, dan untuk `manual` isinya dari input user.
- NCR `frekuensi` tidak melewati validasi QA dan MR.
- Defect bersumber `Mesin` pada inspeksi belum menghasilkan tiket apa pun.
- Pada tiket Kendala LKH dan Maintenance, batas disalin saat tiket dibuat. Perubahan master hanya berlaku untuk tiket baru.

---

## 3. Syarat Menjadi CAPA

| Tipe NCR | Syarat |
|---|---|
| `frekuensi`, batas terlewati | Langsung dibuat saat NCR terbentuk, tanpa validasi QA dan MR. Status NCR `di teruskan ke capa`. Batas terlewati jika jumlah tiket tervalidasi dengan kode yang sama pada bulan berjalan, ditambah tiket ini, lebih besar dari batas. |
| `frekuensi`, batas belum terlewati | **Tidak dibuat.** NCR hanya tercatat dengan status `tercatat`. |
| `qty`, `waktu`, `manual` | QA memvalidasi `sesuai`, lalu MR memvalidasi `sesuai`. |

Berlaku untuk semua tipe:

- NCR harus punya minimal satu department. Tiap department menjadi **satu tiket CAPA**, dengan poin ketidaksesuaiannya masing-masing.
- CAPA menyimpan `id_ncr`, jadi NCR asalnya bisa diambil lewat `GET /ncr/:id`.

> Pada NCR `frekuensi`, relasi `qa` dan `mr` bernilai `null`. Pastikan tampilan tidak error.

---

## 4. Autentikasi dan Format Response

Semua endpoint NCR dan CAPA wajib login, memakai cookie `access_token`. Pastikan request mengirim cookie (`withCredentials: true` atau yang setara).

| Kondisi | HTTP | Body |
|---|---|---|
| Belum login | 500 | `{ "msg": "pliss login" }` |
| Token tidak valid | 403 | `{ "status_code": 403, "message": "Access token invalid." }` |
| Validasi atau status tidak sesuai | 400 | `{ "msg": "..." }` |
| Error server | 500 | `{ "msg": "..." }` |
| Create atau update berhasil | 201 | `{ "msg": "create success" }` atau `{ "msg": "update success" }` |

---

## 5. NCR

### 5.1 Status dan Tiket

| Aksi | Endpoint | `status` hasil | `bagian_tiket` hasil |
|---|---|---|---|
| Create | `POST /ncr` atau otomatis | `menunggu validasi qa` | `incoming` |
| QA sesuai | `PUT /ncr/validasiQa/:id` | `menunggu validasi mr` | `incoming` |
| QA tidak sesuai | `PUT /ncr/validasiQa/:id` | `di tolak qa` | `history` |
| MR sesuai | `PUT /ncr/validasiMr/:id` | `di teruskan ke capa` | `history` |
| MR tidak sesuai | `PUT /ncr/validasiMr/:id` | `di tolak mr` | `history` |
| Otomatis tipe `frekuensi`, batas terlewati | – | `di teruskan ke capa` | `history` |
| Otomatis tipe `frekuensi`, batas belum terlewati | – | `tercatat` | `history` |

Tombol yang ditampilkan:

- `menunggu validasi qa` → **Sesuai** / **Tidak Sesuai** untuk QA
- `menunggu validasi mr` → **Sesuai** / **Tidak Sesuai** untuk MR
- Status lain → hanya lihat

Backend menolak validasi yang tidak sesuai tahapnya dengan HTTP 400. Tampilkan `msg` ke user lalu muat ulang data.

### 5.2 List dan Detail

`GET /ncr/:id?`

| Param | Keterangan |
|---|---|
| `page` + `limit` | Pagination. **Harus dikirim berpasangan.** |
| `status` | Filter status |
| `bagian_tiket` | `incoming` atau `history` |
| `tipe_ncr` | `frekuensi`, `qty`, `waktu`, atau `manual` |
| `tanggal` | Format `YYYY-MM-DD`, mencakup satu hari penuh |
| `id_user` | Filter `id_pelapor` |
| `id_pelapor_p1` | Filter `id_pelapor_p1` |

> Jangan memakai filter `department` pada `GET /ncr`. Tabel `ncr_tiket` tidak punya kolom itu, jadi request akan error 500.

Bentuk response:

| Request | Response | Relasi |
|---|---|---|
| Dengan `page` + `limit` | `data` + `total_page` | Lengkap |
| Dengan filter, tanpa pagination | `data` + `total_page: null` | Lengkap |
| `:id` tanpa query | `data` berupa satu object | Lengkap |
| Tanpa apa pun | `data` | **Tidak ada relasi** |

Kalau `:id` dikirim bersama filter atau pagination, `:id` diabaikan. Untuk detail, panggil `:id` tanpa query.

Relasi lengkap: `pelapor`, `qa`, `mr`, dan `data_department[].data_ketidaksesuaian`.

```json
{
  "data": {
    "id": 12,
    "no_ncr": "NCR-0001/CBL/1126",
    "tipe_ncr": "qty",
    "kategori_laporan": "man",
    "status": "menunggu validasi qa",
    "bagian_tiket": "incoming",
    "tanggal": "2026-11-09T02:15:00.000Z",
    "id_jo": 100,
    "id_io": 55,
    "no_jo": "JO-001",
    "no_io": "IO-001",
    "nama_produk": "Box A",
    "qty_defect": 25,
    "nama_pelapor": "Nama QC",
    "department_pelapor": "QUALITY CONTROL",
    "catatan_qa": null,
    "catatan_mr": null,
    "pelapor": {},
    "qa": null,
    "mr": null,
    "data_department": [
      {
        "id": 30,
        "id_department": 2,
        "department": "HRD",
        "data_ketidaksesuaian": [
          { "id": 40, "ketidaksesuaian": "Isi temuan", "file": null }
        ]
      }
    ]
  }
}
```

### 5.3 Create Manual

`POST /ncr`

```json
{
  "kategori_laporan": "Material",
  "id_pelapor": 5,
  "id_pelapor_p1": 6,
  "nama_pelapor": "Nama Pelapor",
  "department_pelapor": "QUALITY CONTROL",
  "no_jo": "JO-001",
  "no_io": "IO-001",
  "nama_produk": "Box A",
  "data_department": [
    {
      "id_department": 2,
      "department": "HRD",
      "ketidaksesuaian": [
        { "ketidaksesuaian": "Isi temuan" }
      ]
    }
  ]
}
```

- `no_ncr`, `tanggal`, `status`, `tipe_ncr`, `id_jo`, dan `id_io` diisi otomatis. Jangan dikirim.
- `id_jo` dan `id_io` dicari dari `no_jo` dan `no_io`, dan bernilai `null` jika nomornya tidak ditemukan.
- `data_department` wajib berupa array. Isi minimal satu department, kalau tidak NCR tidak akan menghasilkan CAPA.
- `file` tidak disimpan saat create. Lampiran dikirim lewat update.

### 5.4 Update

`PUT /ncr/:id`

```json
{
  "kategori_laporan": "Material",
  "no_jo": "JO-001",
  "no_io": "IO-001",
  "nama_produk": "Box A",
  "data_department": [
    {
      "id": 30,
      "id_department": 2,
      "department": "HRD",
      "data_ketidaksesuaian": [
        { "id": 40, "ketidaksesuaian": "Isi temuan", "file": "nama-file.jpg" }
      ]
    }
  ]
}
```

- Nama field berbeda dari create: `ketidaksesuaian` menjadi `data_ketidaksesuaian`, dan tiap baris wajib punya `id`.
- `data_department` **wajib dikirim**, minimal `[]`. Kalau tidak, API membalas 500 setelah data header terlanjur berubah.
- Endpoint ini hanya mengubah baris yang sudah ada, tidak menambah atau menghapus.
- **Jangan mengirim `status`.** Perubahan status hanya lewat endpoint validasi.

Untuk mengubah nama department saja: `PUT /ncr/department/:id` dengan body `{ "department": "HRD" }`.

### 5.5 Validasi QA dan MR

| Aksi | Endpoint | Body |
|---|---|---|
| Validasi QA | `PUT /ncr/validasiQa/:id` | `{ "status": "sesuai", "catatan_qa": "..." }` |
| Validasi MR | `PUT /ncr/validasiMr/:id` | `{ "status": "sesuai", "catatan_mr": "..." }` |

- Nilai selain `sesuai` dianggap menolak. Gunakan `tidak sesuai`.
- `catatan_qa` dan `catatan_mr` opsional, maksimal 255 karakter.
- User penilai diambil dari token.

| Kondisi | HTTP | Pesan |
|---|---|---|
| Status tiket bukan tahap QA | 400 | `tiket tidak dalam status menunggu validasi qa` |
| Status tiket bukan tahap MR | 400 | `tiket tidak dalam status menunggu validasi mr` |

---

## 6. CAPA

### 6.1 Status dan Tiket

| Aksi | Endpoint | `status` hasil | `bagian_tiket` hasil |
|---|---|---|---|
| Terbentuk dari NCR | otomatis | `incoming` | `incoming` |
| Department submit | `POST /capa/submit/:id` | `menunggu verifikasi qa` | tetap |
| QA sesuai | `PUT /capa/verifikasiQa/:id` | `menunggu verifikasi mr` | `incoming` |
| QA tidak sesuai | `PUT /capa/verifikasiQa/:id` | `di tolak qa` | `incoming` |
| MR sesuai | `PUT /capa/verifikasiMr/:id` | `di teruskan` | `history` |
| MR tidak sesuai | `PUT /capa/verifikasiMr/:id` | `di tolak mr` | `incoming` |

> Backend **belum memvalidasi** status saat transisi CAPA. FE wajib menampilkan tombol sesuai status:
> - `incoming` / `di tolak qa` / `di tolak mr` → form isian dan tombol **Submit** untuk department
> - `menunggu verifikasi qa` → **Sesuai** / **Tidak Sesuai** untuk QA
> - `menunggu verifikasi mr` → **Sesuai** / **Tidak Sesuai** untuk MR
> - `di teruskan` → hanya lihat

Saat tiket ditolak, tampilkan `catatan_verifikasi_qa` atau `catatan_verifikasi_mr` agar department tahu yang harus diperbaiki.

### 6.2 List dan Detail

`GET /capa/:id?`

| Param | Keterangan |
|---|---|
| `page` + `limit` | Pagination. **Harus dikirim berpasangan.** |
| `status` | Filter status |
| `statusNotEqual` | Kecualikan satu status. Menggantikan `status` jika dikirim bersamaan |
| `bagian_tiket` | `incoming` atau `history` |
| `tanggal` | Format `YYYY-MM-DD`, mencakup satu hari penuh |
| `department` | Nama department |
| `id_department` | ID department |

Bentuk response sama dengan NCR. Relasi lengkap: `pelapor`, `qa`, `mr`, `data_ketidaksesuaian`. Request tanpa filter, pagination, dan `:id` hanya menyertakan `pelapor`.

```json
{
  "data": {
    "id": 21,
    "id_ncr": 12,
    "no_capa": "CAPA-0001/CBL/1126",
    "status": "incoming",
    "bagian_tiket": "incoming",
    "id_department": 2,
    "department": "HRD",
    "nama_pelapor": "Nama QC",
    "tanggal_lapor": "2026-11-09T02:15:00.000Z",
    "tanggal": "2026-11-09T05:00:00.000Z",
    "kategori_laporan": "man",
    "id_jo": 100,
    "id_io": 55,
    "no_jo": "JO-001",
    "no_io": "IO-001",
    "nama_produk": "Box A",
    "nama_inspektor": null,
    "catatan_qa": null,
    "catatan_mr": null,
    "catatan_verifikasi_qa": null,
    "catatan_verifikasi_mr": null,
    "data_ketidaksesuaian": [
      {
        "id": 70,
        "ketidaksesuaian": "Isi temuan",
        "file": null,
        "analisa_penyebab": null,
        "tindakan_perbaikan": null,
        "pencegahan": null,
        "pencegahan_efektif_dilakukan": null,
        "tanggal_pencegahan_efektif_dilakukan": null,
        "keterangan_ketidak_sesuaian": null
      }
    ]
  }
}
```

### 6.3 Submit oleh Department

`POST /capa/submit/:id`

```json
{
  "nama_inspektor": "Nama Pengisi",
  "data_ketidaksesuaian": [
    {
      "id": 70,
      "analisa_penyebab": "...",
      "tindakan_perbaikan": "...",
      "pencegahan": "...",
      "pencegahan_efektif_dilakukan": "...",
      "tanggal_pencegahan_efektif_dilakukan": "2026-11-20",
      "keterangan_ketidak_sesuaian": "..."
    }
  ]
}
```

- Kirim **semua** poin milik tiket, masing-masing dengan `id`.
- Kirim hanya field di atas, karena backend menyimpan isi tiap poin apa adanya.
- `analisa_penyebab`, `tindakan_perbaikan`, dan `pencegahan` maksimal 255 karakter.

| Field kosong | Pesan (HTTP 400) |
|---|---|
| `analisa_penyebab` | `analisa penyebab wajib di isi` |
| `tindakan_perbaikan` | `tindakan perbaikan wajib di isi` |
| `pencegahan` | `pencegahan wajib di isi` |
| `pencegahan_efektif_dilakukan` | `pencegahan efektif dilakukan wajib di isi` |

Pengecekan backend hanya untuk nilai `null` atau tidak terkirim, jadi string kosong tetap lolos. FE sebaiknya memvalidasi input kosong.

### 6.4 Verifikasi QA dan MR

| Aksi | Endpoint | Body |
|---|---|---|
| Verifikasi QA | `PUT /capa/verifikasiQa/:id` | `{ "status": "sesuai", "catatan_verifikasi_qa": "..." }` |
| Verifikasi MR | `PUT /capa/verifikasiMr/:id` | `{ "status": "sesuai", "catatan_verifikasi_mr": "..." }` |

Nilai selain `sesuai` dianggap menolak. Gunakan `tidak sesuai`.

---

## 7. Tampilan per Menu

Path mengikuti data menu di `seeder/menuSeeder.js`.

| Pengguna | Menu | Data yang diambil |
|---|---|---|
| QA, antrean NCR | `/qc/qms/ncr` | `GET /ncr?status=menunggu validasi qa&page=1&limit=10` |
| QA, antrean CAPA | `/qc/qms/capa` | `GET /capa?status=menunggu verifikasi qa&page=1&limit=10` |
| MR, antrean NCR | `/mr/qms/ncr` | `GET /ncr?status=menunggu validasi mr&page=1&limit=10` |
| MR, antrean CAPA | `/mr/qms/capa` | `GET /capa?status=menunggu verifikasi mr&page=1&limit=10` |
| Department, CAPA masuk | sesuai menu department | `GET /capa?id_department=<id>&bagian_tiket=incoming&page=1&limit=10` |
| Laporan NCR | `/qc/report/ncr`, `/mr/report/ncr`, `/hr/report/ncr`, `/maintenance/report/ncr` | `GET /ncr?bagian_tiket=history&page=1&limit=10` |
| Laporan CAPA | `/qc/report/capa`, `/mr/report/capa`, `/hr/report/capa`, `/maintenance/report/capa` | `GET /capa?bagian_tiket=history&page=1&limit=10` |

Saran kolom tabel NCR: `no_ncr`, `tipe_ncr`, `kategori_laporan`, `tanggal`, `no_jo`, `nama_produk`, `nama_pelapor`, `status`.

Saran kolom tabel CAPA: `no_capa`, `department`, `kategori_laporan`, `tanggal_lapor`, `no_jo`, `nama_produk`, `status`.

Tiket lama bisa memiliki `no_ncr`, `no_capa`, `tipe_ncr`, `id_ncr`, `id_jo`, dan `id_io` bernilai `null`. Tampilkan sebagai `-`.

---

## 8. Master Data

Agar alur otomatis berjalan, isi field berikut pada **Master Kode Produksi** (`/master/produksi/kodeProduksi`).

| Field | Keterangan | Jika kosong |
|---|---|---|
| `proses_produksi`, `kode`, `id_tahapan_produksi` | Wajib saat create | Ditolak |
| `deskripsi` | Nama kendala di tiket dan teks NCR | Teks NCR tidak lengkap |
| `id_kategori_kendala` | Nama kategori yang mengandung kata "mesin" menjadi tiket Maintenance, selain itu Kendala LKH | Tiket tidak dibuat |
| `id_kriteria_frekuensi_produksi` | Batas jumlah tiket per bulan | Batas menjadi 999 |
| `id_kriteria_waktu_produksi` | Batas waktu dalam **menit** | Batas menjadi 999 menit |
| `id_kriteria_qty_produksi` | Batas persentase defect untuk NCR `qty`. `value` dalam persen, 1 berarti 1% | NCR `qty` tidak dibuat untuk kode itu |
| `target_department` | Daftar ID department, contoh `[1, 2]` | NCR tidak menghasilkan CAPA |

Kriteria `_qc` dan `_mtc` belum dipakai oleh alur ini.

Pilihan kriteria berasal dari **Master Kriteria Kendala** (`/master/produksi/kriteriaKendala`). Backend tidak mengecek kecocokan tipe dan bagian kriteria, jadi form sebaiknya memfilter pilihan sesuai `tipe`.

Untuk tipe `qty`, backend membaca kriteria saat inspeksi selesai, mencocokkan kode dan tahapan inspeksinya, lalu menyimpan nilainya ke `persen_kriteria`. `criteria_percent` yang dikirim frontend tidak lagi memengaruhi NCR. Endpoint `GET /master/produksi/wasteAllKendalaFormating` mengembalikan nilai dari master, atau `null` jika kode belum punya kriteria.

---

## 9. Prasyarat Database

Kolom baru berikut harus ada sebelum versi ini berjalan:

```sql
ALTER TABLE ncr_tiket
  ADD COLUMN tipe_ncr VARCHAR(255) NULL,
  ADD COLUMN id_jo INT NULL,
  ADD COLUMN id_io INT NULL;

ALTER TABLE capa_tiket
  ADD COLUMN id_jo INT NULL,
  ADD COLUMN id_io INT NULL;

ALTER TABLE capa_tiket
  ADD COLUMN id_ncr INT NULL,
  ADD CONSTRAINT fk_capa_tiket_ncr FOREIGN KEY (id_ncr)
    REFERENCES ncr_tiket(id) ON DELETE SET NULL ON UPDATE CASCADE;
```

Data master lama yang hanya terisi kriteria `_mtc` perlu disalin ke `_produksi`:

```sql
UPDATE ms_kode_produksi
SET id_kriteria_frekuensi_produksi = COALESCE(id_kriteria_frekuensi_produksi, id_kriteria_frekuensi_mtc),
    id_kriteria_waktu_produksi = COALESCE(id_kriteria_waktu_produksi, id_kriteria_waktu_mtc);
```

---

## 10. Contoh Skenario

**Tipe `qty`, lewat validasi**

1. Inspeksi Pond selesai dengan defect melewati `persen_kriteria`, untuk dua department.
   - NCR `NCR-0001/CBL/1126`, `tipe_ncr: qty`, status `menunggu validasi qa`.
2. QA memvalidasi `sesuai` → `menunggu validasi mr`.
3. MR memvalidasi `sesuai` → `di teruskan ke capa`.
   - Terbentuk `CAPA-0001/CBL/1126` dan `CAPA-0002/CBL/1126`, masing-masing dengan `id_ncr` yang sama.
4. Tiap department submit → `menunggu verifikasi qa`.
5. QA `sesuai` lalu MR `sesuai` → `di teruskan`, tiket masuk history.

**Tipe `frekuensi`, CAPA setelah batas terlewati**

1. Kode kendala punya batas 3 tiket per bulan.
2. Tiket ke-1 sampai ke-3 divalidasi QC.
   - Masing-masing membuat NCR `tipe_ncr: frekuensi` dengan status `tercatat`, tanpa CAPA.
3. Tiket ke-4 divalidasi QC.
   - NCR terbentuk dengan status `di teruskan ke capa`.
   - CAPA langsung terbentuk untuk tiap department dan muncul di antrean department.
4. Tiket ke-5 divalidasi QC → NCR dan CAPA baru terbentuk lagi.
5. Bulan berikutnya hitungan mulai lagi dari awal.
