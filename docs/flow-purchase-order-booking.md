# Flow Purchase Order Booking, Incoming Raw Material, dan Pengaruhnya ke PO Biasa

Dokumen ini untuk tim frontend. Isinya alur layar, endpoint, payload, dan aturan validasi yang perlu diikuti untuk fitur **PO Booking**.

---

## 1. Konsep Singkat

| | PO Biasa | PO Booking |
|---|---|---|
| Tujuan | Beli barang untuk JO tertentu | Beli barang **untuk stok** dulu, belum terikat JO |
| Isi | `items` + `items_jo` + `request_purchase_data` | Hanya `items` (tanpa `items_jo`) |
| Barang datang (approve QC) masuk ke | Gudang **booking** (per JO) + gudang stock (qty idle) | **Semua** masuk gudang **stock** (`sumber_mutasi: "po booking"`) |
| Nomor PO | Nomor urutnya **dipakai bersama** dengan PO Booking | Nomor urutnya **dipakai bersama** dengan PO biasa |

Alur besarnya:

```
[1] Buat PO Booking ──► [2] Approval (Kabag → Finance)
                                  │
                                  ▼
                     [3] Barang datang → Input Incoming RM (QC)
                                  │
                                  ▼
                     [4] QC Approve → qty_terkirim bertambah, barang masuk gudang stock
                                  │
                                  ▼
                     [5] PO biasa mengambil qty dari PO Booking (qty_booking per item_jo)
                                  │
                                  ▼
                     [6] PO biasa approve finance → qty dipindah gudang stock → gudang booking JO
```

---

## 2. Field Qty pada Item PO Booking

Item PO Booking (`purchase_order_booking_item`) punya beberapa qty. Pahami artinya sebelum menampilkan di UI:

| Field | Arti | Diubah oleh |
|---|---|---|
| `qty` | Qty input awal | Create/Update PO Booking |
| `qty_beli` | Qty yang dipesan ke vendor (default = `qty`) | Create/Update PO Booking |
| `qty_terkirim` | Qty yang **sudah datang & di-approve QC** | Approve Incoming RM |
| `qty_sisa` | `qty_beli - qty_terkirim` (yang belum datang) | Approve Incoming RM / Update |
| `qty_pakai` | Qty yang sudah diambil oleh `items_jo` PO biasa | Create/Update PO biasa |
| `qty_tersedia` | **Hanya di response endpoint available**: `qty_terkirim - qty_pakai` | (dihitung) |
| `status_qc` | `null` → `request qc` → `approve qc` / `reject qc` | Incoming RM |
| `status_po` | `progress` → `done` (jika `qty_terkirim >= qty_beli` atau di-close) | Approve Incoming RM / Close |

> Penting: Yang bisa dipakai PO biasa adalah barang yang **sudah datang** (`qty_terkirim`), bukan yang baru dipesan (`qty_beli`).

---

## 3. PO Booking

Base URL: `/purchasing/purchaseOrderBooking`. Semua endpoint pakai auth.

### 3.1 Status & Tiket

| Aksi | Endpoint | `status` hasil | `status_tiket` hasil |
|---|---|---|---|
| Create | `POST /purchasing/purchaseOrderBooking` | `draft` | `draft` |
| Request | `PUT /purchasing/purchaseOrderBooking/request/:id` | `request kabag` | `request kabag` |
| Approve Kabag | `PUT /purchasing/purchaseOrderBooking/approveKabag/:id` | `request finance` | `request finance` |
| Reject Kabag | `PUT /purchasing/purchaseOrderBooking/rejectKabag/:id` | `reject kabag` | `draft` |
| Approve Finance | `PUT /purchasing/purchaseOrderBooking/approveFinance/:id` | `approve finance` | `history` |
| Reject Finance | `PUT /purchasing/purchaseOrderBooking/rejectFinance/:id` | `reject finance` | `draft` |
| Close PO | `PUT /purchasing/purchaseOrderBooking/close/:id` | `status_po` → `done` (header & semua item) | – |

```
draft ──request──► request kabag ──approveKabag──► request finance ──approveFinance──► approve finance (history)
  ▲                      │                                │
  └──── rejectKabag ─────┘                                │
  └──────────────────────────── rejectFinance ────────────┘
```

