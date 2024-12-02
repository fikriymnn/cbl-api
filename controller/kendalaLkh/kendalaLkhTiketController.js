const { Op, Sequelize } = require("sequelize");
const KendalaLkh = require("../../model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("../../model/kendalaLkh/kendalaLkhDepartmentModel");
const KendalaLkhTiket = require("../../model/kendalaLkh/kendalaLkhTiketModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");

const KendalaLkhTiketController = {
  getKendalaLkhTiket: async (req, res) => {
    const _id = req.params.id;
    const {
      status_tiket,
      jenis_kendala,
      nama_customer,
      mesin,
      start_date,
      end_date,
      limit,
      page,
      id_department,
      department,
    } = req.query;
    try {
      let obj = {};
      let des = ["createdAt", "DESC"];
      let options = {};
      const offset = (page - 1) * limit;

      if (status_tiket) obj.status_tiket = status_tiket;

      if (jenis_kendala) obj.jenis_kendala = jenis_kendala;
      if (nama_customer) obj.nama_customer = nama_customer;
      if (mesin) obj.mesin = mesin;
      if (id_department) obj.id_department = id_department;
      if (department) obj.department = department;

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

      options.where = obj;
      options.order = [des];

      if (page && limit) {
        options.limit = parseInt(limit);
        options.offset = parseInt(offset);
      }

      if (_id) {
        const response = await KendalaLkhTiket.findByPk(_id, options);

        res.status(200).json({
          data: response,
        });
      } else if (page && limit) {
        const data = await KendalaLkhTiket.count({ where: obj });
        const response = await KendalaLkhTiket.findAll(options);

        res.status(200).json({
          total_page: Math.ceil(data / limit),
          data: response,
          offset: page,
          limit: limit,
        });
      } else {
        const response = await KendalaLkhTiket.findAll(options);

        res.status(200).json({
          data: response,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  responKendalaLkhTiket: async (req, res) => {
    const _id = req.params.id;
    const {
      id_inspektor_p1,
      id_inspektor,
      nama_inspektor,
      analisa_penyebab,
      tindakan,
    } = req.body;

    let obj = {
      status_tiket: "history",
      id_inspektor: id_inspektor,
      id_inspektor_p1: id_inspektor_p1,
      analisa_penyebab: analisa_penyebab,
      tindakan: tindakan,
      nama_inspektor: nama_inspektor,
    };
    const t = await db.transaction();
    try {
      await KendalaLkhTiket.update(obj, { where: { id: _id }, transaction: t });

      await t.commit();
      res.status(201).json({ msg: "Ticket validasi Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
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

module.exports = KendalaLkhTiketController;
