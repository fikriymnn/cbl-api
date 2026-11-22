# Delete Item Purchase Order (Kembali ke Request Purchase)

Dokumen ini untuk tim frontend & backend. Isinya endpoint, aturan validasi, dan efek data saat item pada **PO biasa** dihapus.

Item yang dihapus dari PO **tidak hilang**: kebutuhannya dikembalikan ke **Request Purchase** (status `incoming`) supaya bisa dipilih lagi saat membuat PO baru.

---

## 1. Ringkasan

Ada 2 cara hapus:

| | Hapus per Item JO | Hapus per Item PO |
|---|---|---|
| Endpoint | `DELETE /purchasing/purchaseOrder/itemJo/:idItemJo` | `DELETE /purchasing/purchaseOrder/item/:idItem` |
| Param | `id` dari `items_jo` (tabel `purchase_order_item_jo`) | `id` dari `items` (tabel `purchase_order_item`) |
| Yang terhapus | 1 baris item JO | 1 item PO **+ semua item JO** dengan `id_item` yang sama di PO itu |
| Item PO | `qty` & `qty_beli` dikurangi `qty_po` item JO tsb | Item PO langsung dinonaktifkan |
| Request Purchase | Dikembalikan untuk JO + item tsb | Dikembalikan untuk setiap JO + item yang terhapus |

Kedua endpoint pakai `auth` (token user). Tidak ada body. Semua proses berjalan dalam **1 transaksi**: kalau ada satu langkah gagal, semua dibatalkan.

Data tidak benar-benar dihapus dari database (soft delete, `is_active = false`), sama seperti perilaku update PO.

---

## 2. Syarat / Validasi

Hapus item **hanya bisa** jika `status` PO salah satu dari:

- `draft`
- `reject kabag`
- `reject finance`

Selain itu (`request kabag`, `request finance`, `approve finance`, dll) → **400**.

Validasi lain:

| Kondisi | Response |
|---|---|
| Item JO / Item PO tidak ditemukan atau sudah nonaktif | 404 |
| PO tidak ditemukan / nonaktif | 404 |
| Status PO bukan draft / reject kabag / reject finance | 400 |
| Item JO mengambil qty dari PO Booking **dan** qty booking sudah dipindah ke gudang (`is_booking_moved = true`) | 400 |
| Setelah dihapus PO jadi kosong (tidak ada item PO aktif, atau tidak ada item JO aktif) | 400, hapus ditolak |

> PO tidak boleh kosong. Kalau user mau menghapus item terakhir, tolak di FE (sembunyikan/disable tombol hapus jika hanya tersisa 1 item / 1 item JO). Backend tetap memvalidasi.

---

## 3. Yang Terjadi di Backend

### 3.1 Hapus per Item JO

1. Item JO dinonaktifkan (`is_active = false`).
2. Jika item JO memakai qty dari **PO Booking** (`qty_booking > 0`), `qty_pakai` pada item PO Booking dikembalikan (dikurangi `qty_booking`), jadi qty tersebut bisa dipakai PO lain.
3. Item PO dengan `id_item` yang sama dikurangi:
   - `qty = qty - qty_po`
   - `qty_beli = qty_beli - qty_po` (minimal 0)
   - `total = qty_beli × harga`, `ppn = 11% × total` (jika `is_ppn`)
   - Jika `qty` menjadi 0, item PO ikut dinonaktifkan.
   - `qty_booking` **tidak** mengurangi item PO, karena qty booking bukan qty yang dibeli ke vendor.
4. Total PO dihitung ulang dari item PO yang masih aktif:
   - `sub_total = Σ total`, `ppn = Σ ppn`, `total = sub_total + ppn - discount`
5. Kebutuhan dikembalikan ke Request Purchase (lihat 3.3).

### 3.2 Hapus per Item PO

1. Semua item JO aktif di PO tsb dengan `id_item` yang sama dinonaktifkan (qty booking-nya dilepas seperti 3.1 langkah 2).
2. Item PO dinonaktifkan.
3. Total PO dihitung ulang.
4. Request Purchase dikembalikan **1x per kombinasi JO + item** (lihat 3.3).

### 3.3 Kembali ke Request Purchase

Saat PO dibuat, request purchase yang dipilih diubah jadi `status: "history"` dan diisi `id_purchase_order`. Saat item dihapus:

1. **Request asal ditemukan.** Request purchase dengan `id_purchase_order` = PO ini, `id_jo` dan `id_item` yang sama dikembalikan:
   - `status` → `incoming`
   - `id_purchase_order` → `null`

   Data request asal (qty, tgl request, user request) tetap utuh.
