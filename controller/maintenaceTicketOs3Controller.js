const { Op } = require("sequelize");
const TicketOs3 = require("../model/maintenanceTicketOs3Model");
const Users = require("../model/userModel");
const Mesin = require("../model/masterData/masterMesinModel");
const MasterMesin = require("../model/masterData/masterMesinModel");
const PointPm1 = require("../model/mtc/preventive/pm1/pointPm1");
const TaskPm1 = require("../model/mtc/preventive/pm1/taskPm1");
const TicketPm1 = require("../model/mtc/preventive/pm1/ticketPm1");
const TaskPm2 = require("../model/mtc/preventive/pm2/taskPm2");
const PointPm2 = require("../model/mtc/preventive/pm2/pointPm2");
const TicketPm2 = require("../model/mtc/preventive/pm2/ticketPm2");
const TaskPm3 = require("../model/mtc/preventive/pm3/taskPm3");
const PointPm3 = require("../model/mtc/preventive/pm3/pointPm3");
const TicketPm3 = require("../model/mtc/preventive/pm3/ticketPm3");
const ProsesMtcOs3 = require("../model/mtc/prosesMtcOs3");
const MasalahSparepart = require("../model/mtc/sparepartProblem");

const ticketOs3Controller = {
  getTicketOs3: async (req, res) => {
    try {
      const {
        mesin,
        id_eksekutor,
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
        start_date,
        end_date,
        limit,
        page,
        search,
      } = req.query;

      let options = {
        include: null,
      };
      let obj = {};
      let objEksekutor = {};
      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (search) {
        obj = {
          [Op.or]: [{ sumber: { [Op.like]: `%${search}%` } }],
        };
      }

      if (status_tiket) obj.status_tiket = status_tiket;
      if (tanggal) obj.tanggal = tanggal;
      if (mesin) obj.nama_mesin = mesin;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
      if (tgl_mtc) obj.tgl_mtc = tgl_mtc;
      if (nama_analisis_mtc) obj.nama_analisis_mtc = nama_analisis_mtc;
      if (skor_mtc) obj.skor_mtc = skor_mtc;
      if (waktu_selesai_mtc) obj.waktu_selesai_mtc = waktu_selesai_mtc;
      if (start_date && end_date) {
        obj.createdAt = {
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

      if (id_eksekutor) objEksekutor.id_eksekutor = id_eksekutor;

      options.where = obj;
      //console.log(obj);
      options.order = [["createdAt", "DESC"]];

      if (id_eksekutor) {
        options.include = [
          {
            model: PointPm1,
            as: "point_pm1",
            include: [
              {
                model: TaskPm1,
              },
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
                model: TaskPm2,
              },
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
                model: TaskPm3,
              },
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
            where: objEksekutor,
            include: [
              {
                model: MasalahSparepart,
              },
              {
                model: Users,
                as: "user_eksekutor",
              },
            ],
          },
        ];
      } else {
        options.include = [
          {
            model: PointPm1,
            as: "point_pm1",
            include: [
              {
                model: TaskPm1,
              },
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
                model: TaskPm2,
              },
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
                model: TaskPm3,
              },
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
                model: MasalahSparepart,
              },
              {
                model: Users,
                as: "user_eksekutor",
              },
            ],
          },
        ];
      }
      if (page && limit) {
        options.limit = parseInt(limit);
        options.offset = parseInt(offset);
      }
      const data = await TicketOs3.count(options);
      const response = await TicketOs3.findAll(options);

      res.status(200).json({
        total_page: Math.ceil(data / limit),
        data: response,
        offset: page,
        limit: limit,
      });
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
