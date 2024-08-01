const { Sequelize, where } = require("sequelize");
const { Op } = require("sequelize");
const MasterMesin = require("../../../model/masterData/masterMesinModel");
const MasterPointPm3 = require("../../../model/masterData/mtc/preventive/pm3/inspenctionPoinPm3Model");
const MasterTaskPm3 = require("../../../model/masterData/mtc/preventive/pm3/inspectionTaskPm3Model");
const TicketPm3 = require("../../../model/mtc/preventive/pm3/ticketPm3");
const PointPm3 = require("../../../model/mtc/preventive/pm3/pointPm3");
const TaskPm3 = require("../../../model/mtc/preventive/pm3/taskPm3");
const Users = require("../../../model/userModel");
const TicketOs3 = require("../../../model/maintenanceTicketOs3Model");

const Pm3Controller = {
  getPm3: async (req, res) => {
    const {
      nama_mesin,
      id_inspector,
      start_date,
      end_date,
      tgl,
      thisMonth,
      month,
      year,
      status,
      limit,
      page,
    } = req.query;

    let obj = {};
    let des = [];
    let offset = (page - 1) * limit;
    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (id_inspector) obj.id_inspector = id_inspector;
    if (status) obj.status = status;
    if (thisMonth) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      console.log(firstDayOfMonth, lastDayOfMonth);

      obj.tgl_approve_from = {
        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
      };
    }

    if (month) {
      const today = new Date();
      const year = today.getFullYear();
      const monthIndex = month; // Bulan  dalam JavaScript dihitung dari 0

      const firstDayOfMonth = new Date(year, monthIndex - 1, 1);
      const lastDayOfMonth = new Date(year, monthIndex, 0);
      console.log(month);

      obj.tgl_approve_from = {
        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
      };
    }

    if (year) {
      const today = new Date();
      const currentYear = today.getFullYear();

      obj.tgl_approve_from = {
        [Op.gte]: new Date(`${currentYear}-01-01`),
        [Op.lte]: new Date(`${currentYear}-12-31`),
      };
    }

    if (start_date && end_date) {
      obj.tgl_approve_from = {
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
        const length_data = await TicketPm3.count({ where: obj });
        const response = await TicketPm3.findAll({
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
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await TicketPm3.findAll({
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
          ],
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPm3RequestDate: async (req, res) => {
    const { nama_mesin, id_inspector, start_date, end_date, tgl } = req.query;

    let obj = {
      tgl_approve_from: null,
      tgl_approve_to: null,
    };
    let des = [];
    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (id_inspector) obj.id_inspector = id_inspector;
    // if (tgl) {
    //   const currentDate = new Date();

    //   const startOfWeek = new Date(
    //     currentDate.getFullYear(),
    //     currentDate.getMonth(),
    //     currentDate.getDate() - (currentDate.getDay() - 2)
    //   );
    //   console.log(startOfWeek);
    //   const endOfWeek = new Date(
    //     startOfWeek.getFullYear(),
    //     startOfWeek.getMonth(),
    //     startOfWeek.getDate() + 6
    //   );

    //   obj.tgl = {
    //     [Op.between]: [startOfWeek, endOfWeek],
    //   };
    // }

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
      const response = await TicketPm3.findAll({
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
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPm3ById: async (req, res) => {
    try {
      const response = await TicketPm3.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: PointPm3,
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
                model: TaskPm3,
              },
            ],
          },

          {
            model: Users,
            as: "inspector",
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

  createTicketPm3: async (req, res) => {
    try {
      const masterMesin = await MasterMesin.findAll();

      for (let i = 0; i < masterMesin.length; i++) {
        const idMesin = masterMesin[i].id;
        const namaMesin = masterMesin[i].nama_mesin;
        const ticket = await TicketPm3.create({
          id_mesin: idMesin,
          nama_mesin: namaMesin,
          tgl: new Date(),
        });
        const masterPoint = await MasterPointPm3.findAll({
          where: { id_mesin: idMesin },
          include: [
            {
              model: MasterTaskPm3,
            },
          ],
        });

        for (let ii = 0; ii < masterPoint.length; ii++) {
          const point = await PointPm3.create({
            id_ticket: ticket.id,
            inspection_point: masterPoint[ii].inspection_point,
            category: masterPoint[ii].category,
            tgl: new Date(),
          });

          for (
            let iii = 0;
            iii < masterPoint[ii].ms_inspection_task_pm3s.length;
            iii++
          ) {
            const task = await TaskPm3.create({
              id_inspection_poin: point.id,
              task: masterPoint[ii].ms_inspection_task_pm3s[iii].task,
              acceptance_criteria:
                masterPoint[ii].ms_inspection_task_pm3s[iii]
                  .acceptance_criteria,
              method: masterPoint[ii].ms_inspection_task_pm3s[iii].method,
              tools: masterPoint[ii].ms_inspection_task_pm3s[iii].tools,
            });
          }
        }
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  submitAllRequestDatePm3: async (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(404).json({ msg: "incomplete data!!" });

    try {
      for (let i = 0; i < data.length; i++) {
        const point = await TicketPm3.update(
          {
            tgl_request_from: data[i].tgl_request_from,
            tgl_request_to: data[i].tgl_request_to,
            tgl_approve_from: data[i].tgl_request_from, //data[i].tgl_approve_from, nanti ganti jadi ini
            tgl_approve_to: data[i].tgl_request_to, //data[i].tgl_approve_to, nanti ganti jadi ini
          },
          { where: { id: data[i].id } }
        );
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestDatePm3: async (req, res) => {
    const _id = req.params.id;
    const { date_from, date_to } = req.body;
    if (!date_from || !date_to)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const point = await TicketPm3.update(
        {
          tgl_request_from: date_from,
          tgl_request_to: date_to,
          tgl_approve_from: date_from,
          tgl_approve_to: date_to,
        },
        { where: { id: _id } }
      );

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPointPm3: async (req, res) => {
    const { id_ticket, inspection_point } = req.body;
    if (!id_ticket || !inspection_point)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const point = await PointPm3.create({
        id_ticket: id_ticket,
        inspection_point: inspection_point.inspection_point,
        category: inspection_point.category,
        tgl: new Date(),
      });

      for (let i = 0; i < inspection_point.sub_inspection.length; i++) {
        const task = await TaskPm3.create({
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

  updateTaskPm3: async (req, res) => {
    const _id = req.params.id;
    const { hasil, file, catatan } = req.body;

    let obj = {};
    if (hasil) obj.hasil = hasil;
    if (file) obj.file = file;
    if (catatan) obj.catatan = catatan;

    try {
      const response = await PointPm3.update(obj, { where: { id: _id } });
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  startTaskPm3: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await PointPm3.update(
        { waktu_mulai: new Date() },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  stopTaskPm3: async (req, res) => {
    const _id = req.params.id;
    const { waktu_selesai, lama_pengerjaan, hasil, catatan, file } = req.body;
    if (!lama_pengerjaan || !waktu_selesai || !hasil)
      return res.status(401).json({ msg: "incomplite data" });
    try {
      const response = await PointPm3.update(
        {
          waktu_selesai: waktu_selesai,
          lama_pengerjaan: lama_pengerjaan,
          hasil,
          catatan,
          file,
        },
        { where: { id: _id } }
      );
      const dataPoint = await PointPm3.findOne({
        where: { id: _id },
        attributes: ["id", "id_ticket", "hasil", "category"],
      });

      if (dataPoint.hasil == "jelek" || dataPoint.hasil == "tidak terpasang") {
        const ticketPm3 = await TicketPm3.findOne({
          where: { id: dataPoint.id_ticket },
        });
        if (dataPoint.category != "man") {
          const ticketOs3 = await TicketOs3.create({
            id_point_pm3: dataPoint.id,
            nama_mesin: ticketPm3.nama_mesin,
            sumber: "pm3",
            status_tiket: "open",
          });
        }
      }
      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  responseTicketPm3: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await TicketPm3.update(
        {
          waktu_mulai: new Date(),
          tgl_inspeksi: new Date(),
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

  doneTicketPm3: async (req, res) => {
    const _id = req.params.id;
    const { catatan, id_leader, id_supervisor, id_ka_bag } = req.body;
    if (!catatan) return res.status(400).json({ msg: "catatan wajib di isi" });

    try {
      const checkPointDone = await PointPm3.findAll({
        where: { id_ticket: _id, hasil: null },
      });
      if (checkPointDone.length > 0)
        return res.status(400).json({ msg: "Point PM Wajib Di isi Semua" });
      const response = await TicketPm3.update(
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

module.exports = Pm3Controller;
