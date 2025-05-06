const { Op, Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const InspeksiCoatingPointMasterPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoatingPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");
const User = require("../../../../model/userModel");
const axios = require("axios");

dotenv.config();

const inspeksiCoatingController = {
  getInspeksiCoating: async (req, res) => {
    try {
      const {
        status,
        page,
        limit,
        jenis_pengecekan,
        search,
        start_date,
        end_date,
      } = req.query;
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
      if (page && limit && (status || jenis_pengecekan)) {
        if (status) obj.status = status;

        const data = await InspeksiCoating.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiCoatingResultPeriode,
              as: "inspeksi_coating_result_periode",
              attributes: ["id"],
              include: [
                {
                  model: InspeksiCoatingResultPointPeriode,
                  as: "inspeksi_coating_result_point_periode",
                  attributes: ["id"],
                },
                {
                  model: User,
                  as: "inspektor",
                },
              ],
            },

            {
              model: InspeksiCoatingResultAwal,
              as: "inspeksi_coating_result_awal",
              attributes: ["id"],
              include: {
                model: User,
                as: "inspektor",
              },
            },
          ],
        });
        const length = await InspeksiCoating.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        if (jenis_pengecekan == "awal") {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
          });
          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
            attributes: [
              "kode",
              "sumber_masalah",
              "persen_kriteria",
              "kriteria",
              "masalah",
              [
                Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
                "total_defect",
              ],
            ],
          });
          return res
            .status(200)
            .json({ data: data, history: checkInspeksiCoating, defect: data2 });
        } else if (jenis_pengecekan == "periode") {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
            ],
          });
          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
            attributes: [
              "kode",
              "sumber_masalah",
              "persen_kriteria",
              "kriteria",
              "masalah",
              [
                Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
                "total_defect",
              ],
            ],
          });
          return res
            .status(200)
            .json({ data: data, history: checkInspeksiCoating, defect: data2 });
        } else {
          const data = await InspeksiCoating.findByPk(id, {
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
          });

          const checkInspeksiCoating = await InspeksiCoating.findOne({
            include: [
              {
                model: InspeksiCoatingResultPeriode,
                as: "inspeksi_coating_result_periode",
                include: [
                  {
                    model: InspeksiCoatingResultPointPeriode,
                    as: "inspeksi_coating_result_point_periode",
                  },
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
              {
                model: InspeksiCoatingSubPeriode,
                as: "inspeksi_coating_sub_periode",
              },
              {
                model: InspeksiCoatingResultAwal,
                as: "inspeksi_coating_result_awal",
                include: {
                  model: User,
                  as: "inspektor",
                },
              },
              {
                model: InspeksiCoatingSubAwal,
                as: "inspeksi_coating_sub_awal",
              },
            ],
            where: {
              no_jo: data.no_jo,
              id: {
                [Op.ne]: data.id,
              },
            },
          });
          const data2 = await InspeksiCoatingResultPointPeriode.findAll({
            where: { id_inspeksi_coating: id, hasil: "not ok" },
            group: ["kode"],
            attributes: [
              "kode",
              "sumber_masalah",
              "persen_kriteria",
              "kriteria",
              "masalah",
              [
                Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
                "total_defect",
              ],
            ],
          });

          return res.status(200).json({
            data: data,
            history: checkInspeksiCoating,
            defect: data2,
            msg: "OK",
          });
        }
      } else if (status || jenis_pengecekan) {
        if (status) obj.status = status;
        if (jenis_pengecekan) obj.jenis_pengecekan = jenis_pengecekan;
        const data = await InspeksiCoating.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiCoating.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else {
        const data = await InspeksiCoating.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  addInspeksiCoatingAwal: async (req, res) => {
    try {
      const {
        tanggal,
        jumlah,
        jenis_kertas,
        jenis_gramatur,
        coating,
        jam,
        no_jo,
        no_io,
        jumlah_druk,
        jumlah_pcs,
        mata,
        nama_produk,
        customer,
        shift,
        mesin,
        operator,
        status_jo,
        qty_jo,
      } = req.body;

      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      else if (!jenis_gramatur)
        return res.status(400).json({ msg: "Field jenis_gramatur kosong!" });
      else if (!no_jo)
        return res.status(400).json({ msg: "Field no_jo kosong!" });
      else if (!jenis_kertas)
        return res.status(400).json({ msg: "Field jenis_kertas kosong!" });
      else if (!nama_produk)
        return res.status(400).json({ msg: "Field nama_produk kosong!" });
      else if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      else if (!jumlah_pcs)
        return res.status(400).json({ msg: "Field jumlah pcs kosong!" });
      else if (!coating)
        return res.status(400).json({ msg: "Field coating kosong!" });
      else if (!customer)
        return res.status(400).json({ msg: "Field customer kosong!" });
      else if (!shift)
        return res.status(400).json({ msg: "Field shift kosong!" });
      else if (!mesin)
        return res.status(400).json({ msg: "Field mesin kosong!" });
      else if (!operator)
        return res.status(400).json({ msg: "Field operator kosong!" });
      else if (!status_jo)
        return res.status(400).json({ msg: "Field status_jo kosong!" });

      const checkInspeksiIncoming = await InspeksiCoating.findOne({
        where: {
          no_jo: no_jo,
          status: "incoming",
        },
      });
      // if (checkInspeksiIncoming) {
      //   res
      //     .status(200)
      //     .json({ msg: "JO sedang di proses oleh QC pada proses Coating" });
      // } else {
      //   const checkInspeksiCoating = await InspeksiCoating.findOne({
      //     where: {
      //       no_jo: no_jo,
      //       status: "pending",
      //     },
      //   });

      //   if (checkInspeksiCoating) {
      //     await InspeksiCoating.update(
      //       {
      //         status: "history",
      //       },
      //       {
      //         where: {
      //           id: checkInspeksiCoating.id,
      //         },
      //       }
      //     );
      //   }

      //   const data = await InspeksiCoating.create({
      //     tanggal,
      //     jumlah,
      //     jenis_kertas,
      //     jenis_gramatur,
      //     jam,
      //     no_jo,
      //     no_io,
      //     jumlah_druk,
      //     jumlah_pcs,
      //     mata,
      //     nama_produk,
      //     customer,
      //     shift,
      //     mesin,
      //     operator,
      //     status_jo,
      //     coating,
      //   });
      //   if (data?.id) {
      //     await InspeksiCoatingResultAwal.create({
      //       id_inspeksi_coating: data?.id,
      //     });
      //     await InspeksiCoatingSubAwal.create({
      //       id_inspeksi_coating: data?.id,
      //     });
      //   }
      //   res.status(200).json({ data, msg: "OK" });
      // }
      const checkInspeksiCoating = await InspeksiCoating.findOne({
        where: {
          no_jo: no_jo,
          status: "pending",
        },
      });

      if (checkInspeksiCoating) {
        await InspeksiCoating.update(
          {
            status: "history",
          },
          {
            where: {
              id: checkInspeksiCoating.id,
            },
          }
        );
      }

      const data = await InspeksiCoating.create({
        tanggal,
        jumlah,
        jenis_kertas,
        jenis_gramatur,
        jam,
        no_jo,
        no_io,
        jumlah_druk,
        jumlah_pcs,
        mata,
        nama_produk,
        customer,
        shift,
        mesin,
        operator,
        status_jo,
        qty_jo,
        coating,
      });
      if (data?.id) {
        await InspeksiCoatingResultAwal.create({
          id_inspeksi_coating: data?.id,
        });
        await InspeksiCoatingSubAwal.create({
          id_inspeksi_coating: data?.id,
        });
      }
      res.status(200).json({ data, msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  updateInspeksiCoatingAwal: async (req, res) => {
    try {
      const {
        jumlah_periode_check,
        waktu_check,
        masterMasalah,
        sample_1,
        sample_2,
        sample_3,
      } = req.body;
      const { id } = req.params;

      // const masterMasalah = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=5`
      // );

      await InspeksiCoating.update({ status: "incoming" }, { where: { id } });

      const inspeksiCoatingAwalPoint = await InspeksiCoatingResultAwal.findAll({
        where: { id_inspeksi_coating: id },
      });
      const jumlahPeriode = inspeksiCoatingAwalPoint.length;
      let totalWaktuCheck = inspeksiCoatingAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiCoatingSubAwal.update(
        {
          jumlah_periode_check: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "history",
          sample_1,
          sample_2,
          sample_3,
          hasil_sample_1: (sample_1 / 100) * 10000,
          hasil_sample_2: (sample_2 / 100) * 10000,
          hasil_sample_3: (sample_3 / 100) * 10000,
        },
        {
          where: {
            id_inspeksi_coating: id,
          },
        }
      );
      await InspeksiCoatingSubPeriode.create({
        id_inspeksi_coating: id,
      });
      const resultPeriode = await InspeksiCoatingResultPeriode.create({
        id_inspeksi_coating: id,
      });

      for (let i = 0; i < masterMasalah.data.length; i++) {
        const coatingDefect = await InspeksiCoatingResultPointPeriode.create({
          id_inspeksi_coating_result_periode: resultPeriode.id,
          id_inspeksi_coating: id,
          kode: masterMasalah.data[i].e_kode_produksi,
          masalah: masterMasalah.data[i].nama_kendala,
          kriteria: masterMasalah.data[i].criteria,
          persen_kriteria: masterMasalah.data[i].criteria_percent,
          sumber_masalah: masterMasalah.data[i].kategori_kendala,
        });

        //untuk department ketika sudah ada data di p1
        for (
          let ii = 0;
          ii < masterMasalah.data[i].target_department.length;
          ii++
        ) {
          const depart = masterMasalah.data[i].target_department[ii];
          await InspeksiCoatingPeriodeDefectDepartment.create({
            id_inspeksi_coating_periode_point_defect: coatingDefect.id,
            id_department: parseInt(depart.id_department),
            nama_department: depart.nama_department,
          });
        }
      }

      return res.status(200).json({ data: "update successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getInspeksiCoatingJenisProsess: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await InspeksiCoatingSubAwal.findAll({
        where: { id_inspeksi_coating: id },
      });
      const data2 = await InspeksiCoatingSubPeriode.findAll({
        where: { id_inspeksi_coating: id },
      });
      data.push(data2);
      if (data2.length > 0) {
        return res.status(200).json({ data: ["awal", "periode"], msg: "OK" });
      } else {
        return res.status(200).json({ data: ["awal"], msg: "OK" });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  pendingInspeksiCoating: async (req, res) => {
    try {
      const { id } = req.params;
      const { alasan_pending } = req.body;
      const data = await InspeksiCoating.findByPk(id);
      if (data) {
        await InspeksiCoating.update(
          {
            status: "pending",
            jumlah_pending: data.jumlah_pending + 1,
            alasan_pending: alasan_pending,
          },
          {
            where: { id },
          }
        );
      }
      res.status(200).json({ data: "pending successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  incomingInspeksiCoating: async (req, res) => {
    try {
      const { id } = req.params;
      await InspeksiCoating.update(
        {
          status: "incoming",
        },
        {
          where: { id },
        }
      );
      res.status(200).json({ data: "incoming successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingController;
