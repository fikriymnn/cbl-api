# Perencanaan: Geser & Pindah Jadwal Produksi (Jadwal Resmi)

Status: **draft untuk review**. Belum ada kode yang diubah.

Dokumen ini merencanakan ulang cara mengubah jadwal di `jadwal_produksi` (jadwal yang sudah di-submit dari tiket). Perubahan memakai **aturan yang sama dengan calculate / simulate tiket** (lihat `docs/plan-edit-jadwal-produksi.md`), ditambah aturan khusus jadwal resmi.

---

## 1. Ringkasan

Ada 2 operasi:

| | **Geser** (berantai) | **Pindah** |
|---|---|---|
| Tujuan | Ubah jam satu tahapan JO; JO lain yang tertabrak ikut mundur | Pindahkan satu tahapan JO ke jam lain **tanpa menggeser JO lain** |
| Tahapan lain milik JO itu | Ceklis seperti simulate tiket (wajib ikut otomatis + boleh dicentang) | Sama: ceklis seperti simulate tiket |
| JO lain di mesin itu | **Mundur otomatis** kalau tertabrak, seperlunya | **Tidak pernah bergerak**. Kalau tertabrak → ditolak + saran jam kosong |
| Tahapan berikutnya milik JO lain | Ikut mundur otomatis **hanya kalau wajib** (R2/R3) | Tidak ada (JO lain tidak tersentuh) |
| Mesin | Mesin yang sama | Mesin yang sama (pindah ke mesin lain belum termasuk) |
| Alur | Preview → Apply (alasan wajib) → Log | Preview → Apply (alasan wajib) → Log |

Endpoint lama (`update`, `move`, `lembur` di `jadwalProduksiViewController`) tetap ada sampai frontend pindah, lalu di-deprecate.

---

## 2. Masalah di Implementasi Sekarang

| Masalah | Akibat |
|---|---|
| Mesin hitung shift/lembur terpisah (`helper/lemburJadwalProduksiMonlyFunction.js`) dari tiket (`jadwalShiftHelper`) | Hasil jam bisa beda dengan calculate |
| `update` menyusun ulang **semua** jam setelahnya di mesin itu, per jam, berurutan | JO lain terdorong diam-diam; **celah kosong ikut dirapatkan** (JO di belakang bisa maju) |
| `move` hanya menggeser JO itu | Bisa **menumpuk** dengan JO lain (bentrok) |
| Dorongan tidak menjalar ke tahapan berikutnya milik JO yang terdorong | Tahap berikutnya bisa mulai sebelum tahap sebelumnya selesai |
| Jam satu JO bisa **tersela JO lain** | Bug yang dilaporkan: jam JO di satu mesin tidak berurutan |
| Helper membuka transaksi sendiri, controller tidak memakainya | Data setengah tersimpan kalau gagal di tengah |
| Campuran `toISOString()` (UTC) dan waktu lokal | Tanggal bisa mundur 1 hari |
| Tidak ada log / alasan | Tidak bisa ditelusuri |
| Perubahan tidak disinkronkan ke tiket | Data tiket basi |

---

## 3. Aturan

Semua aturan R1–R8 dari calculate tetap berlaku. Ditambah **R9** dan **kunci jam lewat**.

| Kode | Aturan | Jenis | Keterangan |
|---|---|---|---|
| R1 | Bentrok mesin | **Wajib** | Satu jam mesin hanya boleh dipakai satu JO (kecuali mesin `allow_concurrent`) |
| R2 | Urutan dengan tahapan sebelumnya | **Wajib** | `mulai(i) ≥ selesai(i-1) + drying(i-1)` |
| R3 | Urutan dengan tahapan berikutnya | **Wajib** | `selesai(i) + drying(i) ≤ mulai(i+1)` |
| R4 | Tanggal kirim | **Wajib** | Berlaku untuk JO target **dan semua JO lain yang terdorong**. Kalau ada yang lewat → apply ditolak |
| R5 | Tidak di masa lalu | **Wajib** | Lihat 3.1 |
| R6 | Memakai spare | Peringatan | Selesai melewati target FG |
| R7 | Jam lembur | Peringatan | Slot jatuh di jam lembur |
| R8 | Bentrok tiket draft | Peringatan | Bentrok dengan tiket lain yang belum di-submit |
| **R9** | **Jam berurutan (tidak tersela)** | **Wajib** | Lihat 3.2 |

