const { Sequelize, where } = require("sequelize");
const { Op } = require("sequelize");
const MasterMesin = require("../../../model/masterData/masterMesinModel");
const MasterPointPm2 = require("../../../model/masterData/mtc/preventive/pm2/inspenctionPoinPm2Model");
const MasterTaskPm2 = require("../../../model/masterData/mtc/preventive/pm2/inspectionTaskPm2Model");
const TicketPm2 = require("../../../model/mtc/preventive/pm2/ticketPm2");
const PointPm2 = require("../../../model/mtc/preventive/pm2/pointPm2");
const TaskPm2 = require("../../../model/mtc/preventive/pm2/taskPm2");
const Users = require("../../../model/userModel");
const TicketOs3 = require("../../../model/maintenanceTicketOs3Model");

const Pm2Controller = {
  getPm2: async (req, res) => {
    const {
      nama_mesin,
      id_mesin,
      id_inspector,
      start_date,
      end_date,
      tgl,
      status,
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
    if (tgl) {
      const currentDate = new Date();

      const startOfWeek = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - (currentDate.getDay() - 1)
      );

      const endOfWeek = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate() + 6
      );

      //console.log(startOfWeek, endOfWeek);

      obj.tgl = {
        [Op.between]: [startOfWeek, endOfWeek],
      };
    }

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
        const length_data = await TicketPm2.count({ where: obj });
        const response = await TicketPm2.findAll({
          where: obj,
          order: des,
          include: [
            {
              model: Users,
              as: "inspector",
            },

            {
              model: MasterMesin,
              as: "mesin",
            },
            {
              model: PointPm2,
              attributes: ["hasil"],
              required: false,
            },
            {
              model: PointPm2,
              as: "point_pm2",
              attributes: ["hasil"],
              where: {
                hasil: {
                  [Op.in]: ["jelek", "warning", "tidak terpasang"], // Hanya sub tiket dengan status progress dan pending
                },
              },
              required: false,
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await TicketPm2.findAll({
          where: obj,
          order: des,
          include: [
            {
              model: Users,
              as: "inspector",
            },

            {
              model: MasterMesin,
              as: "mesin",
            },
            {
              model: PointPm2,
              attributes: ["hasil"],
              required: false,
            },
            {
              model: PointPm2,
              as: "point_pm2",
              attributes: ["hasil"],
              where: {
                hasil: {
                  [Op.in]: ["jelek", "warning", "tidak terpasang"], // Hanya sub tiket dengan status progress dan pending
                },
              },
              required: false,
            },
          ],
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPm2ById: async (req, res) => {
    try {
      const response = await TicketPm2.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: PointPm2,
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
                model: TaskPm2,
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

  createTicketPm2: async (req, res) => {
    try {
      const masterMesin = await MasterMesin.findAll();

      for (let i = 0; i < masterMesin.length; i++) {
        const idMesin = masterMesin[i].id;
        const namaMesin = masterMesin[i].nama_mesin;
        if (namaMesin != "OPERASIONAL") {
          const ticket = await TicketPm2.create({
            id_mesin: idMesin,
            nama_mesin: namaMesin,
            tgl: new Date(),
          });
          const masterPoint = await MasterPointPm2.findAll({
            where: { id_mesin: idMesin },
            include: [
              {
                model: MasterTaskPm2,
              },
            ],
          });

          for (let ii = 0; ii < masterPoint.length; ii++) {
            const point = await PointPm2.create({
              id_ticket: ticket.id,
              inspection_point: masterPoint[ii].inspection_point,
              category: masterPoint[ii].category,
              tgl: new Date(),
            });

            for (
              let iii = 0;
              iii < masterPoint[ii].ms_inspection_task_pm2s.length;
              iii++
            ) {
              const task = await TaskPm2.create({
                id_inspection_poin: point.id,
                task: masterPoint[ii].ms_inspection_task_pm2s[iii].task,
                acceptance_criteria:
                  masterPoint[ii].ms_inspection_task_pm2s[iii]
                    .acceptance_criteria,
                method: masterPoint[ii].ms_inspection_task_pm2s[iii].method,
                tools: masterPoint[ii].ms_inspection_task_pm2s[iii].tools,
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

  createPointPm2: async (req, res) => {
    const { id_ticket, inspection_point } = req.body;
    if (!id_ticket || !inspection_point)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const point = await PointPm2.create({
        id_ticket: id_ticket,
        inspection_point: inspection_point.inspection_point,
        category: inspection_point.category,
        tgl: new Date(),
      });

      for (let i = 0; i < inspection_point.sub_inspection.length; i++) {
        const task = await TaskPm2.create({
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

  updateTaskPm2: async (req, res) => {
    const _id = req.params.id;
    const { hasil, file, catatan } = req.body;

    let obj = {};
    if (hasil) obj.hasil = hasil;
    if (file) obj.file = file;
    if (catatan) obj.catatan = catatan;

    try {
      const response = await PointPm2.update(obj, { where: { id: _id } });
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  startTaskPm2: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await PointPm2.update(
        { waktu_mulai: new Date() },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  stopTaskPm2: async (req, res) => {
    const _id = req.params.id;
    const { waktu_selesai, lama_pengerjaan, hasil, catatan, file } = req.body;
    if (!lama_pengerjaan || !waktu_selesai)
      return res.status(401).json({ msg: "incomplite data" });
    if (!catatan) return res.status(401).json({ msg: "catatan wajib di isi" });
    if (!hasil) return res.status(401).json({ msg: "hasil wajib di isi" });
    try {
      const response = await PointPm2.update(
        {
          waktu_selesai: waktu_selesai,
          lama_pengerjaan: lama_pengerjaan,
          hasil,
          catatan,
          file,
        },
        { where: { id: _id } }
      );
      const dataPoint = await PointPm2.findOne({
        where: { id: _id },
        attributes: ["id", "id_ticket", "hasil", "category"],
      });

      //console.log(dataPoint.hasil);

      if (dataPoint.hasil == "jelek" || "tidak terpasang") {
        //console.log(1);
        const ticketPm2 = await TicketPm2.findOne({
          where: { id: dataPoint.id_ticket },
        });
        if (dataPoint.category != "man") {
          const ticketOs3 = await TicketOs3.create({
            id_point_pm2: dataPoint.id,
            nama_mesin: ticketPm2.nama_mesin,
            sumber: "pm2",
            status_tiket: "open",
          });
        }
      }
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  responseTicketPm2: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await TicketPm2.update(
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

  doneTicketPm2: async (req, res) => {
    const _id = req.params.id;
    const { catatan, id_leader, id_supervisor, id_ka_bag } = req.body;
    if (!catatan) return res.status(400).json({ msg: "catatan wajib di isi" });
    try {
      const checkPointDone = await PointPm2.findAll({
        where: { id_ticket: _id, hasil: null },
      });
      if (checkPointDone.length > 0)
        return res.status(400).json({ msg: "Point PM Wajib Di isi Semua" });
      const response = await TicketPm2.update(
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

module.exports = Pm2Controller;