Endpoint request/approve/reject/close **tidak butuh body**. User diambil dari token.

> Backend **tidak memvalidasi** status saat transisi (misal approve finance tetap jalan walau status masih `draft`). FE wajib menampilkan tombol sesuai status:
> - `draft` / `reject kabag` / `reject finance` → tombol **Edit** & **Request**
> - `request kabag` → **Approve Kabag** / **Reject Kabag**
> - `request finance` → **Approve Finance** / **Reject Finance**
> - `approve finance` & `status_po = progress` → **Close PO**

### 3.2 Ambil Nomor PO Baru (preview)

`GET /purchasing/purchaseOrderBooking/getNo/new`

```json
{ "status": 200, "success": true, "no_purchase_order": "<nomor terakhir>", "no_purchase_order_new": "<nomor berikutnya>" }
```

Nomor ini hanya untuk preview. Nomor final dibuat ulang oleh backend saat create (karena dipakai bersama dengan PO biasa, bisa saja sudah terpakai).

### 3.3 List & Detail

`GET /purchasing/purchaseOrderBooking/:id?`

Query yang didukung:

| Param | Keterangan |
|---|---|
| `page` + `limit` | Pagination. **Harus dikirim berpasangan.** |
| `start_date_po` + `end_date_po` | Filter tanggal PO (berpasangan) |
| `start_date_kirim` + `end_date_kirim` | Filter tanggal kirim (berpasangan) |
| `search` | Cari `no_purchase_order` / `nama_vendor` |
| `id_vendor`, `status`, `status_tiket`, `status_po` | Filter |
| `sort_by` | `createdAt` \| `tgl_po` \| `tgl_kirim` \| `no_purchase_order` |
| `sort_order` | `ASC` \| `DESC` (default `DESC`) |

Aturan:
- Dengan `page` & `limit` → response ada `data` + `total_page`.
- Dengan `:id` → detail satu PO (`data` object).
- **Tanpa pagination & tanpa id** → **wajib** isi range tanggal PO atau tanggal kirim. Response tambah `rekap`:

```json
{
  "rekap": {
    "total_qty": 0, "total_rupiah": 0,
    "ots_qty": 0, "ots_rupiah": 0,
    "terkirim_qty": 0, "terkirim_rupiah": 0
  }
}
```

Data sudah include: `items` (aktif saja, dengan `master_barang`), `user_request`, `user_create`, `user_approve_kabag`, `user_approve_finance`, `user_reject_kabag`, `user_reject_finance`.

### 3.4 Create

`POST /purchasing/purchaseOrderBooking`

```json
{
  "id_vendor": 1,
  "nama_vendor": "PT Vendor",
  "tgl_po": "2026-10-13",
  "tgl_kirim": "2026-10-20",
  "discount": 0,
  "sub_total": 1500000,
  "ppn": 165000,
  "total": 1665000,
  "note_internal": "",
  "note_supplier": "",
  "purchase_name": "",
  "items": [
    {
      "id_item": 10,
      "id_brand": 2,
      "nama_item": "Kertas Art Paper 210",
      "nama_brand": "Brand A",
      "qty": 1000,
      "qty_beli": 1000,
      "tipe_barang": "kertas",
      "satuan": "lembar",
      "harga": 1500,
      "total": 1500000,
      "ppn": 165000,
      "is_ppn": true
    }
  ]
}
```

- `items` wajib minimal 1.
- **Perhitungan harga dilakukan di frontend** (ada perhitungan khusus). Backend menyimpan nilai yang dikirim apa adanya:
  - Per item: `harga`, `total`, `ppn`
  - Header: `sub_total`, `discount`, `ppn`, `total`
- Kalau field tersebut **tidak dikirim** (`undefined`/`null`), backend memakai perhitungan standar sebagai cadangan:
  - item `total = qty_beli × harga`, item `ppn = 11% × total` (jika `is_ppn`)
  - header `sub_total = Σ total item`, `ppn = Σ ppn item`, `total = sub_total + ppn - discount`
- Supaya angka konsisten, **selalu kirim semua field harga** di atas. Jangan mengandalkan cadangan dari backend.

