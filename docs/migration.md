# Migration Database

Mulai sekarang setiap perubahan struktur tabel (tambah/ubah/hapus kolom, index, tabel baru) dibuat sebagai **file migration**, bukan lewat `db.sync({ alter: true })` atau file SQL manual.

Tool: [`sequelize-cli`](https://github.com/sequelize/cli) (devDependency).

---

## 1. Struktur

| File / Folder | Isi |
|---|---|
| `.sequelizerc` | Lokasi config & folder migration untuk sequelize-cli |
| `config/sequelizeCli.js` | Koneksi DB, membaca `.env` yang sama dengan `config/database.js` (`DB_NAME`, `DB_ROOT`, `DB_PASS`, `DB_HOST`, opsional `DB_PORT`) |
| `migrations/` | File migration, urut berdasarkan timestamp di nama file |
| Tabel `SequelizeMeta` | Dibuat otomatis di DB, mencatat migration yang sudah dijalankan |

Tabel yang sudah ada **tidak** dibuat ulang lewat migration. Migration hanya untuk perubahan mulai sekarang. File SQL lama di `docs/sql/` dibiarkan sebagai arsip.

---

## 2. Perintah

```bash
# buat file migration baru (nama pakai kebab-case)
npm run migration:create -- add-kolom-x-ke-purchase-order

# jalankan semua migration yang belum jalan
npm run migrate

# lihat status migration (up / down)
npm run migrate:status

# batalkan 1 migration terakhir
npm run migrate:undo
```

`npm run migrate` memakai DB dari `.env` yang aktif, jadi pastikan `.env` mengarah ke DB yang benar sebelum menjalankan.

---

## 3. Contoh File Migration

`migrations/20261122090000-add-alasan-hapus-ke-purchase-order-item-jo.js`

```js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("purchase_order_item_jo", "alasan_hapus", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "is_active",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("purchase_order_item_jo", "alasan_hapus");
  },
};
```

Untuk beberapa perubahan sekaligus, bungkus dengan transaksi:

```js
async up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn("tabel_a", "kolom_1", { type: Sequelize.INTEGER }, { transaction });
    await queryInterface.addIndex("tabel_a", ["kolom_1"], { name: "idx_tabel_a_kolom_1", transaction });
  });
},
```

> Catatan MySQL: DDL (`ALTER TABLE`) auto-commit, jadi transaksi tidak benar-benar me-rollback DDL yang sudah jalan. Usahakan 1 migration = 1 perubahan kecil supaya mudah di-undo.

---

## 4. Aturan

1. **Setiap perubahan tabel = 1 file migration** dengan `up` **dan** `down`.
2. **Model ikut diupdate** di file yang sama dengan PR/commit migration-nya (kolom di model harus sama dengan migration).
3. **Jangan edit migration yang sudah dijalankan** di DB bersama/production. Kalau perlu koreksi, buat migration baru.
4. **Jangan pakai `sync({ alter: true })`** untuk mengubah tabel.
5. Nama index/constraint maksimal **64 karakter** (batas MySQL). Beri `name` sendiri jika nama otomatis terlalu panjang.
6. **Deploy:** jalankan `npm run migrate` **sebelum** kode baru di-deploy (model sudah memakai kolom baru).