### 3.1 Kunci jam yang sudah lewat

- Slot dengan jam **< waktu sekarang** (dibulatkan ke jam berikutnya) **tidak boleh digeser / dipindah**, dan tidak boleh ada slot baru di masa lalu.
- Tahapan yang **sebagian** jamnya sudah lewat: tahapan itu tidak bisa digeser/dipindah (kunci satu tahapan). Kalau rantai dorongan butuh menggeser tahapan terkunci → ditolak dengan pesan yang menyebut JO & tahapannya.
- Cek ke LKH (tahapan sudah berjalan / done) **belum dipakai** untuk saat ini. Bisa ditambahkan nanti.

### 3.2 R9: jam satu tahapan JO di satu mesin harus berurutan

Selama rentang `mulai`–`selesai` sebuah tahapan JO di satu mesin, **tidak boleh ada slot JO lain** di mesin itu.

- Yang **boleh** menyela hanya jam non-kerja: istirahat, di luar shift, libur.
- Mesin `allow_concurrent` tidak dicek.

```
Valid   : [A 08-12] (istirahat 12-13) [A 13-15]
Tidak   : [A 08-10] [B 10-11] [A 11-14]
```

Penempatan selalu mencari **blok utuh**: jam mulai pertama di mana seluruh `durasi` jam kerja muat tanpa jam JO lain di dalam rentangnya.

R9 juga ditambahkan ke modul tiket (simulate, apply, resolve, submit) supaya data yang tersela tidak masuk ke jadwal resmi.

---

## 4. Alur Geser (Berantai)

Input: tahapan JO target, jam mulai baru, mode (`mulai_tetap` / `selesai_tetap`), ceklis `ikut`.

1. **Validasi kunci**: tahapan target dan tahapan yang ikut tidak boleh terkunci (3.1).
2. **JO target**: hitung posisi baru tahapan target + tahapan yang ikut (wajib ikut otomatis, sisanya sesuai ceklis), sama seperti `simulate` tiket. JO lain belum dianggap penghalang di langkah ini.
3. **Antrian dorongan**: kumpulkan tahapan JO lain yang **tertabrak** (R1) atau **menyela** (R9) oleh posisi baru JO target.
4. Proses antrian **urut waktu** (yang paling awal dulu). Untuk setiap tahapan JO lain:
   - Mundurkan **seperlunya**: blok utuh pertama setelah tahapan yang menabraknya selesai (R1 + R9).
   - Kalau akibatnya tahapan berikutnya milik JO itu melanggar R2/R3 → tahapan itu **ikut mundur otomatis** (masuk antrian).
   - Kalau posisi barunya menabrak JO lain lagi → JO itu masuk antrian.
   - Tahapan yang **tidak tertabrak tidak bergerak** (celah tetap dipertahankan).
5. Batas: maksimal N putaran / N tahapan terdampak (misal 200). Lewat batas → ditolak.
6. **Evaluasi** semua JO terdampak: R4 (tanggal kirim), R5, R6, R7, R8, R9.
7. Hasil preview: valid / tidak, daftar perubahan per JO.

Geser **maju** (lebih awal): JO target bergeser maju, **JO lain tidak ikut maju**.

### Contoh

Mesin SM 102, JO-A digeser mulai 09:00 (durasi 2 jam):

```
Sebelum : [A 08-10] [B 10-13] (kosong 13-15) [C 15-17]
Sesudah : [A 09-11] [B 11-14] (kosong 14-15) [C 15-17]
```

- B tertabrak → mundur 1 jam (11-14).
- C tidak tertabrak → **tetap**.
- Jika tahap berikutnya B (mis. Potong di mesin lain) mulai 14:00 dan drying B = 1 jam → Potong B wajib mundur ke ≥ 15:00, dan seterusnya.

---

## 5. Alur Pindah

Input: tahapan JO target, jam mulai baru, mode, ceklis `ikut`.

1. **Validasi kunci** (3.1).
2. Hitung posisi baru tahapan target + tahapan JO itu yang ikut (wajib ikut otomatis + ceklis), sama seperti `simulate` tiket.
3. **JO lain adalah penghalang tetap.** Kalau tahapan target **atau tahapan yang ikut** tertabrak (R1) atau tersela (R9) JO lain → **ditolak**.
4. Response ditolak menyertakan:
   - `conflicts` (JO mana, jam berapa)
   - `saran`: jam mulai valid terdekat (memakai logika `suggestSlot`), lengkap dengan `_label`.
