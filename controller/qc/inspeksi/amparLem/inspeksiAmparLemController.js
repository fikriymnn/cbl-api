const { Op, Sequelize } = require("sequelize");

const InspeksiAmparLemPoint = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const InspeksiAmparLem = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const InspeksiAmparLemDefect = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");

const InspeksiAmparLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPeriodeDefectDepartmentModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const User = require("../../../../model/userModel");

const inspeksiAmparLemController = {
  getInspeksiAmparLem: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit, search } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };

      if (page && limit && (status || tgl || mesin)) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const length = await InspeksiAmparLem.count({ where: obj });
        const data = await InspeksiAmparLem.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiAmparLem.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
          where: obj,
        });
        const length = await InspeksiAmparLem.count({ where: obj });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || tgl || mesin) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiAmparLem.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiAmparLem.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiAmparLem.findByPk(id, {
          include: {
            model: InspeksiAmparLemPoint,
            as: "inspeksi_ampar_lem_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiAmparLemDefect,
                as: "inspeksi_ampar_lem_defect",
              },
            ],
          },
        });
        const checkInspeksiAmparLem = await InspeksiAmparLem.findOne({
          include: {
            model: InspeksiAmparLemPoint,
            as: "inspeksi_ampar_lem_point",
            include: [
              {
                model: User,
                as: "inspektor",
              },
              {
                model: InspeksiAmparLemDefect,
                as: "inspeksi_ampar_lem_defect",
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

        const inspeksiAmparLemPoint = await InspeksiAmparLemPoint.sum(
          "qty_pallet",
          {
            where: { id_inspeksi_ampar_lem: id },
          }
        );

        const inspeksiAmparLemPointDefect =
          await InspeksiAmparLemDefect.findAll({
            attributes: [
              "kode",
              [Sequelize.fn("SUM", Sequelize.col("hasil")), "total_defect"],
            ],
            group: ["kode"],
            where: { id_inspeksi_ampar_lem: id },
          });

        const totalDefect = await InspeksiAmparLemDefect.sum("hasil", {
          where: { id_inspeksi_ampar_lem: id },
        });

        return res.status(200).json({
          data: data,
          history: checkInspeksiAmparLem,
          sumQtyPallet: inspeksiAmparLemPoint,
          totalPointDefect: inspeksiAmparLemPointDefect,
          totalDefect: totalDefect,
        });
      } else {
        const data = await InspeksiAmparLem.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiAmparLem: async (req, res) => {
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
      const checkInspeksiAmparLem = await InspeksiAmparLem.findOne({
        where: {
          no_jo: no_jo,
          status: "incoming",
        },
      });
      // if (checkInspeksiAmparLem) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Ampat Lem" });
      // } else {
      //   const inspeksiAmparLem = await InspeksiAmparLem.create({
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

      //   const rabutPoint = await InspeksiAmparLemPoint.create({
      //     id_inspeksi_ampar_lem: inspeksiAmparLem.id,
      //   });
      //   // for (let i = 0; i < masterKodeRabut.length; i++) {
      //   //   await InspeksiAmparLemDefect.create({
      //   //     id_inspeksi_ampar_lem_point: rabutPoint.id,
      //   //     kode: masterKodeRabut[i].kode,
      //   //     masalah: masterKodeRabut[i].masalah,
      //   //     id_inspeksi_rabut: inspeksiAmparLem.id,
      //   //   });
      //   // }

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const inspeksiAmparLem = await InspeksiAmparLem.create({
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

      const rabutPoint = await InspeksiAmparLemPoint.create({
        id_inspeksi_ampar_lem: inspeksiAmparLem.id,
      });
      // for (let i = 0; i < masterKodeRabut.length; i++) {
      //   await InspeksiAmparLemDefect.create({
      //     id_inspeksi_ampar_lem_point: rabutPoint.id,
      //     kode: masterKodeRabut[i].kode,
      //     masalah: masterKodeRabut[i].masalah,
      //     id_inspeksi_rabut: inspeksiAmparLem.id,
      //   });
      // }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  doneInspeksiAmparLem: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const inspeksiAmparLem = await InspeksiAmparLem.findOne({
        where: { id: _id },
      });
      const inspeksiAmparLemPoint = await InspeksiAmparLemPoint.findAll({
        where: { id_inspeksi_ampar_lem: _id },
      });
      const jumlahPeriode = inspeksiAmparLemPoint.length;
      let totalWaktuCheck = inspeksiAmparLemPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiAmparLem.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "history",
          catatan,
        },
        { where: { id: _id } }
      );

      const pointDefect = await InspeksiAmparLemDefect.findAll({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("hasil")), "hasil"],
          "id",
          "kode",
          "sumber_masalah",
          "persen_kriteria",
          "kriteria",
          "masalah",
        ],
        group: ["kode"],
        where: {
          id_inspeksi_ampar_lem: _id,
        },
      });

      let pointDefectDepartment = [];

      for (let index = 0; index < pointDefect.length; index++) {
        const dataaa = await InspeksiAmparLemPeriodeDefectDepartment.findAll({
          where: {
            id_inspeksi_ampar_lem_periode_point_defect: pointDefect[index].id,
          },
        });
        pointDefectDepartment.push(dataaa);
      }

      for (let index = 0; index < pointDefect.length; index++) {
        let defect = pointDefect[index].hasil;
        let pcs = inspeksiAmparLem.jumlah_pcs;
        let persen = (defect / pcs) * 100;
        let persen_kriteria = pointDefect[index].persen_kriteria;
        let department = pointDefect[index].sumber_masalah;
        let department_tujuan = "";
        if (department == "man") {
          department_tujuan = "hrd";
        } else if (department == "material") {
          department_tujuan = "purchasing";
        } else if (department == "persiapan") {
          department_tujuan = "persiapan";
        }

        if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah != "Mesin"
        ) {
          console.log("masuk ncr");
          const data = await NcrTicket.create({
            id_pelapor: req.user.id,
            tanggal: new Date(),
            kategori_laporan: pointDefect[index].sumber_masalah,
            no_jo: inspeksiAmparLem.no_jo,
            no_io: inspeksiAmparLem.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiAmparLem.nama_produk,
          });

          for (let ii = 0; ii < pointDefectDepartment[index].length; ii++) {
            const department = await NcrDepartment.create({
              id_ncr_tiket: data.id,
              id_department: pointDefectDepartment[index][ii].id_department,
              department: pointDefectDepartment[index][ii].nama_department,
            });
            await NcrKetidaksesuain.create({
              id_department: department.id,
              ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria} di Ampar Lem`,
            });
          }
        } else if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah == "Mesin"
        ) {
          console.log("masuk os");
        }
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingAmparLemPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiAmparLem.update(
        { status: "pending" },
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

module.exports = inspeksiAmparLemController;