### 3.5 Update

`PUT /purchasing/purchaseOrderBooking/:id` — body sama dengan create, termasuk `sub_total`, `ppn`, `total` header dan `total`, `ppn` per item. Semua dihitung ulang di frontend.

- Item lama: kirim dengan `id`.
- Item baru: kirim tanpa `id`.
- Item yang **tidak dikirim** dianggap dihapus (di-nonaktifkan).
- **Item yang sudah dipakai PO biasa (`qty_pakai > 0`) tidak bisa dihapus.** Error: `item <nama> sudah dipakai di PO, tidak bisa dihapus`. Sebaiknya FE disable tombol hapus jika `qty_pakai > 0`.
- `qty_sisa` dihitung ulang: `qty_beli - qty_terkirim`. Jangan set `qty_beli` lebih kecil dari `qty_terkirim` (FE validasi).

---

## 4. Incoming Raw Material (QC)

Base URL: `/qc/incomingRawMaterial`. Endpoint ini dipakai **untuk PO biasa dan PO Booking**. Pembedanya ada di field per item.

### 4.1 Nomor Good Receipt

`GET /qc/incomingRawMaterialNoGoodReceipt`

```json
{ "status": 200, "success": true, "no_good_receipt": "<terakhir>", "new_no_good_receipt": "GRM-00012/CBL/10/26" }
```

### 4.2 Sumber data untuk form incoming PO Booking

Ambil PO Booking yang sudah **approve finance** dan masih `status_po = progress`:

```
GET /purchasing/purchaseOrderBooking?page=1&limit=10&status=approve finance&status_po=progress
```

Lalu tampilkan `items` yang `status_po = progress` beserta `qty_sisa` (qty yang belum datang).

### 4.3 Create Incoming (bulk)

`POST /qc/incomingRawMaterial`

**Untuk PO Booking**, isi `id_purchase_order_booking_item`:

```json
{
  "items": [
    {
      "id_purchase_order_booking_item": 55,
      "no_surat_jalan": "SJ-001",
      "no_good_receipt": "GRM-00012/CBL/10/26",
      "qty_incoming": 500,
      "qty_pallet": 2
    }
  ]
}
```

**Untuk PO biasa**, isi `id_purchase_order` + `id_purchase_order_item_jo`:

```json
{
  "items": [
    {
      "id_purchase_order": 12,
      "id_purchase_order_item_jo": 88,
      "no_surat_jalan": "SJ-002",
      "no_good_receipt": "GRM-00013/CBL/10/26",
      "qty_incoming": 300,
      "qty_idle": 20,
      "qty_pallet": 1
    }
  ]
}
```

Aturan:
- Tiap item **wajib** salah satu: `id_purchase_order_item_jo` **atau** `id_purchase_order_booking_item`. **Tidak boleh dua-duanya.**
- PO Booking dan PO biasa boleh dicampur dalam satu request.
- Untuk PO Booking: `id_purchase_order_booking` diisi otomatis oleh backend. `qty_idle` selalu dipaksa `0`, jadi **sembunyikan input qty idle** di form booking.
- Setelah create: incoming `status = incoming`, `status_ticket = incoming`; item booking `status_qc = request qc`.
- Backend **tidak membatasi** `qty_incoming` terhadap `qty_sisa`. FE sebaiknya memberi peringatan jika `qty_incoming > qty_sisa`.

### 4.4 List Incoming

`GET /qc/incomingRawMaterial/:id?`

| Param | Keterangan |
|---|---|
| `page` + `limit` | Pagination (include relasi PO / PO booking) |
| `start_date` + `end_date` | Filter `createdAt` |
| `search` | Cari `no_surat_jalan` |
| `is_booking=true` | Hanya incoming dari PO Booking |
| `is_booking=false` | Hanya incoming dari PO biasa |
| `id_purchase_order_booking`, `id_purchase_order_booking_item` | Filter per PO booking / item |
| `id_purchase_order`, `id_purchase_order_item_jo` | Filter per PO biasa / item jo |
| `status`, `status_ticket` | Filter status |

Untuk membedakan di tabel: jika `id_purchase_order_booking_item` terisi → **PO Booking** (pakai relasi `purchase_order_booking` & `purchase_order_booking_item`), selain itu → PO biasa.

