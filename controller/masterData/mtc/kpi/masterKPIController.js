const masterKPI = require("../../../../model/masterData/mtc/kpi/masterKpiModel")

const masterKPIController = {
    getMasterKPI: async (req, res) => {
        const { role } = req.query;
        let obj = {};

        if (role) obj.role = role;

        try {
            if (obj) {
                const response = await masterKPI.findAll({
                    where: obj
                });
                res.status(200).json(response);
            } else {
                const response = await masterKPI.findAll();
                res.status(200).json(response);
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getMasterKPIById: async (req, res) => {
        try {
         if (!req.params.id) {
            return res.status(404).json({ msg: "Wrong id params!!" });
          }
          const response = await masterKPI.findByPk(req.params.id);
          res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createMasterKPI: async (req, res) => {
        const { role,
            cascade,
            job_function,
            target,
            bobot_nilai,
            ip_100,
            ip_0,
            reverse } = req.body

        try {
            console.log(req.body)
            if (!role || !cascade || !job_function || !target || !bobot_nilai || !ip_100 || !ip_0) {
                return res.status(404).json({ msg: "incomplete data!!" });
            }

            await masterKPI.create({
                role,
                cascade,
                job_function,
                target,
                bobot_nilai,
                ip_100,
                ip_0,
                reverse
            });

            res.status(200).json({ msg: "success" });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },
    deleteMasterKPI: async (req, res) => {
        const _id = req.params.id;
        try {
            if (!_id) {
                return res.status(404).json({ msg: "Wrong id params!!" });
            }
            await masterKPI.destroy({ where: { id: _id } });
            res.status(201).json({ msg: " delete Success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    updateMasterKPI: async (req, res) => {
        const _id = req.params.id;
        const {  role,
            cascade,
            job_function,
            target,
            bobot_nilai,
            ip_100,
            ip_0,
            reverse } =
            req.body;

        let obj = {};
        if (role) obj.role = role;
        if (cascade) obj.cascade = cascade;
        if (job_function) obj.job_function = job_function;
        if (target) obj.target = target;
        if (bobot_nilai) obj.bobot_nilai = bobot_nilai;
        if (ip_100) obj.ip_100 = ip_100;
        if (ip_0) obj.ip_0 = ip_0;
        if (reverse) obj.reverse = reverse;

        try {
            await masterKPI.update(obj, { where: { id: _id } });
            res.status(201).json({ msg: "update success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
}

module.exports = masterKPIController