const db = require("../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const Ticket = require("../../../model/maintenaceTicketModel");
const TicketDepartment = require("../../../model/maintenanceTicketDepartmentModel");

const TicketMtcOs2Service = {
  creteTicketMtcOs2Service: async (
    kode_lkh,
    id_jo,
    no_jo,
    nama_produk,
    no_io,
    no_so,
    nama_customer,
    qty,
    qty_druk,
    spek,
    proses,
    mesin,
    bagian,
    operator,
    tgl,
    jenis_kendala,
    id_kendala,
    nama_kendala,
    unit,
    bagian_mesin,
    maksimal_kedatangan_tiket,
    maksimal_periode_kedatangan_tiket,
    maksimal_waktu_pengerjaan,
    data_department,
    transaction = null
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

      const ticket = await Ticket.findAll({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("YEAR", Sequelize.col("createdAt")),
              year
            ),
            Sequelize.where(
              Sequelize.fn("MONTH", Sequelize.col("createdAt")),
              month
            ),
          ],
        },
      });

      ticketLength = ticket.length + 1;

      const strNumber = ticketLength.toString();

      // Pad the beginning with leading zeros
      const paddedNumber = strNumber.padStart(4, "0");
      const kodeTicket =
        paddedNumber + "/" + "MR" + "/" + monthName + "/" + year;

      const dataTicket = await Ticket.create(
        {
          id_jo: id_jo,
          no_jo: no_jo,
          nama_produk: nama_produk,
          no_io: no_io,
          no_so: no_so,
          kode_lkh: kode_lkh,
          nama_customer: nama_customer,
          qty: qty,
          qty_druk: qty_druk,
          spek: spek,
          proses: proses,
          mesin: mesin,
          bagian: bagian,
          operator: operator,
          tgl: new Date(),
          jenis_kendala: jenis_kendala,
          id_kendala: id_kendala,
          nama_kendala: nama_kendala,
          kode_ticket: kodeTicket,
          unit: unit,
          bagian_mesin: bagian_mesin,
          maksimal_kedatangan_tiket,
          maksimal_periode_kedatangan_tiket,
          maksimal_waktu_pengerjaan,
        },
        { transaction: t }
      );

      if (data_department) {
        for (let index = 0; index < data_department.length; index++) {
          const department = await TicketDepartment.create(
            {
              id_ticket: dataTicket.id,
              id_department: data_department[index].id_department,
              department: data_department[index].department,
            },
            { transaction: t }
          );
        }
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

module.exports = TicketMtcOs2Service;
