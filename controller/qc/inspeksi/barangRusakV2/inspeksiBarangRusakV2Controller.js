const { Op, Sequelize } = require("sequelize");
const InspeksiBarangRusakV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const InspeksiBarangRusakDefectV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");

//cetak
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");

//coating
const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");

//pond
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");

//lem
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");

//rabut
const InspeksiRabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabut = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const InspeksiRabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");

const User = require("../../../../model/userModel");

const inspeksiBarangRusakV2Controller = {
  getInspeksiBarangRusakV2: async (req, res) => {
    try {
      const { status, tgl, page, limit, search, start_date, end_date } =
        req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (tgl) obj.tanggal = tgl;
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
        const length = await InspeksiBarangRusakV2.count({ where: obj });
        const data = await InspeksiBarangRusakV2.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiBarangRusakPointV2,
              as: "inspeksi_barang_rusak_point_v2",
              attributes: ["id"],
              include: [
                {
                  model: User,
                  as: "inspektor",
                },
              ],
            },
          ],
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiBarangRusakV2.findByPk(id, {
          include: [
            {
              model: InspeksiBarangRusakPointV2,
              as: "inspeksi_barang_rusak_point_v2",
              include: [
                {
                  model: InspeksiBarangRusakDefectV2,
                  as: "inspeksi_barang_rusak_defect_v2",
                },
                {
                  model: User,
                  as: "inspektor",
                },
              ],
            },
            {
              model: User,
              as: "inspektor",
            },
          ],
        });

        const pointDefectSettingAwal = await InspeksiBarangRusakPointV2.findAll(
          {
            attributes: [
              [
                Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
                "jumlah_defect",
              ],
            ],

            where: {
              id_inspeksi_barang_rusak_v2: id,
              nama_pengecekan: "setting awal",
            },
          }
        );

        const pointDefectDrukAwal = await InspeksiBarangRusakPointV2.findAll({
          attributes: [
            [
              Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
              "jumlah_defect",
            ],
          ],

          where: {
            id_inspeksi_barang_rusak_v2: id,
            nama_pengecekan: "druk awal",
          },
        });

        const jumlahSettingAwal =
          pointDefectSettingAwal[0].jumlah_defect == null
            ? 0
            : parseInt(pointDefectSettingAwal[0].jumlah_defect);
        const jumlahDrukAwal =
          pointDefectDrukAwal[0].jumlah_defect == null
            ? 0
            : parseInt(pointDefectDrukAwal[0].jumlah_defect);
        const subTotal = jumlahSettingAwal + jumlahDrukAwal;
        const barangBaik = data.qty_rusak - subTotal;

        return res.status(200).json({
          settingAwal: jumlahSettingAwal,
          drukAwal: jumlahDrukAwal,
          subTotal: subTotal,
          barangBaik: barangBaik,
          data: data,
        });
      } else {
        const data = await InspeksiBarangRusakV2.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getHistoryTemuan: async (req, res) => {
    const { no_jo, is_with_rabut } = req.query;
    try {
      if (!no_jo) return res.status(404).json({ msg: "no_jo required!!" });
      const dataCetak = await InspeksiCetak.findAll({
        where: { no_jo: no_jo },
        include: [
          {
            model: InspeksiCetakPeriode,
            as: "inspeksi_cetak_periode",
            include: [
              {
                model: InspeksiCetakPeriodePoint,
                as: "inspeksi_cetak_periode_point",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                  {
                    model: InspeksiCetakPeriodeDefect,
                    as: "inspeksi_cetak_periode_defect",
                  },
                ],
              },
            ],
          },
        ],
      });

      const dataCoating = await InspeksiCoating.findAll({
        where: { no_jo: no_jo },
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
        ],
      });

      const dataPond = await InspeksiPond.findAll({
        where: { no_jo: no_jo },
        include: [
          {
            model: InspeksiPondPeriode,
            as: "inspeksi_pond_periode",
            include: [
              {
                model: InspeksiPondPeriodePoint,
                as: "inspeksi_pond_periode_point",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                  {
                    model: InspeksiPondPeriodeDefect,
                    as: "inspeksi_pond_periode_defect",
                  },
                ],
              },
            ],
          },
        ],
      });

      const dataLem = await InspeksiLem.findAll({
        where: { no_jo: no_jo },
        include: [
          {
            model: InspeksiLemPeriode,
            as: "inspeksi_lem_periode",
            include: [
              {
                model: InspeksiLemPeriodePoint,
                as: "inspeksi_lem_periode_point",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                  {
                    model: InspeksiLemPeriodeDefect,
                    as: "inspeksi_lem_periode_defect",
                  },
                ],
              },
            ],
          },
        ],
      });

      let dataRabut = [];

      if (is_with_rabut == true || is_with_rabut == "true") {
        dataRabut = await InspeksiRabut.findAll({
          where: { no_jo: no_jo },
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
        });
      }

      const dataTemuanCetak = dataCetak.flatMap((item) =>
        item?.inspeksi_cetak_periode[0]?.inspeksi_cetak_periode_point.flatMap(
          (point, pointIndex) =>
            point.inspeksi_cetak_periode_defect
              .filter((defect) => defect.hasil === "not ok")
              .map((defect) => {
                const plainDefect = defect.get({ plain: true }); // <- ubah jadi plain object
                return {
                  ...plainDefect,
                  bagian: "cetak",
                  nama_inspektor: point.inspektor?.nama || null,
                  periode_ke: pointIndex + 1,
                };
              })
        )
      );

      const dataTemuanCoating = dataCoating.flatMap((item) =>
        item?.inspeksi_coating_result_periode.flatMap((point, pointIndex) =>
          point.inspeksi_coating_result_point_periode
            .filter((defect) => defect.hasil === "not ok")
            .map((defect) => {
              const plainDefect = defect.get({ plain: true }); // <- ubah jadi plain object
              return {
                ...plainDefect,
                bagian: "coating",
                nama_inspektor: point.inspektor?.nama || null,
                periode_ke: pointIndex + 1,
              };
            })
        )
      );

      const dataTemuanPond = dataPond.flatMap((item) =>
        item?.inspeksi_pond_periode[0]?.inspeksi_pond_periode_point.flatMap(
          (point, pointIndex) =>
            point.inspeksi_pond_periode_defect
              .filter((defect) => defect.hasil === "not ok")
              .map((defect) => {
                const plainDefect = defect.get({ plain: true }); // <- ubah jadi plain object
                return {
                  ...plainDefect,
                  bagian: "pond",
                  nama_inspektor: point.inspektor?.nama || null,
                  periode_ke: pointIndex + 1,
                };
              })
        )
      );

      const dataTemuanLem = dataLem.flatMap((item) =>
        item?.inspeksi_lem_periode[0]?.inspeksi_lem_periode_point.flatMap(
          (point, pointIndex) =>
            point.inspeksi_lem_periode_defect
              .filter((defect) => defect.hasil === "not ok")
              .map((defect) => {
                const plainDefect = defect.get({ plain: true }); // <- ubah jadi plain object
                return {
                  ...plainDefect,
                  bagian: "lem",
                  nama_inspektor: point.inspektor?.nama || null,
                  periode_ke: pointIndex + 1,
                };
              })
        )
      );

      let dataTemuanRabut = [];

      if (is_with_rabut == true || is_with_rabut == "true") {
        dataTemuanRabut = dataRabut.flatMap((item) =>
          item?.inspeksi_rabut_point.flatMap((point, pointIndex) =>
            point.inspeksi_rabut_defect.map((defect) => {
              const plainDefect = defect.get({ plain: true }); // <- ubah jadi plain object
              return {
                ...plainDefect,
                bagian: "rabut",
                nama_inspektor: point.inspektor?.nama || null,
              };
            })
          )
        );
      }

      const sortedTemuanCetak = dataTemuanCetak.sort(
        (a, b) => a.periode_ke - b.periode_ke
      );
      const sortedTemuanCoating = dataTemuanCoating.sort(
        (a, b) => a.periode_ke - b.periode_ke
      );
      const sortedTemuanPond = dataTemuanPond.sort(
        (a, b) => a.periode_ke - b.periode_ke
      );
      const sortedTemuanLem = dataTemuanLem.sort(
        (a, b) => a.periode_ke - b.periode_ke
      );

      if (is_with_rabut == true || is_with_rabut == "true") {
        return res.status(200).json({
          dataCetak: sortedTemuanCetak,
          dataCoating: sortedTemuanCoating,
          dataPond: sortedTemuanPond,
          dataLem: sortedTemuanLem,
          dataRabut: dataTemuanRabut,
        });
      } else {
        return res.status(200).json({
          dataCetak: sortedTemuanCetak,
          dataCoating: sortedTemuanCoating,
          dataPond: sortedTemuanPond,
          dataLem: sortedTemuanLem,
        });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiBarangRusakV2: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      status_jo,
      operator,
      nama_produk,
      customer,
      qty_rusak,
      qty_jo,
    } = req.body;

    try {
      const checkData = await InspeksiBarangRusakV2.findOne({
        where: { no_jo: no_jo, status: "incoming" },
      });
      // if (checkData) {
      //   res
      //     .status(200)
      //     .json({
      //       msg: "JO sedang di proses oleh QC pada proses Sorting barang RS",
      //     });
      // } else {
      //   const inspeksiBarangRusakV2 = await InspeksiBarangRusakV2.create({
      //     tanggal: new Date(),
      //     no_jo,
      //     no_io,
      //     operator,
      //     nama_produk,
      //     customer,
      //     qty_rusak,
      //     status_jo,
      //   });

      //   //   const masterBarangRusakDefect = await MasterBarangRusakDefect.findAll({
      //   //     where: { status: "aktif" },
      //   //   });

      //   //   for (let index = 0; index < masterBarangRusakDefect.length; index++) {
      //   //     const dataMaster = masterBarangRusakDefect[index];
      //   //     await InspeksiBarangRusakDefectV2.create({
      //   //       id_inspeksi_barang_rusak: inspeksiBarangRusakV2.id,
      //   //       kode: dataMaster.kode,
      //   //       masalah: dataMaster.masalah,
      //   //       asal_temuan: dataMaster.asal_temuan,
      //   //     });
      //   //   }

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const inspeksiBarangRusakV2 = await InspeksiBarangRusakV2.create({
        tanggal: new Date(),
        no_jo,
        no_io,
        operator,
        nama_produk,
        customer,
        qty_rusak,
        status_jo,
        qty_jo,
      });

      //   const masterBarangRusakDefect = await MasterBarangRusakDefect.findAll({
      //     where: { status: "aktif" },
      //   });

      //   for (let index = 0; index < masterBarangRusakDefect.length; index++) {
      //     const dataMaster = masterBarangRusakDefect[index];
      //     await InspeksiBarangRusakDefectV2.create({
      //       id_inspeksi_barang_rusak: inspeksiBarangRusakV2.id,
      //       kode: dataMaster.kode,
      //       masalah: dataMaster.masalah,
      //       asal_temuan: dataMaster.asal_temuan,
      //     });
      //   }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      res.status(404).json({ msg: error.message });
    }
  },

  startBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiBarangRusakV2 = await InspeksiBarangRusakV2.findByPk(_id);
      if (inspeksiBarangRusakV2.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiBarangRusakV2.update(
        { id_inspektor: req.user.id, waktu_sortir: new Date() },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Start Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  doneBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { catatan, lama_pengerjaan, barang_baik_aktual } = req.body;
    if (!catatan)
      return res.status(400).json({ msg: "Catatan tidak boleh kosong" });

    if (!barang_baik_aktual)
      return res
        .status(400)
        .json({ msg: "Barang Baik Aktual tidak boleh kosong" });

    try {
      const noDoc = await MasterKodeDoc.findByPk(9);
      await InspeksiBarangRusakV2.update(
        {
          status: "history",
          waktu_selesai_sortir: new Date(),
          catatan,
          lama_pengerjaan,
          barang_baik_aktual,
          no_doc: noDoc.kode,
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      const barangRusak = await InspeksiBarangRusakV2.findByPk(_id);
      // await InspeksiCetakPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );

      await InspeksiBarangRusakV2.update(
        { status: "pending", jumlah_pending: barangRusak.jumlah_pending + 1 },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  istirahatBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiBarangRusakV2.update(
        {
          status: "istirahat",
          waktu_istirahat: new Date(),
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Istirahat Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  masukIstirahatBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { lama_istirahat } = req.body;
    try {
      await InspeksiBarangRusakV2.update(
        {
          status: "incoming",
          waktu_masuk_istirahat: new Date(),
          lama_istirahat: lama_istirahat,
        },
        {
          where: { id: _id },
        }
      );
      res.status(200).json({ msg: "Istirahat masuk Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiBarangRusakV2Controller;
