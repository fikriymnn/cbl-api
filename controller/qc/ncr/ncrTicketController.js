const { Op } = require("sequelize");
const db = require("../../../config/database");
const NcrTicket = require("../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../model/qc/ncr/ncrKetidaksesuaianModel");
const Users = require("../../../model/userModel");
const { createCapaFromNcr } = require("../capa/service/capaTiketService");
const { createNcr } = require("./service/ncrTicketService");

const userAttributes = { exclude: ["password"] };

const ncrInclude = [
  {
    model: Users,
    as: "pelapor",
    attributes: userAttributes,
  },
  {
    model: Users,
    as: "qa",
    attributes: userAttributes,
  },
  {
    model: Users,
    as: "mr",
    attributes: userAttributes,
  },
  {
    model: NcrDepartment,
    as: "data_department",
    include: [
      {
        model: NcrKetidaksesuain,
        as: "data_ketidaksesuaian",
      },
    ],
  },
];

const NcrTicketController = {
  getNcrTicket: async (req, res) => {
    try {
      const {
        status,
        id_user,
        id_pelapor_p1,
        tanggal,
        department,
        bagian_tiket,
        tipe_ncr,
        page,
        limit,
      } = req.query;
      const id = req.params.id;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (tanggal)
        obj.tanggal = {
          [Op.between]: [
            new Date(tanggal).setHours(0, 0, 0, 0),
            new Date(tanggal).setHours(23, 59, 59, 999),
          ],
        };
      if (department) obj.department = department;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (id_user) obj.id_pelapor = id_user;
      if (id_pelapor_p1) obj.id_pelapor_p1 = id_pelapor_p1;
      if (tipe_ncr) obj.tipe_ncr = tipe_ncr;
      const hasFilter = Object.keys(obj).length > 0;

      if (page && limit) {
        const length = await NcrTicket.count({ where: obj });
        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: ncrInclude,
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (hasFilter) {
        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: ncrInclude,
          where: obj,
        });
        const length = await NcrTicket.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        // console.log(id);
        const data = await NcrTicket.findByPk(id, {
          include: ncrInclude,
        });

        return res.status(200).json({ data });
      } else {
        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createNcrTicket: async (req, res) => {
    try {
      const {
        kategori_laporan,
        id_pelapor,
        id_pelapor_p1,
        no_jo,
        no_io,
        nama_produk,
        nama_pelapor,
        department_pelapor,
        data_department,
      } = req.body;
      await createNcr({
        data: {
          id_pelapor,
          id_pelapor_p1,
          tipe_ncr: "manual",
          kategori_laporan,
          nama_pelapor,
          department_pelapor,
          no_jo,
          no_io,
          nama_produk,
        },
        departments: data_department.map((item) => ({
          id_department: item.id_department,
          department: item.department,
          ketidaksesuaian: item.ketidaksesuaian.map(
            (poin) => poin.ketidaksesuaian
          ),
        })),
      });

      return res.status(201).json({ msg: "create success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  updateNcrTicket: async (req, res) => {
    try {
      const _id = req.params.id;
      const {
        status,
        catatan_qa,
        catatan_mr,
        no_jo,
        no_io,
        nama_produk,
        kategori_laporan,
        data_department,
      } = req.body;
      let obj = {};
      if (status) obj.status = status;
      if (catatan_qa) obj.catatan_qa = catatan_qa;
      if (catatan_mr) obj.catatan_mr = catatan_mr;
      if (no_jo) obj.no_jo = no_jo;
      if (no_io) obj.no_io = no_io;
      if (nama_produk) obj.nama_produk = nama_produk;
      if (kategori_laporan) obj.kategori_laporan = kategori_laporan;
      const data = await NcrTicket.update(obj, { where: { id: _id } });

      for (let i = 0; i < data_department.length; i++) {
        const data = data_department[i];
        await NcrDepartment.update(
          { id_department: data.id_department, department: data.department },
          { where: { id: data.id } }
        );

        for (let ii = 0; ii < data.data_ketidaksesuaian.length; ii++) {
          const data2 = data.data_ketidaksesuaian[ii];
          await NcrKetidaksesuain.update(
            { ketidaksesuaian: data2.ketidaksesuaian, file: data2.file },
            { where: { id: data2.id } }
          );
        }
      }

      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  updateNcrDepartment: async (req, res) => {
    try {
      const _id = req.params.id;
      const { department } = req.body;
      let obj = {};
      if (department) obj.department = department;

      const data = await NcrDepartment.update(obj, { where: { id: _id } });
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  validasiNcrQa: async (req, res) => {
    try {
      const _id = req.params.id;
      const { status, catatan_qa } = req.body;
      let statusValidasi = "";
      let bagianTiket = "incoming";
      if (status == "sesuai") {
        statusValidasi = "menunggu validasi mr";
      } else {
        statusValidasi = "di tolak qa";
        bagianTiket = "history";
      }
      let obj = {
        id_qa: req.user.id,
        status: statusValidasi,
        bagian_tiket: bagianTiket,
      };
      if (catatan_qa) obj.catatan_qa = catatan_qa;
      const [updated] = await NcrTicket.update(obj, {
        where: { id: _id, status: "menunggu validasi qa" },
      });
      if (updated === 0)
        return res
          .status(400)
          .json({ msg: "tiket tidak dalam status menunggu validasi qa" });
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  validasiNcrMr: async (req, res) => {
    const t = await db.transaction();
    try {
      const _id = req.params.id;
      const { status, catatan_mr } = req.body;
      let statusValidasi = "";
      let bagianTiket = "incoming";
      // NCR frekuensi hanya menghasilkan CAPA jika batasnya sudah terlewati
      const ncr = await NcrTicket.findByPk(_id, {
        attributes: ["tipe_ncr", "melebihi_batas"],
        transaction: t,
      });
      const buatCapa =
        status == "sesuai" &&
        (ncr?.tipe_ncr != "frekuensi" || ncr.melebihi_batas == true);
      if (status == "sesuai") {
        statusValidasi = buatCapa ? "di teruskan ke capa" : "selesai";
        bagianTiket = "history";
      } else {
        statusValidasi = "di tolak mr";
        bagianTiket = "history";
      }
      let obj = {
        id_mr: req.user.id,
        status: statusValidasi,
        bagian_tiket: bagianTiket,
      };
      if (catatan_mr) obj.catatan_mr = catatan_mr;
      // Syarat status di WHERE mencegah CAPA ganda saat request dikirim berulang
      const [updated] = await NcrTicket.update(obj, {
        where: { id: _id, status: "menunggu validasi mr" },
        transaction: t,
      });
      if (updated === 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ msg: "tiket tidak dalam status menunggu validasi mr" });
      }
      if (buatCapa) await createCapaFromNcr(_id, t);
      await t.commit();
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = NcrTicketController;
