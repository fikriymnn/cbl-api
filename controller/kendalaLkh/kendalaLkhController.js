const { Op, Sequelize } = require("sequelize");
const KendalaLkh = require("../../model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("../../model/kendalaLkh/kendalaLkhDepartmentModel");
const KendalaLkhTiket = require("../../model/kendalaLkh/kendalaLkhTiketModel");
const NcrTicket = require("../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../model/qc/ncr/ncrKetidaksesuaianModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");

const KendalaLkhController = {
  getKendalaLkh: async (req, res) => {
    const _id = req.params.id;
    const {
      status_tiket,
      bagian_tiket,
      jenis_kendala,
      nama_customer,
      nama_produk,
      no_jo,
      no_io,
      no_so,
      mesin,
      kode_kendala,
      start_date,
      end_date,
      limit,
      page,
    } = req.query;
    try {
      let obj = {};
      let des = ["createdAt", "DESC"];
      let options = {
        include: [
          {
            model: KendalaLkhDepartment,
            as: "data_department",
          },
          {
            model: Users,
            as: "user_qc",
          },
        ],
      };
      const offset = (page - 1) * limit;

      if (status_tiket) obj.status_tiket = status_tiket;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (jenis_kendala) obj.jenis_kendala = jenis_kendala;
      if (no_jo) obj.no_jo = { [Op.like]: `%${no_jo}%` };
      if (no_io) obj.no_io = { [Op.like]: `%${no_io}%` };
      if (no_so) obj.no_so = { [Op.like]: `%${no_so}%` };
      if (nama_produk) obj.nama_produk = { [Op.like]: `%${nama_produk}%` };
      if (nama_customer)
        obj.nama_customer = { [Op.like]: `%${nama_customer}%` };
      if (kode_kendala) obj.kode_kendala = { [Op.like]: `%${kode_kendala}%` };
      if (mesin) obj.mesin = mesin;
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
        const response = await KendalaLkh.findByPk(_id, options);

        res.status(200).json({
          data: response,
        });
      } else if (page && limit) {
        const data = await KendalaLkh.count({ where: obj });
        const response = await KendalaLkh.findAll(options);

        res.status(200).json({
          total_page: Math.ceil(data / limit),
          offset: page,
          limit: limit,
          data: response,
        });
      } else {
        const response = await KendalaLkh.findAll(options);

        res.status(200).json({
          data: response,
        });
      }
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
      mesin,
      operator,
      jenis_kendala,
      id_kendala,
      kode_kendala,
      nama_kendala,
      waktu_mulai,
      waktu_selesai,
      maksimal_kedatangan_tiket,
      maksimal_periode_kedatangan_tiket,
      maksimal_waktu_pengerjaan,
      data_department,
    } = req.body;

    const t = await db.transaction();
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

      const kendala = await KendalaLkh.findAll({
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

      const kendalaLength = kendala.length + 1;

      const strNumber = kendalaLength.toString();

      // Pad the beginning with leading zeros
      const paddedNumber = strNumber.padStart(4, "0");
      const kodeTicket =
        paddedNumber + "/" + "MI" + "/" + monthName + "/" + year;

      const resKendalaLkh = await KendalaLkh.create(
        {
          id_jo: id_jo,
          no_jo: no_jo,
          nama_produk: nama_produk,
          no_io: no_io,
          no_so: no_so,
          kode_lkh: kode_lkh,
          nama_customer: nama_customer,
          mesin: mesin,
          operator: operator,
          jenis_kendala: jenis_kendala,
          id_kendala: id_kendala,
          kode_kendala: kode_kendala,
          nama_kendala: nama_kendala,
          kode_ticket: kodeTicket,
          waktu_mulai,
          waktu_selesai,
          maksimal_kedatangan_tiket,
          maksimal_periode_kedatangan_tiket,
          maksimal_waktu_pengerjaan,
        },
        { transaction: t }
      );

      for (let index = 0; index < data_department.length; index++) {
        const department = await KendalaLkhDepartment.create(
          {
            id_kendala_lkh: resKendalaLkh.id,
            id_department: data_department[index].id_department,
            department: data_department[index].department,
          },
          { transaction: t }
        );
      }
      await t.commit();
      res.status(201).json({ msg: "Kendala lkh create Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  validasiQcKendalaLkh: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    let obj = {
      status_tiket: "di validasi",
      bagian_tiket: "history",
      id_qc: req.user.id,
      note_qc: note_qc,
    };
    const t = await db.transaction();
    const t2 = await db.transaction();
    try {
      const kendalaLkh = await KendalaLkh.findByPk(_id, {
        include: [
          {
            model: KendalaLkhDepartment,
            as: "data_department",
          },
        ],
      });

      await KendalaLkh.update(obj, { where: { id: _id }, transaction: t });
      for (let i = 0; i < kendalaLkh.data_department.length; i++) {
        await KendalaLkhTiket.create(
          {
            id_jo: kendalaLkh.id_jo,
            id_kendala: kendalaLkh.id_kendala,
            no_jo: kendalaLkh.no_jo,
            nama_produk: kendalaLkh.nama_produk,
            no_io: kendalaLkh.no_io,
            no_so: kendalaLkh.no_so,
            nama_customer: kendalaLkh.nama_customer,
            mesin: kendalaLkh.mesin,
            operator: kendalaLkh.operator,
            jenis_kendala: kendalaLkh.jenis_kendala,
            kode_kendala: kendalaLkh.kode_kendala,
            nama_kendala: kendalaLkh.nama_kendala,
            kode_lkh: kendalaLkh.kode_lkh,
            note_qc: note_qc,
            id_department: kendalaLkh.data_department[i].id_department,
            department: kendalaLkh.data_department[i].department,
            maksimal_waktu_pengerjaan: kendalaLkh.maksimal_waktu_pengerjaan,
            start: new Date(),
          },
          {
            transaction: t,
          }
        );
      }

      const dateRange = getDateRange(
        kendalaLkh.maksimal_periode_kedatangan_tiket
      );

      //cek jumlah tiket
      const jumlahKendalaLkh = await KendalaLkh.findAll({
        where: {
          createdAt: dateRange,
          status_tiket: "di validasi",
          kode_kendala: kendalaLkh.kode_kendala,
        },
      });

      console.log(jumlahKendalaLkh.length);

      if (jumlahKendalaLkh.length + 1 > kendalaLkh.maksimal_kedatangan_tiket) {
        console.log("masuk ncr");

        const userQc = await Users.findByPk(req.user.id);
        const data = await NcrTicket.create(
          {
            id_pelapor: kendalaLkh.id_qc,
            tanggal: new Date(),
            kategori_laporan: kendalaLkh.jenis_kendala,
            nama_pelapor: userQc.nama,
            department_pelapor: "QUALITY CONTROL",
            no_jo: kendalaLkh.no_jo,
            no_io: kendalaLkh.no_io,
            nama_produk: kendalaLkh.nama_produk,
          },
          { transaction: t }
        );

        for (
          let index = 0;
          index < kendalaLkh.data_department.length;
          index++
        ) {
          const department = await NcrDepartment.create(
            {
              id_ncr_tiket: data.id,
              id_department: kendalaLkh.data_department[index].id_department,
              department: kendalaLkh.data_department[index].department,
            },
            { transaction: t }
          );

          await NcrKetidaksesuain.create(
            {
              id_department: department.id,
              ketidaksesuaian: `Kendala ${kendalaLkh.kode_kendala} ${kendalaLkh.nama_kendala} telah melebihi batas maksimal`,
            },
            { transaction: t }
          );
        }
      }
      await t.commit();
      res.status(201).json({ msg: "Ticket validasi Successfuly" });
    } catch (error) {
      await t.rollback();

      res.status(400).json({ msg: error.message });
    }
  },

  rejectQcKendalaLkh: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    let obj = {
      status_tiket: "di tolak",
      bagian_tiket: "history",
      id_qc: req.user.id,
      note_qc: note_qc,
    };
    try {
      await KendalaLkh.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Ticket reject Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

// Fungsi untuk menentukan range tanggal berdasarkan periode
const getDateRange = (periode) => {
  const now = new Date();
  if (periode === "Month") {
    // Range satu bulan terakhir
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      [Op.between]: [startOfMonth, now],
    };
  } else if (periode === "Week") {
    // Range satu minggu terakhir
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    return {
      [Op.between]: [startOfWeek, now],
    };
  }
  throw new Error("Periode tidak valid");
};

module.exports = KendalaLkhController;
