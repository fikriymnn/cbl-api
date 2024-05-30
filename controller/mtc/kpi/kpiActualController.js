const KPIActual = require("../../../model/mtc/kpi/kpiActual")
const KpiTicket = require("../../../model/mtc/kpi/kpiTicket")
const {Op} = require("sequelize");
const Users = require("../../../model/userModel");


const KPIActualController = {
    getKPIActual: async (req, res) => {
        const { from,to,tanggal,id_user } = req.query;
        let obj = {};

        if(from&&to){
            obj.tanggal = {
                [Op.between]:[from,to]
            }
        }
        if(tanggal) obj.tanggal = tanggal
        if(id_user) obj.id_user = id_user

        try {
           if (obj) {
                const response = await KPIActual.findAll({
                    where: obj,
                    include: [
                        {
                            model: Users,
                            as: "user"
                        }
                    ]
                });
                res.status(200).json(response);
            } else {
                const response = await KPIActual.findAll({
                    include: [
                        {
                            model: Users,
                            as: "user"
                        }
                    ]
                });
                res.status(200).json(response);
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getKPIActualById: async (req, res) => {
        try {
         if (!req.params.id) {
            return res.status(404).json({ msg: "Wrong id params!!" });
          }
          const response = await KPIActual.findByPk(req.params.id);
          res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createKPIActual: async (req, res) => {
        const body = req.body
        
        for(let i = 0;i < body.length;i++){
            if (!body[i].id_user||!body[i].actual||!body[i].ip_100||!body[i].ip_0||!body[i].bobot||!body[i].tanggal||!body[i].role) {
                return res.status(404).json({ msg: "incomplete data!!" });
            }
        }
        try {
            let total_point = 0;
            for(let i = 0;i < body.length;i++){
                if(actual>=ip_0){
                    total_point
                }
            }
            const data = await KPIActual.bulkCreate(body);
            
            res.status(200).json({ msg: "success" });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },
    deleteKPIActual: async (req, res) => {
        const _id = req.params.id;
        try {
            if (!_id) {
                return res.status(404).json({ msg: "Wrong id params!!" });
            }
            await KPIActual.destroy({ where: { id: _id } });
            res.status(201).json({ msg: " delete Success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    updateKPIActual: async (req, res) => {
        const _id = req.params.id;
        const {  id_user,
        tanggal,
        actual,
        point,
        ip_100,
        ip_0,
        reverse} = req.body;

        let obj = {};
        if (id_user) obj.id_user = id_user;
        if (tanggal) obj.tanggal = tanggal;
        if (actual) obj.actual = actual;
        if (point) obj.point = point;
        if (ip_100) obj.ip_100 = ip_100;
        if (ip_0) obj.ip_0 = ip_0;
        if (reverse) obj.reverse = reverse;

        try {
            await KPIActual.update(obj, { where: { id: _id } });
            res.status(201).json({ msg: "update success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
}

module.exports = KPIActualController