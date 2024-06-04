const KpiActual = require("../../../model/mtc/kpi/kpiActual")
const KpiTicket = require("../../../model/mtc/kpi/kpiTicket")
const MasterKPI = require("../../../model/masterData/masterSparepart")
const {Op} = require("sequelize")
const sequelize = require("sequelize")


const KPITicketController = {
    getKPITicket: async (req, res) => {
        const { from,to,tanggal,id_user,role } = req.query;
        let obj = {};

        if(from&&to){
            obj.tanggal = {
                [Op.between]:[from,to]
            }
        }
        if(role) obj.role = role
        if(tanggal) obj.tanggal = tanggal
        if(id_user) obj.id_user = id_user
        
        try {
           if (obj) {
                const response = await KpiTicket.findAll({
                    where: obj
                });
                res.status(200).json(response);
            } else {
                const response = await KpiTicket.findAll();
                res.status(200).json(response);
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getKPITicketById: async (req, res) => {
        try {
         if (!req.params.id) {
            return res.status(404).json({ msg: "Wrong id params!!" });
          }
          const response = await KpiTicket.findByPk(req.params.id);
          res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createKPITicket: async (req, res) => {
        const {total_point,role,id_user} = req.body
        let penilaian = "";
    
        try {
            const data_master = await MasterKPI.findAll({
                where: {
                    role: role
                }
            })
            let total_bobot_penilaian = 0;

            for(let i = 0;i<data_master.length;i++){
                total_bobot += data_master[i].bobot;
            }
            total_bobot_penilaian = total_bobot_penilaian/4;
            if(total_point>=(total_bobot_penilaian*3)){
                penilaian="EXCELENT";
            }else if(total_point<(total_bobot_penilaian*3)&&total_point>=(total_bobot_penilaian*2)){
                penilaian="GOOD";
            }else if(total_point<(total_bobot_penilaian*2)&&total_point>=total_bobot_penilaian){
                penilaian="PERFORM";
            }else if(total_point<total_bobot_penilaian){
                penilaian="UNDER PERFORM";
            }

            if(penilaian){
                await KpiTicket.create({
                    id_user: id_user,
                    tanggal: new Date(),
                    total_point: total_point,
                    penilaian: penilaian,
                    role: role
                })
                res.status(200).json({ msg: "success" });
            }   
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },
    deleteKPITicket: async (req, res) => {
        const _id = req.params.id;
        try {
            if (!_id) {
                return res.status(404).json({ msg: "Wrong id params!!" });
            }
            await KpiTicket.destroy({ where: { id: _id } });
            res.status(201).json({ msg: " delete Success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    updateKPITicket: async (req, res) => {
        const _id = req.params.id;
        const { id_user,total_point,penilaian } = req.body;

        let obj = {};
        if (id_user) obj.id_user = id_user;
        if (total_point) obj.total_point = total_point;
        if (penilaian) obj.penilaian = penilaian;

        try {
            await KpiTicket.update(obj, { where: { id: _id } });
            res.status(201).json({ msg: "update success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
}

module.exports = KPITicketController