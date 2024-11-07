const { Sequelize, where } = require("sequelize");
const { Op } = require("sequelize");
const MasterMesin = require("../../../model/masterData/masterMesinModel");
const MasterPointPm1 = require("../../../model/masterData/mtc/preventive/pm1/inspenctionPoinPm1Model");
const MasterTaskPm1 = require("../../../model/masterData/mtc/preventive/pm1/inspectionTaskPm1Model");
const TicketPm1 = require("../../../model/mtc/preventive/pm1/ticketPm1");
const PointPm1 = require("../../../model/mtc/preventive/pm1/pointPm1");
const TaskPm1 = require("../../../model/mtc/preventive/pm1/taskPm1");
const Users = require("../../../model/userModel");
const TicketOs3 = require("../../../model/maintenanceTicketOs3Model");
const moment = require("moment");

const Pm1Controller = {
  getPm1: async (req, res) => {
    const {
      id_mesin,
      nama_mesin,
      id_inspector,
      start_date,
      end_date,
      status,
      tgl,
      limit,
      page,
    } = req.query;

    let obj = {};
    let des = [["createdAt", "DESC"]];
    let offset = (page - 1) * limit;

    if (id_mesin) obj.id_mesin = id_mesin;
    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (status) obj.status = status;
    if (id_inspector) obj.id_inspector = id_inspector;
    if (tgl)
      obj.tgl = {
        [Op.between]: [
          new Date(tgl).setHours(0, 0, 0, 0),
          new Date(tgl).setHours(23, 59, 59, 999),
        ],

        //[dateNow, dateNowEnd],
      };
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

    try {
      if (page && limit) {
        const length_data = await TicketPm1.count({ where: obj });
        const response = await TicketPm1.findAll({
          where: obj,
          order: des,
          include: [
            {
              model: Users,
              as: "inspector",
            },
            {
              model: Users,
              as: "leader",
            },
            {
              model: Users,
              as: "supervisor",
            },
            {
              model: Users,
              as: "ka_bag",
            },
            {
              model: MasterMesin,
              as: "mesin",
            },
            {
              model: PointPm1,
              attributes: ["hasil"],
            },
            {
              model: PointPm1,
              as: "point_pm1",
              attributes: ["hasil"],
              where: {
                hasil: {
                  [Op.in]: ["jelek", "warning", "tidak terpasang"], // Hanya sub tiket dengan status progress dan pending
                },
              },
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await TicketPm1.findAll({
          order: des,
          include: [
            {
              model: Users,
              as: "inspector",
            },
            {
              model: Users,
              as: "leader",
            },
            {
              model: Users,
              as: "supervisor",
            },
            {
              model: Users,
              as: "ka_bag",
            },
            {
              model: MasterMesin,
              as: "mesin",
            },
            // {
            //   model: PointPm1,
            //   attributes: ["hasil"],
            // },
            // {
            //   model: PointPm1,
            //   as: "point_pm1",
            //   attributes: ["hasil"],
            //   where: {
            //     hasil: {
            //       [Op.in]: ["jelek", "warning", "tidak terpasang"], // Hanya sub tiket dengan status progress dan pending
            //     },
            //   },
            // },
          ],
          where: obj,
        });
        console.log(obj);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPm1ById: async (req, res) => {
    try {
      const response = await TicketPm1.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: PointPm1,
            attributes: [
              "id",
              "lama_pengerjaan",
              "inspection_point",
              "category",
              "id_ticket",
              "tgl",
              "hasil",
              "file",
              "catatan",
              "waktu_mulai",
              "waktu_selesai",
            ],
            include: [
              {
                model: TaskPm1,
              },
            ],
          },

          {
            model: Users,
            as: "inspector",
          },
          {
            model: Users,
            as: "leader",
          },
          {
            model: Users,
            as: "supervisor",
          },
          {
            model: Users,
            as: "ka_bag",
          },
          {
            model: MasterMesin,
            as: "mesin",
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createTicketPm1: async (req, res) => {
    try {
      const masterMesin = await MasterMesin.findAll();
      console.log(masterMesin);

      for (let i = 0; i < masterMesin.length; i++) {
        const idMesin = masterMesin[i].id;
        const namaMesin = masterMesin[i].nama_mesin;
        if (namaMesin != "OPERASIONAL") {
          const ticket = await TicketPm1.create({
            id_mesin: idMesin,
            nama_mesin: namaMesin,
            tgl: new Date(),
          });
          console.log(ticket);
          const masterPoint = await MasterPointPm1.findAll({
            where: { id_mesin: idMesin },
            include: [
              {
                model: MasterTaskPm1,
              },
            ],
          });

          for (let ii = 0; ii < masterPoint.length; ii++) {
            const point = await PointPm1.create({
              id_ticket: ticket.id,
              inspection_point: masterPoint[ii].inspection_point,
              category: masterPoint[ii].category,
              tgl: new Date(),
            });

            for (
              let iii = 0;
              iii < masterPoint[ii].ms_inspection_task_pm1s.length;
              iii++
            ) {
              const task = await TaskPm1.create({
                id_inspection_poin: point.id,
                task: masterPoint[ii].ms_inspection_task_pm1s[iii].task,
                acceptance_criteria:
                  masterPoint[ii].ms_inspection_task_pm1s[iii]
                    .acceptance_criteria,
                method: masterPoint[ii].ms_inspection_task_pm1s[iii].method,
                tools: masterPoint[ii].ms_inspection_task_pm1s[iii].tools,
              });
            }
          }
        }
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPointPm1: async (req, res) => {
    const { id_ticket, inspection_point } = req.body;
    if (!id_ticket || !inspection_point)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const point = await PointPm1.create({
        id_ticket: id_ticket,
        inspection_point: inspection_point.inspection_point,
        category: inspection_point.category,
        tgl: new Date(),
      });

      for (let i = 0; i < inspection_point.sub_inspection.length; i++) {
        const task = await TaskPm1.create({
          id_inspection_poin: point.id,
          task: inspection_point.sub_inspection[i].task,
          acceptance_criteria:
            inspection_point.sub_inspection[i].acceptance_criteria,
          method: inspection_point.sub_inspection[i].method,
          tools: inspection_point.sub_inspection[i].tools,
        });
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateTaskPm1: async (req, res) => {
    const _id = req.params.id;
    const { hasil, file, catatan } = req.body;

    let obj = {};
    if (hasil) obj.hasil = hasil;
    if (file) obj.file = file;
    if (catatan) obj.catatan = catatan;

    try {
      const response = await PointPm1.update(obj, { where: { id: _id } });
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  startTaskPm1: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await PointPm1.update(
        { waktu_mulai: new Date() },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  stopTaskPm1: async (req, res) => {
    const _id = req.params.id;
    const { waktu_selesai, lama_pengerjaan, hasil, catatan, file } = req.body;
    console.log(req.body);
    if (!lama_pengerjaan || !waktu_selesai)
      return res.status(401).json({ msg: "incomplite data" });
    if (!catatan) return res.status(401).json({ msg: "catatan wajib di isi" });
    if (!hasil) return res.status(401).json({ msg: "hasil wajib di isi" });

    try {
      const response = await PointPm1.update(
        {
          waktu_selesai: waktu_selesai,
          lama_pengerjaan: lama_pengerjaan,
          hasil,
          catatan,
          file,
        },
        { where: { id: _id } }
      );
      const dataPoint = await PointPm1.findOne({
        where: { id: _id },
        attributes: ["id", "id_ticket", "hasil", "category"],
      });

      if (dataPoint.hasil == "jelek" || dataPoint.hasil == "tidak terpasang") {
        const ticketPm1 = await TicketPm1.findOne({
          where: { id: dataPoint.id_ticket },
        });
        if (dataPoint.category != "man") {
          await TicketOs3.create({
            id_point_pm1: dataPoint.id,
            nama_mesin: ticketPm1.nama_mesin,
            sumber: "pm1",
            status_tiket: "open",
          });
        }
      }
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  responseTicketPm1: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await TicketPm1.update(
        {
          waktu_mulai: new Date(),
          status: "on progres",
          id_inspector: req.user.id,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  doneTicketPm1: async (req, res) => {
    const _id = req.params.id;
    const { catatan, id_leader, id_supervisor, id_ka_bag } = req.body;

    if (!catatan) return res.status(400).json({ msg: "catatan wajib di isi" });

    try {
      const checkPointDone = await PointPm1.findAll({
        where: { id_ticket: _id, hasil: null },
      });
      if (checkPointDone.length > 0)
        return res.status(400).json({ msg: "Point PM Wajib Di isi Semua" });
      const response = await TicketPm1.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          catatan,
          id_leader,
          id_supervisor,
          id_ka_bag,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = Pm1Controller;
