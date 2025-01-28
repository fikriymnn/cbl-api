const { Op, Sequelize } = require("sequelize");
const KendalaLkh = require("../../model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("../../model/kendalaLkh/kendalaLkhDepartmentModel");
const NcrTicket = require("../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../model/qc/ncr/ncrKetidaksesuaianModel");
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
      console.log(req.query);
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
      stop: new Date(),
    };
    const t = await db.transaction();
    try {
      const dataKendalaLkhTiket = await KendalaLkhTiket.findByPk(_id);

      // Perbedaan dalam milidetik
      const diffInMs = Math.abs(new Date() - dataKendalaLkhTiket.start);
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); //dalam menit
      //const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Dalam jam
      console.log(diffInMinutes);

      await KendalaLkhTiket.update(obj, { where: { id: _id }, transaction: t });

      if (diffInMinutes > dataKendalaLkhTiket.maksimal_waktu_pengerjaan) {
        console.log("masuk ncr");
        const data = await NcrTicket.create(
          {
            id_pelapor: dataKendalaLkhTiket.id_inspektor,
            id_pelapor_p1: dataKendalaLkhTiket.id_inspektor_p1,
            tanggal: new Date(),
            kategori_laporan: dataKendalaLkhTiket.jenis_kendala,
            nama_pelapor: dataKendalaLkhTiket.nama_inspektor,
            department_pelapor: dataKendalaLkhTiket.department,
            no_jo: dataKendalaLkhTiket.no_jo,
            no_io: dataKendalaLkhTiket.no_io,
            nama_produk: dataKendalaLkhTiket.nama_produk,
          },
          { transaction: t }
        );

        const department = await NcrDepartment.create(
          {
            id_ncr_tiket: data.id,
            id_department: dataKendalaLkhTiket.id_department,
            department: dataKendalaLkhTiket.department,
          },
          { transaction: t }
        );

        await NcrKetidaksesuain.create(
          {
            id_department: department.id,
            ketidaksesuaian: `Melebihi batas waktu penanganan masalah ${dataKendalaLkhTiket.kode_kendala} ${dataKendalaLkhTiket.nama_kendala} pada jo ${dataKendalaLkhTiket.no_jo}`,
          },
          { transaction: t }
        );
      }

      await t.commit();
      res.status(201).json({ msg: "Ticket respon Successfuly" });
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
