const TicketOs3 = require("../model/maintenanceTicketOs3Model");
const Users = require("../model/userModel");
const Mesin = require("../model/masterData/masterMesinModel");
const MasterMesin = require("../model/masterData/masterMesinModel");
const PointPm1 = require("../model/mtc/preventive/pm1/pointPm1");
const TicketPm1 = require("../model/mtc/preventive/pm1/ticketPm1");
const PointPm2 = require("../model/mtc/preventive/pm2/pointPm2");
const TicketPm2 = require("../model/mtc/preventive/pm2/ticketPm2");
const PointPm3 = require("../model/mtc/preventive/pm3/pointPm3");
const TicketPm3 = require("../model/mtc/preventive/pm3/ticketPm3");
const ProsesMtcOs3 = require("../model/mtc/prosesMtcOs3");

const ticketOs3Controller = {
  getTicketOs3: async (req, res) => {
    try {
      const {
        nama_mesin,
        id_inspector,
        id_leader,
        id_supervisor,
        id_kabag_mtc,
        tanggal,
        catatan,
        bagian_tiket,
        status_tiket,
        waktu_selesai_mtc,
        waktu_selesai,
        tgl_mtc,
        skor_mtc,
        nama_analisis_mtc,
      } = req.query;

      let obj = {};
      if (status_tiket) obj.status_tiket = status_tiket;
      if (tanggal) obj.tanggal = tanggal;
      if (nama_mesin) obj.nama_mesin = nama_mesin;

      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
      if (tgl_mtc) obj.tgl_mtc = tgl_mtc;
      if (nama_analisis_mtc) obj.nama_analisis_mtc = nama_analisis_mtc;
      if (skor_mtc) obj.skor_mtc = skor_mtc;
      if (waktu_selesai_mtc) obj.waktu_selesai_mtc = waktu_selesai_mtc;

      const response = await TicketOs3.findAll({
        where: obj,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: PointPm1,
            as: "point_pm1",
            include: [
              {
                model: TicketPm1,
                include: [
                  {
                    model: Users,
                    as: "inspector",
                  },
                ],
              },
            ],
          },
          {
            model: PointPm2,
            as: "point_pm2",
            include: [
              {
                model: TicketPm2,
                include: [
                  {
                    model: Users,
                    as: "inspector",
                  },
                ],
              },
            ],
          },
          {
            model: PointPm3,
            as: "point_pm3",
            include: [
              {
                model: TicketPm3,
                include: [
                  {
                    model: Users,
                    as: "inspector",
                  },
                ],
              },
            ],
          },
          {
            model: ProsesMtcOs3,
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

  getTicketOs3ById: async (req, res) => {
    try {
      const response = await TicketOs3.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Users,
            as: "leader",
            attributes: ["id", "uuid", "nama", "email", "role", "status"],
          },
          {
            model: Users,
            as: "supervisor",
            attributes: ["id", "uuid", "nama", "email", "role", "status"],
          },
          {
            model: Users,
            as: "inspector",
            attributes: ["id", "uuid", "nama", "email", "role", "status"],
          },
          {
            model: Users,
            as: "kabag_mtc",
            attributes: ["id", "uuid", "nama", "email", "role", "status"],
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createTicket: async (req, res) => {
    const { kabag_mtc } = req.body;
    if (!kabag_mtc) {
      res.status(400).json({
        msg: "Please add kabag_mtc value to request body",
      });
    }
    try {
      const data_mesin = await MasterMesin.findAll();
      if (data_mesin) {
        let arr = [];
        let i = 0;
        while (i < data_mesin.length) {
          arr.push({
            nama_mesin: data_mesin[i].nama_mesin,
            tanggal: new Date(),
            status_ticket: "pending",
            bagian_tiket: "incoming",
            kabag_mtc,
          });
          i++;
        }
        if (i == data_mesin.length - 1) {
          await TicketOs3.bulkCreate(arr);
          res.status(200).json({ msg: "Ticket PM 1 create Successfuly" });
        }
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateTicketOs3: async (req, res) => {
    const _id = req.params.id;
    const {
      nama_mesin,
      id_inspector,
      id_leader,
      id_supervisor,
      id_kabag_mtc,
      tanggal,
      catatan,
      bagian_tiket,
      status_tiket,
      waktu_respon,
      waktu_selesai_mtc,
      waktu_selesai,
      tgl_mtc,
      skor_mtc,
      cara_perbaikan,
      kode_analisis_mtc,
      nama_analisis_mtc,
    } = req.body;

    let obj = {};
    if (nama_mesin) obj.mesin = nama_mesin;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (id_inspector) obj.id_inspector = id_inspector;
    if (id_leader) obj.id_leader = id_leader;
    if (id_supervisor) obj.id_supervisor = id_supervisor;
    if (id_kabag_mtc) obj.id_kabag_mtc = id_kabag_mtc;
    if (tanggal) obj.tanggal = tanggal;
    if (catatan) obj.catatan = catatan;
    if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
    if (waktu_respon) obj.waktu_respon = waktu_respon;
    if (waktu_selesai_mtc) obj.waktu_selesai_mtc = waktu_selesai_mtc;
    if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
    if (tgl_mtc) obj.tgl_mtc = tgl_mtc;
    if (skor_mtc) obj.skor_mtc = skor_mtc;
    if (cara_perbaikan) obj.cara_perbaikan = cara_perbaikan;
    if (kode_analisis_mtc) obj.kode_analisis_mtc = kode_analisis_mtc;
    if (nama_analisis_mtc) obj.nama_analisis_mtc = nama_analisis_mtc;

    try {
      await TicketOs3.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Ticket update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  deleteTicketOs3: async (req, res) => {
    const _id = req.params.id;
    try {
      await TicketOs3.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Ticket PM 1 delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = ticketOs3Controller;
