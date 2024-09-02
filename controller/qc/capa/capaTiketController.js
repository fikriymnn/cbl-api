const CapaTicket = require("../../../model/qc/capa/capaTiketmodel");
const capaKetidaksesuain = require("../../../model/qc/capa/capaKetidakSesuaianModel");
const Users = require("../../../model/userModel");

const capaTicketController = {
  getCapaTicket: async (req, res) => {
    try {
      const { status, bagian_tiket, tanggal, department, page, limit } =
        req.query;
      const id = req.params.id;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || tanggal || department)) {
        if (status) obj.status = status;
        if (tanggal) obj.tanggal = tanggal;
        if (department) obj.department = department;
        if (bagian_tiket) obj.bagian_tiket = bagian_tiket;

        const length = await CapaTicket.count({ where: obj });
        const data = await CapaTicket.findAll({
          order: [["createdAt", "DESC"]],
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
              model: capaKetidaksesuain,
              as: "data_ketidaksesuaian",
            },
          ],
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await CapaTicket.findAll({
          order: [["createdAt", "DESC"]],
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
              model: capaKetidaksesuain,
              as: "data_ketidaksesuaian",
            },
          ],
          offset,
          limit: parseInt(limit),
        });
        const length = await CapaTicket.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || bagian_tiket || tanggal || department) {
        if (status) obj.status = status;
        if (tanggal) obj.tanggal = tanggal;
        if (department) obj.department = department;
        if (bagian_tiket) obj.bagian_tiket = bagian_tiket;

        const data = await CapaTicket.findAll({
          order: [["createdAt", "DESC"]],
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
              model: capaKetidaksesuain,
              as: "data_ketidaksesuaian",
            },
          ],
          where: obj,
        });
        const length = await CapaTicket.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await CapaTicket.findByPk(id, {
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
              model: capaKetidaksesuain,
              as: "data_ketidaksesuaian",
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await CapaTicket.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "pelapor",
          },
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  submitCapaTicket: async (req, res) => {
    try {
      const _id = req.params.id;
      const { data_ketidaksesuaian } = req.body;
      let obj = {
        status: "menunggu verifikasi qa",
        id_inspektor: req.user.id,
      };

      const data = await CapaTicket.update(obj, { where: { id: _id } });

      for (let index = 0; index < data_ketidaksesuaian.length; index++) {
        await capaKetidaksesuain.update(data_ketidaksesuaian[index], {
          where: { id: data_ketidaksesuaian[index].id },
        });
      }

      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  verifikasiCapaQa: async (req, res) => {
    try {
      const _id = req.params.id;
      const { status, catatan_verifikasi_qa } = req.body;
      let statusValidasi = "";
      let bagianTiket = "incoming";
      if (status == "sesuai") {
        statusValidasi = "menunggu verifikasi mr";
      } else {
        statusValidasi = "di tolak qa";
      }
      let obj = {
        id_qa: req.user.id,
        status: statusValidasi,
        bagian_tiket: bagianTiket,
      };
      if (catatan_verifikasi_qa)
        obj.catatan_verifikasi_qa = catatan_verifikasi_qa;
      await CapaTicket.update(obj, { where: { id: _id } });
      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  verifikasiCapaMr: async (req, res) => {
    try {
      const _id = req.params.id;
      const { status, catatan_verifikasi_mr } = req.body;
      let statusValidasi = "";
      let bagianTiket = "incoming";
      if (status == "sesuai") {
        statusValidasi = "di teruskan";
        // bagianTiket = "history";
      } else {
        statusValidasi = "di tolak mr";
        // bagianTiket = "history";
      }
      let obj = {
        id_mr: req.user.id,
        status: statusValidasi,
        bagian_tiket: bagianTiket,
      };
      if (catatan_verifikasi_mr)
        obj.catatan_verifikasi_mr = catatan_verifikasi_mr;
      await CapaTicket.update(obj, { where: { id: _id } });

      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = capaTicketController;