5. Tidak ada JO lain yang berubah.

---

## 6. Data

### 6.1 Sumber kebenaran

Slot jadwal resmi dibaca dari **`jadwal_produksi`** (bukan dari `tiket_jadwal_produksi_per_jam`), karena data tiket bisa sudah basi akibat endpoint lama. Parameter tahapan (`kapasitas_per_jam`, `drying_time`, `setting`, `id_mesin`, dll.) dari `tiket_jadwal_produksi_tahapan`.

Baris `jadwal_produksi` **tanpa** `id_tiket_jadwal_produksi` (input manual lewat `createJadwalProduksiView`) dianggap **penghalang tetap**: tidak pernah digeser, dan JO lain yang terdorong mencari jam setelahnya. Kalau penghalang tetap menghalangi dorongan → JO yang terdorong melompatinya (blok utuh setelahnya).

### 6.2 Perubahan tabel (lewat migration)

1. `jadwal_produksi`: tambah `id_tiket_jadwal_produksi_tahapan` (INT NULL) + index, supaya baris jadwal pasti terhubung ke tahapannya.
   - Backfill data lama: cocokkan `id_tiket_jadwal_produksi` + `tahapan_ke`.
   - Submit tiket ikut mengisi kolom ini.
2. `tiket_jadwal_produksi_adjust_log`: tambah
   - `sumber` (VARCHAR: `tiket` / `jadwal_produksi`)
   - `id_batch` (VARCHAR, mengelompokkan semua log dari satu kali apply geser berantai)
   - `jenis` bertambah nilai: `geser_berantai`, `pindah`, `terdorong` (JO lain yang ikut mundur)
3. Index `jadwal_produksi (id_mesin, tanggal, jam)` jika belum ada, untuk cek bentrok cepat.

### 6.3 Saat apply

Dalam **1 transaksi** dengan lock baris `jadwal_produksi` mesin-mesin terdampak:

1. Cek ulang hasil (data bisa berubah sejak preview). Kalau beda → 409, minta preview ulang.
2. Tulis ulang baris `jadwal_produksi` setiap tahapan terdampak (hapus slot lama tahapan itu, insert slot baru).
3. Sinkronkan `tiket_jadwal_produksi_tahapan` (`produksi_mulai`, `produksi_selesai`, `drying_*`, `tgl_from`, `tgl_to`) dan `tiket_jadwal_produksi_per_jam` tiap tiket terdampak.
4. Tulis log per tahapan (JO target + semua JO terdorong) dengan `id_batch` yang sama, `alasan` dari user.

---

## 7. Endpoint (usulan)

Base: `/ppic/jadwalProduksiView/adjust`. Semua pakai `auth`.

| Method | Path | Fungsi |
|---|---|---|
| GET | `/availability/:idJadwal` | Peta jam mesin (kosong/terisi/lembur/di luar shift) untuk tahapan jadwal ini |
| POST | `/suggest/:idJadwal` | Jam mulai valid terdekat (tanpa mendorong JO lain) |
| POST | `/geser/simulate/:idJadwal` | Preview geser berantai |
| PUT | `/geser/apply/:idJadwal` | Simpan geser berantai |
| POST | `/pindah/simulate/:idJadwal` | Preview pindah |
| PUT | `/pindah/apply/:idJadwal` | Simpan pindah |
| GET | `/log/:idTiket` | Riwayat perubahan (tiket & jadwal resmi) |

`:idJadwal` = id baris `jadwal_produksi` mana saja milik tahapan yang diubah.

### 7.1 Body simulate / apply

```json
{
  "new_start": "2026-12-06 09:00",
  "mode": "mulai_tetap",
  "ikut": [121, 122],
  "is_lembur": false,
  "alasan": "Bahan datang terlambat"
}
```

- `new_start`: format `YYYY-MM-DD HH:mm` (waktu lokal).
- `ikut`: id tahapan tiket milik JO yang sama yang dicentang ikut. Tahapan wajib ikut tetap ikut walau tidak dikirim.
- `alasan`: wajib di apply.

### 7.2 Response simulate geser (contoh)

