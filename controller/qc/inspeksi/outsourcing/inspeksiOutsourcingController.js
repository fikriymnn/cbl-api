const InspeksiMasterPointOutsourcing = require("../../../../model/masterData/qc/inspeksi/masterPointOutsourcing");
const InspeksiOutsourcing = require("../../../../model/qc/inspeksi/outsourcing/inspeksiOutsorcingModel");
const InspeksiOutsourcingPoint = require("../../../../model/qc/inspeksi/outsourcing/inspeksiOutsourcingPointModel");
const Users = require("../../../../model/userModel");

const inspeksiOutsourcingController = {
    getInspeksiOutsourcing : async (req, res) => {
        try {
          const { status, page, limit } = req.query;
          const { id } = req.params;
          const offset = (parseInt(page) - 1) * parseInt(limit);
          let obj = {};
          if (page && limit && (status)) {
            if (status) obj.status = status;
            const length = await InspeksiOutsourcing.count({ where: obj });
            const data = await InspeksiOutsourcing.findAll({
              order: [["createdAt", "DESC"]],
              limit: parseInt(limit),
              offset,
              where: obj,
              include: [
                { model: InspeksiOutsourcingPoint, as: "inspeksi_outsourcing" },
                { model: Users, as: "inspector" }
              ],
            });
    
            return res.status(200).json({
              data: data,
              total_page: Math.ceil(length / parseInt(limit)),
            });
          } else if (page && limit) {
            const data = await InspeksiOutsourcing.findAll({
              order: [["createdAt", "DESC"]],
              include: [ { model: InspeksiOutsourcingPoint, as: "inspeksi_outsourcing" },
                { model: Users, as: "inspector" }],
              offset,
              limit: parseInt(limit),
            });
            const length = await InspeksiOutsourcing.count();
            return res.status(200).json({
              data: data,
              total_page: Math.ceil(length / parseInt(limit)),
            });
          } else if (status || bagian_tiket) {
            if (status) obj.status = status;
    
            const data = await InspeksiOutsourcing.findAll({
              order: [["createdAt", "DESC"]],
              include: [ { model: InspeksiOutsourcingPoint, as: "inspeksi_outsourcing" },
                { model: Users, as: "inspector" }],
              where: obj,
            });
            const length = await InspeksiOutsourcing.count({ where: obj });
            return res.status(200).json({
              data,
              total_page: Math.ceil(length / parseInt(limit)),
            });
          } else if (id) {
            const data1 = await InspeksiOutsourcing.findByPk(id);
    
            if (!data1.inspector&&req.user?.id) {
              await InspeksiOutsourcing.update(
                { id_inspector: req.user.id },
                { where: { id: id } }
              );
            }
    
            const data = await InspeksiOutsourcing.findByPk(id, {
              include: [
                { model: InspeksiOutsourcingPoint, as: "inspeksi_outsourcing" },
                { model: Users, as: "inspector" }
              ],
            });
            return res.status(200).json({ data });
          } else {
            const data = await InspeksiOutsourcing.findAll({
              order: [["createdAt", "DESC"]],
              include: [ { model: InspeksiOutsourcingPoint, as: "inspeksi_outsourcing" },
                { model: Users, as: "inspector" }],
            });
            return res.status(200).json({ data });
          }
        } catch (err) {
          res.status(500).json({ msg: err.message });
        }
      },
      createInspeksiOutsourcing : async (req,res)=>{
        try{
          const {tanggal,jam,no_jo,jumlah_druk,nama_produk} = req.body

          if (!tanggal)
            return res.status(400).json({ msg: "Field tanggal kosong!" });
          else if (!jam)
            return res.status(400).json({ msg: "Field jam kosong!" });
          else if (!no_jo)
            return res.status(400).json({ msg: "Field no_jo kosong!" });
          else if (!jumlah_druk)
            return res.status(400).json({ msg: "Field jumlah_druk kosong!" });
          else if (!nama_produk)
            return res.status(400).json({ msg: "Field nama_produk kosong!" });

          const data = await InspeksiOutsourcing.create({tanggal,jam,no_jo,jumlah_druk,nama_produk})

          const masterPointOutsourcing = await InspeksiMasterPointOutsourcing.findAll({where:{status:"active"}})

          if(data){
            for (let i = 0; i < masterPointOutsourcing.length; i++) {
                await InspeksiOutsourcingPoint.create({
                    id_inspeksi_outsourcing: data.id,
                    point: masterPointOutsourcing[i].point,
                    standar: masterPointOutsourcing[i].standar,
                  });
                
            }
          }
          res.status(200).json({ msg: "create Successful" })
       
        }catch(err){
          res.status(500).json({ msg: err.message });
        }
      },
      submitInspeksiOutsourcing: async (req,res)=>{
        try{
          const {
          outsourcing,
          coating,
          kesesuaian,
          status_outsourcing} = req.body
        }catch(err){
          res.status(500).json({ msg: err.message });
        }
      }
}

module.exports = inspeksiOutsourcingController