const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const InspeksiCoatingPointMasterPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");

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
            nama_produk,
            customer,
            shift,
            mesin,
            operator,
            status_jo
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
         else if (!jumlah)
            return res.status(400).json({ msg: "Field jumlah kosong!" });
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

         const data = await InspeksiCoating.create({
            tanggal,
            jumlah,
            jenis_kertas,
            jenis_gramatur,
            jam,
            no_jo,
            nama_produk,
            customer,
            shift,
            mesin,
            operator,
            status_jo,
            periode,
            coating
         });
         if (data.id) {
            await InspeksiCoatingResultAwal.create(
               {
                  id_inspeksi_coating: data?.id,
               }
            )
            await InspeksiCoatingSubAwal.create(
               {
                  id_inspeksi_coating: data?.id,
               }
            )
         }

         return res.status(200).json({ data, msg: "OK" });
      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   },
   updateInspeksiCoatingAwal: async (req, res) => {
      try {
         const { jumlah_periode_check,
            waktu_check } = req.body
         const { id } = req.params
         await InspeksiCoatingSubAwal.update({
            jumlah_periode_check,
            waktu_check,
            status: "history"
         }, {
            where: {
               id_inspeksi_coating: id
            }
         })
         await InspeksiCoatingSubPeriode.create({
           id_inspeksi_coating: id
         })
         await InspeksiCoatingResultPeriode.create({
            id_inspeksi_coating: id
         })
         const data = await InspeksiCoatingPointMasterPeriode.findAll({where:{
            status: "active"
         }})
         let a= 0
         data.forEach((v,i)=>{
            data[i].id_inspeksi_coating = id
            a++
         })
         if(data.length==a){
            await InspeksiCoatingResultPointPeriode.bulkCreate(data)
         }

         return res.status(200).json({ data:"update successfully", msg: "OK" });
      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   },
   getInspeksiCoatingJenisProsess : async (req,res)=>{
     try{
        const {id} = req.params
        const data = await InspeksiCoatingSubAwal.findAll({where:{id_inspeksi_coating:id}})
        const data2 = await InspeksiCoatingSubPeriode.findAll({where: {id_inspeksi_coating:id}})
        data.push(data2)
        if(data2.length>0){
         return res.status(200).json({ data: ["awal","periode"], msg: "OK" });
        }else{
         return res.status(200).json({ data: ["awal"], msg: "OK" });
        }
     }catch(err){
      res.status(500).json({ msg: err.message })
     }
   }
}
module.exports = inspeksiCoatingController 