2. **Request asal tidak ditemukan** (misal item JO ditambah manual saat update PO), **atau** di PO yang sama masih ada item JO lain dengan JO + item yang sama (request asal masih dipakai item JO tsb), maka **dibuat request purchase baru**:
   - data JO/IO/SO/BOM diambil dari Job Order
   - `qty = qty_bom` item JO (jika 0, pakai `qty_po + qty_booking`)
   - `id_request` = user yang menghapus, `tgl_request` = sekarang, `status` = `incoming`

Request yang kembali/baru akan muncul di list Request Purchase status `incoming`, jadi FE cukup refresh list tersebut.

---

## 4. Endpoint

### 4.1 Hapus Item JO

```
DELETE /purchasing/purchaseOrder/itemJo/:idItemJo
```

Response 200:

```json
{
  "status_code": 200,
  "success": true,
  "message": "delete item jo success",
  "data": {
    "restored_request": 1,
    "created_request": 0
  }
}
```

| Field | Arti |
|---|---|
| `restored_request` | Jumlah request purchase asal yang dikembalikan ke `incoming` |
| `created_request` | Jumlah request purchase baru yang dibuat |

### 4.2 Hapus Item PO

```
DELETE /purchasing/purchaseOrder/item/:idItem
```

Response 200:

```json
{
  "status_code": 200,
  "success": true,
  "message": "delete item success",
  "data": {
    "deleted_item_jo": 2,
    "restored_request": 2,
    "created_request": 0
  }
}
```

### 4.3 Response Gagal

400 / 404 (validasi):

```json
{
  "status_code": 400,
  "success": false,
  "message": "item PO hanya bisa dihapus saat status draft / reject kabag / reject finance (status sekarang: request kabag)"
}
```

Contoh `message` lain:

- `Data Purchase Order Item JO Tidak Ditemukan`
- `Data Purchase Order Item Tidak Ditemukan`
- `Data Purchase Order Tidak Ditemukan`
- `item jo JO-001 - Kertas Art sudah ambil qty dari PO booking dan sudah masuk gudang, tidak bisa dihapus`
- `item terakhir tidak bisa dihapus, Purchase Order tidak boleh kosong`

500 (error server):

```json
{ "msg": "..." }
```

---

## 5. Contoh

PO draft berisi:

| Item PO | qty | qty_beli | harga | is_ppn |
|---|---|---|---|---|
| Kertas Art (id_item 10) | 1500 | 1500 | 1.000 | true |
| Tinta (id_item 20) | 50 | 50 | 20.000 | false |

| Item JO | id_item | qty_po | qty_booking |
|---|---|---|---|
| JO-001 | 10 | 1000 | 0 |
| JO-002 | 10 | 500 | 200 |
| JO-001 | 20 | 50 | 0 |

**Hapus item JO `JO-002 / Kertas Art`:**

- Item JO JO-002 nonaktif.
- `qty_pakai` PO Booking item dikurangi 200.
- Item PO Kertas Art: `qty 1500 → 1000`, `qty_beli 1500 → 1000`, `total 1.000.000`, `ppn 110.000`.
- Total PO dihitung ulang.
- Request purchase JO-002 / Kertas Art kembali ke `incoming`.

**Hapus item PO `Kertas Art`:**

- Item JO JO-001 & JO-002 (Kertas Art) nonaktif, qty booking JO-002 dilepas.
- Item PO Kertas Art nonaktif.
- PO tinggal Tinta, total dihitung ulang.
- Request purchase JO-001 / Kertas Art dan JO-002 / Kertas Art kembali ke `incoming`.

**Hapus item PO `Tinta`, lalu `Kertas Art`:** penghapusan kedua ditolak (400) karena PO akan kosong.

---

## 6. Catatan untuk FE

- Tampilkan tombol hapus hanya saat `status` PO `draft`, `reject kabag`, atau `reject finance`.
- Disable tombol hapus untuk item JO dengan `is_booking_moved = true`.
- Beri konfirmasi sebelum hapus. Untuk hapus per item PO, sebutkan bahwa semua item JO dengan item yang sama ikut terhapus.
- Setelah berhasil, refresh detail PO (`GET /purchasing/purchaseOrder/:id`) dan list Request Purchase.
- Endpoint ini terpisah dari `PUT /purchasing/purchaseOrder/:id`. Hapus lewat update PO (item tidak dikirim di payload) **tidak** mengembalikan request purchase. Untuk hapus item, pakai endpoint di dokumen ini.
