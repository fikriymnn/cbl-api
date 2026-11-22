"use strict";

// index no_io: pengecekan tiket sebelumnya / revisi standar warna berdasarkan no_io
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("pembuatan_standar_warna", ["no_io"], {
      name: "idx_pembuatan_standar_warna_no_io",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "pembuatan_standar_warna",
      "idx_pembuatan_standar_warna_no_io",
    );
  },
};