> Catatan: request **tanpa** `page/limit` dan tanpa `id` **tidak meng-include relasi** apa pun. Pakai pagination untuk tabel.

### 4.5 Approve / Reject QC

| Aksi | Endpoint | Body |
|---|---|---|
| Approve | `PUT /qc/incomingRawMaterial/approve/:id` | `{ "note": "..." }` |
| Reject | `PUT /qc/incomingRawMaterial/reject/:id` | `{ "note": "..." }` |

Tampilkan tombol hanya jika `status = incoming`. Backend tidak mencegah approve dua kali, dan approve dua kali akan menambah qty dua kali.

**Efek Approve untuk PO Booking:**
1. Incoming → `status = approve`, `status_ticket = history`.
2. Item booking:
   - `status_qc = approve qc`
   - `qty_terkirim += qty_incoming`
   - `qty_sisa -= qty_incoming`
   - jika `qty_terkirim >= qty_beli` → `status_po = done`
3. Seluruh `qty_incoming` masuk **gudang stock** + tercatat di mutasi barang (`type_mutasi: masuk`, `sumber_mutasi: po booking`).

**Efek Reject:**
- Incoming → `status = reject qc`, `status_ticket = history`.
- Item booking → `status_qc = reject qc`. Qty tidak berubah dan tidak ada barang masuk gudang.
- Untuk barang pengganti, buat incoming baru lagi.

---

## 5. Pengaruh ke PO Biasa

Setelah barang PO Booking datang (approve QC), qty-nya bisa **diambil oleh `items_jo` di PO biasa** sehingga tidak perlu dipesan lagi ke vendor.

### 5.1 Cari qty booking yang tersedia

`GET /purchasing/purchaseOrderBookingItem/available?id_item=10&search=...`