```json
{
  "valid": true,
  "jenis": "geser_berantai",
  "target": {
    "no_jo": "JO-001",
    "tahapan": [
      {
        "id_tahapan": 120,
        "tahapan": "Cetak",
        "mesin": "SM 102",
        "peran": "diubah",
        "lama": { "mulai": "2026-12-06 08:00", "mulai_label": "06 Desember 2026 08:00", "selesai": "2026-12-06 10:00", "selesai_label": "06 Desember 2026 10:00" },
        "baru": { "mulai": "2026-12-06 09:00", "mulai_label": "06 Desember 2026 09:00", "selesai": "2026-12-06 11:00", "selesai_label": "06 Desember 2026 11:00" },
        "geser_jam": 1
      }
    ]
  },
  "terdampak": [
    {
      "no_jo": "JO-002",
      "tgl_kirim": "2026-12-10",
      "tgl_kirim_label": "10 Desember 2026",
      "tahapan": [
        {
          "id_tahapan": 210,
          "tahapan": "Cetak",
          "mesin": "SM 102",
          "peran": "terdorong",
          "lama": { "mulai": "2026-12-06 10:00", "mulai_label": "06 Desember 2026 10:00" },
          "baru": { "mulai": "2026-12-06 11:00", "mulai_label": "06 Desember 2026 11:00" },
          "geser_jam": 1
        }
      ]
    }
  ],
  "ringkasan": { "jumlah_jo_terdampak": 1, "jumlah_tahapan_terdampak": 1 },
  "conflicts": [],
  "warnings": []
}
```

### 7.3 Response pindah ditolak (contoh, 409)

```json
{
  "valid": false,
  "jenis": "pindah",
  "conflicts": [
    {
      "rule": "R1",
      "waktu": "2026-12-06 10:00",
      "waktu_label": "06 Desember 2026 10:00",
      "no_jo": "JO-002",
      "msg": "Mesin SM 102 sudah dipakai JO-002 (Cetak) pada 06 Desember 2026 10:00"
    }
  ],
  "saran": {
    "new_start": "2026-12-06 13:00",
    "new_start_label": "06 Desember 2026 13:00"
  }
}
```

---

## 8. Backend

- Service baru `controller/ppic/jadwalProduksi/service/jadwalProduksiAdjustService.js`.
- Memakai ulang dari modul tiket: `jadwalShiftHelper` (shift, lembur, libur), `jadwalOccupancyHelper` (occupancy), `jadwalLayoutHelper` (slot, format, label), `jadwalCalculateService` (unit, durasi, `placeUnitForward`, `findMesinConflicts`), logika ceklis & evaluasi dari `jadwalAdjustService`.
- Tambahan:
  - `loadJadwalResmiContext(idJadwal)`: konteks dari `jadwal_produksi` + tahapan tiket.
  - `placeBlockForward(stage, after, occ)`: penempatan blok utuh (R1 + R9).
  - `cascadePush(context, changedStages)`: antrian dorongan (bagian 4).
  - `findInterruptions(stages, occ)`: cek R9.
- Semua pengolahan tanggal memakai waktu lokal (`parseLocalDateTime`, `fmtDate`, `fmtDateTime`). Tidak memakai `toISOString()` untuk tanggal.

---

## 9. Tahapan Pengerjaan

1. Migration (6.2) + backfill `id_tiket_jadwal_produksi_tahapan`.
2. R9 di modul tiket (simulate, apply, resolve, submit).
3. Service jadwal resmi: konteks, availability, suggest.
4. Pindah (simulate + apply).
5. Geser berantai (simulate + apply).
6. Dokumentasi FE (endpoint, payload, response).
7. Setelah FE pindah: deprecate `update` / `move` / `lembur` lama dan `helper/lemburJadwalProduksiMonlyFunction.js`.

Perubahan lembur mesin (tambah/hapus lembur) memakai mesin yang sama menyusul setelah poin 5.

---

## 10. Hal yang Masih Perlu Dikonfirmasi

1. Batas maksimal tahapan terdampak dalam satu geser berantai (usulan: 200).
2. Penghalang tetap (jadwal manual tanpa tiket): dorongan melompatinya. Setuju?
3. Kunci LKH (tahapan sudah berjalan) ditambahkan di tahap berikutnya atau tidak sama sekali?
