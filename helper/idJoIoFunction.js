const JobOrder = require("../model/ppic/jobOrder/jobOrderModel");
const IoModel = require("../model/marketing/io/ioModel");

const AKTIF_DULU = [
  ["is_active", "DESC"],
  ["id", "DESC"],
];

// Sumber NCR tidak semuanya punya id_jo dan id_io, jadi dicari dari nomornya.
const isiIdJoIo = async (tiket, transaction) => {
  if (tiket.no_jo) {
    const jo = await JobOrder.findOne({
      attributes: ["id", "id_io"],
      where: { no_jo: tiket.no_jo },
      order: AKTIF_DULU,
      transaction,
    });
    if (jo) {
      tiket.id_jo = jo.id;
      tiket.id_io = jo.id_io;
    }
  }

  if (tiket.no_io && !tiket.id_io) {
    const io = await IoModel.findOne({
      attributes: ["id"],
      where: { no_io: tiket.no_io },
      order: AKTIF_DULU,
      transaction,
    });
    if (io) tiket.id_io = io.id;
  }
};

module.exports = { isiIdJoIo };
