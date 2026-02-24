const db = require("../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const KendalaLkh = require("../../../model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("../../../model/kendalaLkh/kendalaLkhDepartmentModel");

const KendalaLkhService = {
  createTiketLkh: async (
    kode_lkh,
    id_jo,
    no_jo,
    nama_produk,
    no_io,
    no_so,
    nama_customer,
    mesin,
    operator,
    jenis_kendala,
    id_kendala,
    kode_kendala,
    nama_kendala,
    waktu_mulai,
    waktu_selesai,
    maksimal_kedatangan_tiket,
    maksimal_periode_kedatangan_tiket,
    maksimal_waktu_pengerjaan,
    data_department,
    transaction = null,
  ) => {
    const t = transaction || (await db.transaction());
    try {
      const monthNames = [
        "JANUARI",
        "FEBRUARY",
        "MARET",
        "APRIL",
        "MEI",
        "JUNI",
        "JULI",
        "AGUSTUS",
        "SEPTEMBER",
        "OKTOBER",
        "NOVEMBER",
        "DESEMBER",
      ];
      const now = new Date();
      const month = now.getMonth() + 1; // Add 1 to get 1-based month value
      const year = now.getFullYear();
      const monthName = monthNames[month - 1];

      const kendala = await KendalaLkh.findAll({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("YEAR", Sequelize.col("createdAt")),
              year,
            ),
            Sequelize.where(
              Sequelize.fn("MONTH", Sequelize.col("createdAt")),
              month,
            ),
          ],
        },
      });

      const kendalaLength = kendala.length + 1;

      const strNumber = kendalaLength.toString();

      // Pad the beginning with leading zeros
      const paddedNumber = strNumber.padStart(4, "0");
      const kodeTicket =
        paddedNumber + "/" + "MI" + "/" + monthName + "/" + year;

      const resKendalaLkh = await KendalaLkh.create(
        {
          id_jo: id_jo,
          no_jo: no_jo,
          nama_produk: nama_produk,
          no_io: no_io,
          no_so: no_so,
          kode_lkh: kode_lkh,
          nama_customer: nama_customer,
          mesin: mesin,
          operator: operator,
          jenis_kendala: jenis_kendala,
          id_kendala: id_kendala,
          kode_kendala: kode_kendala,
          nama_kendala: nama_kendala,
          kode_ticket: kodeTicket,
          waktu_mulai,
          waktu_selesai,
          maksimal_kedatangan_tiket,
          maksimal_periode_kedatangan_tiket,
          maksimal_waktu_pengerjaan,
        },
        { transaction: t },
      );

      for (let index = 0; index < data_department.length; index++) {
        const department = await KendalaLkhDepartment.create(
          {
            id_kendala_lkh: resKendalaLkh.id,
            id_department: data_department[index].id_department,
            department: data_department[index].department,
          },
          { transaction: t },
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create tiket mtc success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = KendalaLkhService;
