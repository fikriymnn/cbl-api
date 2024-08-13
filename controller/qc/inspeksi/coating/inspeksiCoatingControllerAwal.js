const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingSubPeriodeModel");

const inspeksiCoatingController = {
   getInspeksiCoating: async (req, res) => {
      try {
         const { status, page, limit, jenis_pengecekan } = req.query;
         const { id } = req.params;
         const offset = (parseInt(page) - 1) * parseInt(limit);
         let obj = {}

         if (page && limit && (status || jenis_pengecekan)) {
            if (status) obj.status = status

            const data = await InspeksiCoating.findAll({
               order: [["createdAt", "DESC"]],
               limit: parseInt(limit),
               offset,
               where: obj,
            });
            const length = await InspeksiCoating.count({ where: obj });
            return res.status(200).json({
               data,
               total_page: Math.ceil(length / parseInt(limit)),
            });
         } else if (page && limit) {
            const data = await InspeksiCoating.findAll({
               order: [["createdAt", "DESC"]],
               offset,
               limit: parseInt(limit),
            });
            const length = await InspeksiCoating.count();
            return res.status(200).json({
               data,
               total_page: Math.ceil(length / parseInt(limit)),
            });
         } else if (status || jenis_pengecekan) {
            if (status) obj.status = status
            if (jenis_pengecekan) obj.jenis_pengecekan = jenis_pengecekan
            const data = await InspeksiCoating.findAll({
               order: [["createdAt", "DESC"]],
               where: obj,
            });
            const length = await InspeksiCoating.count({ where: obj });
            return res.status(200).json({
               data,
               total_page: Math.ceil(length / parseInt(limit)),
            });
         } else if (id) {
            if (jenis_pengecekan == 'awal') {
               const data = await InspeksiCoating.findByPk(id,
                  {
                     include: [{ model: InspeksiCoatingResultAwal, as: "inspeksi_coating_result_awal" }, { model: InspeksiCoatingSubAwal, as: "inspeksi_coating_sub_awal" }],
                  });
               if (req.user.name && data && !data?.inspector) {
                  await data.update({ inspector: req.user.name }, { where: { id } })
               }
               return res.status(200).json({ data });
            } else if (jenis_pengecekan == 'periode') {
               const data = await InspeksiCoating.findByPk(id,
                  {
                     include: [{
                        model: InspeksiCoatingResultPeriode, as: "inspeksi_coating_result_priode", include: {
                           model: InspeksiCoatingResultPointPeriode, as: "inspeksi_coating_result_point_periode"
                        }
                     }, { model: InspeksiCoatingSubPeriode, as: "inspeksi_coating_sub_periode" }],
                  });
               return res.status(200).json({ data });
            } else {
               const data = await InspeksiCoating.findByPk(id,
                  {
                     include: [{
                        model: InspeksiCoatingResultPeriode, as: "inspeksi_coating_result_priode", include: {
                           model: InspeksiCoatingResultPointPeriode, as: "inspeksi_coating_result_point_periode"
                        }
                     }, { model: InspeksiCoatingSubPeriode, as: "inspeksi_coating_sub_periode" }, { model: InspeksiCoatingResultAwal, as: "inspeksi_coating_result_awal" }, { model: InspeksiCoatingSubAwal, as: "inspeksi_coating_sub_awal" }],
                  });
               return res.status(200).json({ data });
            }
         } else {
            const data = await InspeksiCoating.findAll({
               order: [["createdAt", "DESC"]],
            });
            return res.status(200).json({ data });
         }
      } catch (err) {
         res.status(500).json({ msg: err.message });
      }
   },
   addInspeksiCoating: async (req, res) => {
      try {
         const {
            tanggal,
            jumlah,
            jenis_kertas,
            jenis_gramatur,
            warna_depan,
            warna_belakang,
            jam,
            no_jo,
            nama_produk,
            customer,
            shift,
            mesin,
            operator,
            status_jo,
            inspector,
            periode
         } = req.body;

         if (!tanggal)
            return res.status(400).json({ msg: "Field tanggal kosong!" });
         else if (!no_surat_jalan)
            return res.status(400).json({ msg: "Field no_surat_jalan kosong!" });
         else if (!supplier)
            return res.status(400).json({ msg: "Field supplier kosong!" });
         else if (!jenis_kertas)
            return res.status(400).json({ msg: "Field jenis_kertas kosong!" });
         else if (!ukuran)
            return res.status(400).json({ msg: "Field ukuran kosong!" });
         else if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
         else if (!jumlah)
            return res.status(400).json({ msg: "Field jumlah kosong!" });

         const data = await InspeksiBahan.create({
            tanggal,
            jumlah,
            jenis_kertas,
            jenis_gramatur,
            warna_depan,
            warna_belakang,
            jam,
            no_jo,
            nama_produk,
            customer,
            shift,
            mesin,
            operator,
            status_jo,
            inspector,
            periode
         });

         return res.status(200).json({ data, msg: "OK" });
      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   },
   updateInspeksiCoating: async (req, res) => {
      try {

      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   }
}
module.exports = inspeksiCoatingController 