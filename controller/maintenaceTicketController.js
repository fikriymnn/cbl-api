const { Op } = require("sequelize");
const Ticket = require("../model/maintenaceTicketModel");
const Users = require("../model/userModel");
const userActionMtc = require("../model/mtc/userActionMtc");
const { createMasalahSparepart } = require("./mtc/sparepartProblem");
const MasalahSparepart = require("../model/mtc/sparepartProblem");
const StokSparepart = require("../model/mtc/stokSparepart");
const MasterSparepart = require("../model/masterData/masterSparepart");
const ProsesMtc = require("../model/mtc/prosesMtc");

const ticketController = {
  getTicket: async (req, res) => {
    try {
      const {
        status_tiket,
        type_mtc,
        jenis_kendala,
        nama_customer,
        bagian_tiket,
        mesin,
        tgl,
        start_date,
        end_date,
      } = req.query;

      let obj = {};
      let des = [];

      if (status_tiket) obj.status_tiket = status_tiket;
      if (type_mtc) obj.type_mtc = type_mtc;
      if (jenis_kendala) obj.jenis_kendala = jenis_kendala;
      if (nama_customer) obj.nama_customer = nama_customer;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;

      if (mesin) obj.mesin = mesin;
      if (tgl) obj.tgl = tgl;
      if (start_date && end_date) {
        obj.tgl = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      } else if (start_date) {
        obj.tgl = {
          [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0), // Set jam startDate ke 00:00:00:00
        };
      } else if (end_date) {
        obj.tgl = {
          [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
        };
      }

      if (bagian_tiket == "os2") {
        des.push("waktu_respon", "DESC");
      } else {
        des.push("createdAt", "DESC");
      }

      const response = await Ticket.findAll({
        where: obj,
        order: [des],
        include: [
          {
            model: ProsesMtc,
            include: [
              {
                model: Users,
                as: "user_eksekutor",
              },
            ],
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getTiketById: async (req, res) => {
    try {
      const response = await Ticket.findOne({
        where: {
          id: req.params.id,
        },

        include: [
          {
            model: Users,
            as: "user_respon_mtc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },

          {
            model: ProsesMtc,
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getTiketUser: async (req, res) => {
    try {
      const response = await Ticket.findAll({
        where: {
          id_eksekutor: req.user.id,
        },

        include: [
          {
            model: Users,
            as: "user_respon_mtc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_eksekutor",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_qc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createTiket: async (req, res) => {
    const {
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
    } = req.body;

    try {
      await Ticket.create({
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
        tgl: tgl,
        jenis_kendala: jenis_kendala,
        id_kendala: id_kendala,
        nama_kendala: nama_kendala,
      }),
        res.status(201).json({ msg: "Ticket create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateTiket: async (req, res) => {
    const _id = req.params.id;
    const {
      bagian_tiket,
      status_tiket,
      waktu_respon,

      tipe_mtc,

      id_qc,
    } = req.body;

    let obj = {};
    if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (waktu_respon) obj.waktu_respon = waktu_respon;
    if (tipe_mtc) obj.tipe_mtc = tipe_mtc;
    if (id_qc) obj.id_qc = id_qc;

    try {
      await Ticket.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Ticket update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // updateTiketTypeMtc: async (req, res) => {
  //   const _id = req.params.id;
  //   const { tipe_mtc } = req.body;
  //   let obj = {}
  //   if(tipe_mtc){
  //     obj.tipe_mtc = tipe_mtc
  //   }

  //   try {
  //      await Ticket.update(obj,{where: {id:_id}}),
  //       res.status(201).json({ msg: "Ticket update Successfuly" });
  //   } catch (error) {
  //     res.status(400).json({ msg: error.message });
  //   }
  // },

  selectMtc: async (req, res) => {
    const _id = req.params.id;
    const { id_eksekutor, id_eksekutor_old, rework } = req.body;

    if (!id_eksekutor || !id_eksekutor_old || rework == null)
      return res.status(404).json({ msg: "incomplite data" });

    if (rework == false) {
      let obj = {
        id_eksekutor: id_eksekutor,
      };
      try {
        await Ticket.update(obj, { where: { id: _id } }),
          await userActionMtc.update(
            { status: "ubah eksekutor" },
            {
              where: {
                id_mtc: id_eksekutor_old,
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
            }
          );
        await userActionMtc.create({
          id_mtc: id_eksekutor,
          id_tiket: _id,
          action: "eksekutor",
          status: "on progress",
        });
        res.status(201).json({ msg: "Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    } else {
      let obj = {
        id_eksekutor_rework: id_eksekutor,
      };
      try {
        await Ticket.update(obj, { where: { id: _id } }),
          await userActionMtc.update(
            { status: "ubah eksekutor rework" },
            {
              where: {
                id_mtc: id_eksekutor_old,
                id_tiket: _id,
                action: "eksekutor rework",
                status: "on progress",
              },
            }
          );
        await userActionMtc.create({
          id_mtc: id_eksekutor,
          id_tiket: _id,
          action: "eksekutor rework",
          status: "on progress",
        });
        res.status(201).json({ msg: "Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    }
  },
};

// cron.schedule("* * * * *", async () => {
//   // Tugas Anda yang akan dijalankan di sini
//   const proses = await ProsesMtc.findAll({
//     where: { status_proses: "monitoring" },
//   });
//   console.log("Tugas ini berjalan setiap menit!");
//   console.log(proses);
// });

module.exports = ticketController;
