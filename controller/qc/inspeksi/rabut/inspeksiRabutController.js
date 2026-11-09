const { Op, Sequelize } = require("sequelize");

const InspeksiRabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabut = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const InspeksiRabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const MasterKodeMasalahRabut = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahSamplingHasilRabutModel");
const InspeksiRabutPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPeriodeDefectDepartmentModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { createNcrQtyInspeksi } = require("../../ncr/service/ncrTicketService");

const inspeksiRabutController = {
  getInspeksiRabut: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit, search, start_date, end_date } =
        req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (tgl) obj.tanggal = tgl;
      if (mesin) obj.mesin = mesin;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
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
      if (page && limit) {
        const length = await InspeksiRabut.count({ where: obj });
        const data = await InspeksiRabut.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: {
            model: InspeksiRabutPoint,
            as: "inspeksi_rabut_point",
            attributes: ["id"],
            include: [
              {
                model: User,
                as: "inspektor",
              },
            ],
          },
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiRabut.findByPk(id, {
          include: {
            model: InspeksiRabutPoint,
            as: "inspeksi_rabut_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: User,
                as: "inspektor_edit",
              },
              {
                model: InspeksiRabutDefect,
                as: "inspeksi_rabut_defect",
              },
            ],
          },
        });
        const checkInspeksiRabut = await InspeksiRabut.findOne({
          include: {
            model: InspeksiRabutPoint,
            as: "inspeksi_rabut_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiRabutDefect,
                as: "inspeksi_rabut_defect",
              },
            ],
          },
          where: {
            no_jo: data.no_jo,
            id: {
              [Op.ne]: data.id,
            },
          },
        });

        const inspeksiRabutPoint = await InspeksiRabutPoint.sum("qty_pallet", {
          where: { id_inspeksi_rabut: id },
        });

        const inspeksiRabutPointDefect = await InspeksiRabutDefect.findAll({
          attributes: [
            "kode",
            [Sequelize.fn("SUM", Sequelize.col("hasil")), "total_defect"],
          ],
          group: ["kode"],
          where: { id_inspeksi_rabut: id },
        });

        const totalDefect = await InspeksiRabutDefect.sum("hasil", {
          where: { id_inspeksi_rabut: id },
        });

        return res.status(200).json({
          data: data,
          history: checkInspeksiRabut,
          sumQtyPallet: inspeksiRabutPoint,
          totalPointDefect: inspeksiRabutPointDefect,
          totalDefect: totalDefect,
        });
      } else {
        const data = await InspeksiRabut.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiRabut: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      jumlah_pcs,
      mesin,
      operator,
      shift,
      nama_produk,
      customer,
      status_jo,
      qty_jo,
    } = req.body;

    try {
      const checkInspeksiRabut = await InspeksiRabut.findOne({
        where: {
          no_jo: no_jo,
          status: "incoming",
        },
      });
      // if (checkInspeksiRabut) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Rabut" });
      // } else {
      //   const inspeksiRabut = await InspeksiRabut.create({
      //     tanggal,
      //     no_jo,
      //     no_io,
      //     jumlah_pcs,
      //     mesin,
      //     operator,
      //     shift,
      //     nama_produk,
      //     customer,
      //     status_jo,
      //   });

      //   // const masterKodeRabut = await MasterKodeMasalahRabut.findAll({
      //   //   where: { status: "active" },
      //   // });

      //   const rabutPoint = await InspeksiRabutPoint.create({
      //     id_inspeksi_rabut: inspeksiRabut.id,
      //   });
      //   // for (let i = 0; i < masterKodeRabut.length; i++) {
      //   //   await InspeksiRabutDefect.create({
      //   //     id_inspeksi_rabut_point: rabutPoint.id,
      //   //     kode: masterKodeRabut[i].kode,
      //   //     masalah: masterKodeRabut[i].masalah,
      //   //     id_inspeksi_rabut: inspeksiRabut.id,
      //   //   });
      //   // }

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const inspeksiRabut = await InspeksiRabut.create({
        tanggal,
        no_jo,
        no_io,
        jumlah_pcs,
        mesin,
        operator,
        shift,
        nama_produk,
        customer,
        status_jo,
        qty_jo,
      });

      // const masterKodeRabut = await MasterKodeMasalahRabut.findAll({
      //   where: { status: "active" },
      // });

      const rabutPoint = await InspeksiRabutPoint.create({
        id_inspeksi_rabut: inspeksiRabut.id,
      });
      // for (let i = 0; i < masterKodeRabut.length; i++) {
      //   await InspeksiRabutDefect.create({
      //     id_inspeksi_rabut_point: rabutPoint.id,
      //     kode: masterKodeRabut[i].kode,
      //     masalah: masterKodeRabut[i].masalah,
      //     id_inspeksi_rabut: inspeksiRabut.id,
      //   });
      // }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  doneInspeksiRabut: async (req, res) => {
    const _id = req.params.id;
    const { catatan, sample_1, sample_2, sample_3 } = req.body;

    try {
      const noDoc = await MasterKodeDoc.findByPk(8);
      const inspeksiRabut = await InspeksiRabut.findOne({
        where: { id: _id },
      });
      const inspeksiRabutPoint = await InspeksiRabutPoint.findAll({
        where: { id_inspeksi_rabut: _id },
      });
      const jumlahPeriode = inspeksiRabutPoint.length;
      let totalWaktuCheck = inspeksiRabutPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiRabut.update(
        {
          sample_1,
          sample_2,
          sample_3,
          hasil_sample_1: (sample_1 / 16) * 10000,
          hasil_sample_2: (sample_2 / 16) * 10000,
          hasil_sample_3: (sample_3 / 16) * 10000,
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "history",
          catatan,
          no_doc: noDoc.kode,
        },
        { where: { id: _id } }
      );

      await createNcrQtyInspeksi({
        proses: "rabut",
        DefectModel: InspeksiRabutDefect,
        DepartmentModel: InspeksiRabutPeriodeDefectDepartment,
        kolomDepartment: "id_inspeksi_rabut_periode_point_defect",
        kolomDefect: "hasil",
        whereInspeksi: { id_inspeksi_rabut: _id },
        inspeksi: inspeksiRabut,
        idPelapor: req.user.id,
      });

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingLemPeriode: async (req, res) => {
    const _id = req.params.id;
    const { alasan_pending } = req.body;
    try {
      await InspeksiRabut.update(
        { status: "pending", alasan_pending: alasan_pending },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiRabutController;
