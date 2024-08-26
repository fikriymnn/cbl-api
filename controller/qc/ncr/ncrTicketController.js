const NcrTicket = require("../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../model/qc/ncr/ncrKetidaksesuaianModel");
const CapaTicket = require("../../../model/qc/capa/capaTiketmodel");
const capaKetidaksesuain = require("../../../model/qc/capa/capaKetidakSesuaianModel");
const Users = require("../../../model/userModel");

const NcrTicketController = {
  getNcrTicket: async (req, res) => {
    try {
      const { status, tanggal, department, page, limit } = req.query;
      const id = req.params.id;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tanggal || department)) {
        if (status) obj.status = status;
        if (tanggal) obj.tanggal = tanggal;
        if (department) obj.department = department;

        const length = await NcrTicket.count({ where: obj });
        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "pelapor",
          },
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "pelapor",
          },
          offset,
          limit: parseInt(limit),
        });
        const length = await NcrTicket.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tanggal || department) {
        if (status) obj.status = status;
        if (tanggal) obj.tanggal = tanggal;
        if (department) obj.department = department;

        const data = await NcrTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "pelapor",
          },
          where: obj,
        });
        const length = await NcrTicket.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        console.log(id);
        const data = await NcrTicket.findByPk(id, {
          include: [
            {
              model: Users,
              as: "pelapor",
            },
            {
              model: Users,
              as: "qa",
            },
            {
              model: Users,
              as: "mr",
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
          ],
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
      const { kategori_laporan, no_jo, no_io, nama_produk, data_department } =
        req.body;
      const data = await NcrTicket.create({
        id_pelapor: req.user.id,
        tanggal: new Date(),
        kategori_laporan,
        no_jo,
        no_io,
        nama_produk,
      });

      for (let index = 0; index < data_department.length; index++) {
        const department = await NcrDepartment.create({
          id_ncr_tiket: data.id,
          department: data_department[index].department,
        });
        for (
          let i = 0;
          i < data_department[index].ketidaksesuaian.length;
          i++
        ) {
          await NcrKetidaksesuain.create({
            id_department: department.id,
            ketidaksesuaian:
              data_department[index].ketidaksesuaian[i].ketidaksesuaian,
          });
        }
      }

      return res.status(201).json({ msg: "create success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  updateNcrTicket: async (req, res) => {
    try {
      const _id = req.params.id;
      const { status, catatan_qa, catatan_mr } = req.body;
      let obj = {};
      if (status) obj.status = status;
      if (catatan_qa) obj.catatan_qa = catatan_qa;
      if (catatan_mr) obj.catatan_mr = catatan_mr;
      const data = await NcrTicket.update(obj, { where: { id: _id } });

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
      await NcrTicket.update(obj, { where: { id: _id } });
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  validasiNcrMr: async (req, res) => {
    try {
      const _id = req.params.id;
      const { status, catatan_mr } = req.body;
      let statusValidasi = "";
      let bagianTiket = "incoming";
      if (status == "sesuai") {
        statusValidasi = "di teruskan ke capa";
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
      await NcrTicket.update(obj, { where: { id: _id } });
      if (status == "sesuai") {
        const ncrTiket = await NcrTicket.findByPk(_id, {
          include: [
            {
              model: Users,
              as: "pelapor",
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
          ],
        });

        for (let index = 0; index < ncrTiket.data_department.length; index++) {
          const capaTiket = await CapaTicket.create({
            id_pelapor: ncrTiket.id_pelapor,
            department: ncrTiket.data_department[index].department,
            tanggal_lapor: ncrTiket.tanggal,
            tanggal: new Date(),
            kategori_laporan: ncrTiket.kategori_laporan,
            no_jo: ncrTiket.no_jo,
            no_io: ncrTiket.no_io,
            nama_produk: ncrTiket.nama_produk,
            catatan_qa: ncrTiket.catatan_qa,
            catatan_mr: ncrTiket.catatan_mr,
          });

          for (
            let i = 0;
            i < ncrTiket.data_department[index].data_ketidaksesuaian.length;
            i++
          ) {
            await capaKetidaksesuain.create({
              id_capa: capaTiket.id,
              ketidaksesuaian:
                ncrTiket.data_department[index].data_ketidaksesuaian[i]
                  .ketidaksesuaian,
              file: ncrTiket.data_department[index].data_ketidaksesuaian[i]
                .file,
            });
          }
        }
      }
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = NcrTicketController;