Mengembalikan item PO Booking yang:
- PO Booking-nya `status = approve finance`, dan
- `qty_terkirim - qty_pakai > 0`.

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "id": 55,
      "id_purchase_order_booking": 7,
      "id_item": 10,
      "nama_item": "Kertas Art Paper 210",
      "qty_beli": 1000,
      "qty_terkirim": 500,
      "qty_pakai": 200,
      "qty_tersedia": 300,
      "purchase_order_booking": {
        "id": 7, "no_purchase_order": "...", "nama_vendor": "...", "tgl_po": "...", "tgl_kirim": "..."
      }
    }
  ]
}
```

Saran UI: di form PO biasa, pada tiap baris `items_jo` tambahkan tombol **"Ambil dari PO Booking"** → buka modal list di atas (filter `id_item` = item jo tersebut) → user pilih satu item booking dan isi `qty_booking`.

### 5.2 Payload `items_jo` di PO biasa

Tambahkan dua field di tiap `items_jo` yang mengambil dari booking:

```json
{
  "items_jo": [
    {
      "id_jo": 100,
      "no_jo": "JO-001",
      "id_item": 10,
      "nama_item": "Kertas Art Paper 210",
      "qty_bom": 1000,
      "qty_po": 700,
      "id_purchase_order_booking_item": 55,
      "qty_booking": 300,
      "tipe_barang": "kertas",
      "satuan": "lembar",
      "rencana_cetak": "2026-10-25"
    }
  ]
}
```

- `qty_po` = qty yang **dipesan ke vendor** di PO ini.
- `qty_booking` = qty yang **diambil dari stok PO Booking**. Nilainya terpisah dari `qty_po`.
- Kebutuhan total JO = `qty_po + qty_booking`. Backend menghitung `qty_lebih = max(qty_po + qty_booking - qty_bom, 0)`.
- `id_purchase_order_booking` diisi otomatis oleh backend.
- Jika semua kebutuhan diambil dari booking, `qty_po` boleh `0`. Item jo seperti ini otomatis `status_po = done` saat PO approve finance (karena tidak ada barang yang akan datang dari vendor).
- **Satu item jo hanya bisa ambil dari satu item PO Booking.**

Validasi backend saat create/update PO biasa (error akan muncul di `message`):
| Kondisi | Pesan |
|---|---|
| Item booking tidak ditemukan | `Data Purchase Order Booking Item Tidak Ditemukan` |
| PO Booking belum approve finance | `PO booking belum approve finance` |
| `id_item` beda | `item PO booking (...) tidak sama dengan item jo (...)` |
| `qty_booking > qty_tersedia` | `qty booking ... dari PO ... melebihi qty tersedia (...)` |

### 5.3 Efek per tahap PO biasa

| Tahap PO biasa | Efek ke PO Booking / Gudang |
|---|---|
| **Create** | `qty_pakai` item booking `+= qty_booking` (langsung di-reserve, belum ada perpindahan barang) |
| **Update** (sebelum approve finance) | Reserve lama dilepas (`qty_pakai -= qty_booking lama`), lalu di-reserve ulang sesuai payload baru |
| **Approve Finance** | Untuk tiap item jo dengan `qty_booking > 0`: qty dipakai dari **gudang stock** → masuk **gudang booking JO** (`sumber_mutasi: booking jo`). Item jo ditandai `is_booking_moved = true` |
| **Update** (sesudah approve finance) | Item jo dengan `is_booking_moved = true` **tidak boleh dihapus** dan `id_purchase_order_booking_item` / `qty_booking`-nya **tidak boleh diubah** |
| **Incoming RM PO biasa** | Hanya terkait `qty_po` (barang dari vendor). `qty_booking` tidak ikut dihitung di `qty_terkirim`/`qty_sisa` item jo |

### 5.4 Hal yang perlu diperhatikan FE saat **edit** PO biasa

1. **Selalu kirim ulang** `id_purchase_order_booking_item` dan `qty_booking` untuk setiap item jo yang memakai booking. Jika tidak dikirim, backend menganggap booking dilepas (`qty_pakai` dikembalikan).
2. **Validasi max qty saat edit:** `qty_tersedia` dari endpoint available **belum termasuk** qty yang sedang dipakai PO ini sendiri. Batas maksimal di form edit:
   ```
   max_qty_booking = qty_tersedia + qty_booking_lama (jika item booking-nya sama)
   ```
   Item booking yang semua qty-nya sedang dipakai PO ini (`qty_tersedia = 0`) **tidak muncul** di list available. FE perlu tetap menampilkan pilihan yang sudah tersimpan dari data detail PO.
3. Jika `is_booking_moved = true` → kunci (disable) field booking dan tombol hapus untuk baris tersebut.
4. Di detail PO biasa, `items_jo[].purchase_order_booking` berisi `{ id, no_purchase_order, nama_vendor }`. Tampilkan sebagai info "Ambil dari PO Booking: <no PO>".

### 5.5 Catatan stok

Pada approve finance PO biasa, barang diambil dari **gudang stock per item** (bukan stok khusus milik PO Booking). Jika stok item di gudang stock sudah berkurang karena pemakaian lain (misalnya mutasi manual), approve finance bisa gagal dengan pesan dari service gudang stock. Tampilkan `message` error dari backend ke user.

---

## 6. Ringkasan Contoh Skenario

1. Purchasing membuat PO Booking kertas **1000 lembar** → approve kabag → approve finance.
   - Item booking: `qty_beli 1000`, `qty_terkirim 0`, `qty_sisa 1000`, `qty_pakai 0`.
2. Vendor kirim **600** → QC input incoming (`id_purchase_order_booking_item`, `qty_incoming 600`) → QC approve.
   - Item booking: `qty_terkirim 600`, `qty_sisa 400`. Gudang stock +600.
3. Ada JO butuh **1000**. Purchasing buat PO biasa: `qty_po 400`, ambil `qty_booking 600` dari PO Booking.
   - Item booking: `qty_pakai 600` → `qty_tersedia 0`.
4. PO biasa approve finance.
   - Gudang stock −600, gudang booking JO +600. Item jo `is_booking_moved = true`.
5. Sisa 400 dari vendor PO biasa datang → incoming PO biasa (`id_purchase_order_item_jo`) seperti biasa.
6. Sisa 400 dari PO Booking datang → incoming PO Booking → `qty_terkirim 1000` → item booking `status_po = done`, `qty_tersedia 400` siap dipakai PO lain.
