const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMarketing = require("../../masterData/marketing/masterMarketingModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../masterData/marketing/masterHargaPengirimanModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterMesinTahapan = require("../../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const Kalkulasi = db.define(
  "kalkulasi",
  {
    id_user_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_kalkulasi_previous: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_okp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterCustomer,
        key: "id",
      },
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_marketing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMarketing,
        key: "id",
      },
    },
    nama_marketing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_marketing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterProduk,
        key: "id",
      },
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_area_pengiriman: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterHargaPengiriman,
        key: "id",
      },
    },
    nama_area_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_area_pengiriman: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_kalkulasi: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    kode_kalkulasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_kalkulasi: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    presentase_insheet: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_kalkulasi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "baru",
    },
    ukuran_jadi_panjang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_lebar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_tinggi: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_terb_panjang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_terb_lebar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_panjang_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_lebar_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bagian_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_isi_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bbs_1: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "no",
    },
    ukuran_cetak_panjang_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_lebar_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bagian_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_isi_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bbs_2: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "no",
    },
    warna_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    warna_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_warna: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_kertas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramature_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    panjang_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    lebar_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    persentase_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    persentase_apki_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    total_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    total_harga_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    id_mesin_potong: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    nama_mesin_potong: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    print_insheet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_jenis_mesin_cetak: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    jenis_mesin_cetak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plate_cetak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    harga_plate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_harga_cetak: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_coating_depan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_coating_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_harga_coating_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_coating_belakang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_coating_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_harga_coating_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_harga_coating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_mesin_coating_depan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_mesin_coating_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_mesin_coating_belakang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_mesin_coating_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pons_insheet: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_jenis_pons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_jenis_pons: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_mesin_pons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    nama_mesin_pons: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_pisau: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ongkos_pons: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "no",
    },
    ongkos_pons_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_satuan_ongkos_pons: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_harga_ongkos_pons: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lipat: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "no",
    },
    id_mesin_lipat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    nama_mesin_lipat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_lipat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_lipat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    potong_jadi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "no",
    },
    qty_potong: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_potong_jadi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    finishing_insheet: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_lem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_harga_lem: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    id_mesin_finishing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    nama_mesin_finishing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_foil_manual: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spot_foil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_spot_foil_manual: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_polimer_manual: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    panjang_packaging: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lebar_packaging: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    no_packaging: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_kirim: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_packaging: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_pengiriman: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jenis_packing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_packing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_packing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_packing: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_packing: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_produksi: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    profit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    profit_harga: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    jumlah_harga_jual: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    ppn: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_ppn: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    diskon: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_diskon: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    total_harga: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    harga_satuan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_harga_satuan_customer: {
      type: DataTypes.DECIMAL(30, 6),
      allowNull: true,
    },
    keterangan_kerja: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    keterangan_harga: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note_kabag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_kalkulasi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "normal",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    is_io_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_okp_done: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//~~start~~//
Users.hasMany(Kalkulasi, {
  foreignKey: "id_user_create",
  as: "kalkulasi_create",
});
Kalkulasi.belongsTo(Users, {
  foreignKey: "id_user_create",
  as: "user_create",
});
//~~end~~//

//~~start~~//
Users.hasMany(Kalkulasi, {
  foreignKey: "id_user_approve",
  as: "kalkulasi_approve",
});
Kalkulasi.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
//~~end~~//

//~~start~~//
MasterCustomer.hasMany(Kalkulasi, {
  foreignKey: "id_customer",
  as: "kalkulasi",
});
Kalkulasi.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});
//~~end~~//

//~~start~~//
MasterMarketing.hasMany(Kalkulasi, {
  foreignKey: "id_marketing",
  as: "kalkulasi",
});
Kalkulasi.belongsTo(MasterMarketing, {
  foreignKey: "id_marketing",
  as: "marketing",
});
//~~end~~//

//~~start~~//
MasterProduk.hasMany(Kalkulasi, {
  foreignKey: "id_produk",
  as: "kalkulasi",
});
Kalkulasi.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "produk",
});
//~~end~~//

//~~start~~//
MasterHargaPengiriman.hasMany(Kalkulasi, {
  foreignKey: "id_area_pengiriman",
  as: "kalkulasi",
});
Kalkulasi.belongsTo(MasterHargaPengiriman, {
  foreignKey: "id_area_pengiriman",
  as: "pengiriman",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_kertas",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_kertas",
  as: "kertas",
});
//~~end~~//

//~~start~~//
MasterMesinTahapan.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_potong",
});
Kalkulasi.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_potong",
  as: "mesin_potong",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_jenis_mesin_cetak",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_jenis_mesin_cetak",
  as: "data_jenis_mesin_cetak",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_coating_depan",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_coating_depan",
  as: "coating_depan",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_coating_belakang",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_coating_belakang",
  as: "coating_belakang",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_coating_depan",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_mesin_coating_depan",
  as: "mesin_coating_depan",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_coating_belakang",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_mesin_coating_belakang",
  as: "mesin_coating_belakang",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_jenis_pons",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_jenis_pons",
  as: "jenis_pons",
});
//~~end~~//

//~~start~~//
MasterMesinTahapan.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_pons",
});
Kalkulasi.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_pons",
  as: "mesin_pons",
});
//~~end~~//

//~~start~~//
MasterMesinTahapan.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_lipat",
});
Kalkulasi.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_lipat",
  as: "mesin_lipat",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_lem",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_lem",
  as: "lem",
});
//~~end~~//

//~~start~~//
MasterMesinTahapan.hasMany(Kalkulasi, {
  foreignKey: "id_mesin_finishing",
});
Kalkulasi.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_finishing",
  as: "mesin_finishing",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(Kalkulasi, {
  foreignKey: "id_packing",
});
Kalkulasi.belongsTo(MasterBarang, {
  foreignKey: "id_packing",
  as: "packing",
});
//~~end~~//

module.exports = Kalkulasi;
