const MasterMesin = require("../../../model/masterData/masterMesinModel");
const InspectionTask = require("../../../model/preventive/pm1/inspectionTask")

const InspectionTaskController = {
    getInspectionTask: async (req, res) => {
        try {
            const { id_mesin } = req.query

            if (id_mesin) {
                const response = await InspectionTask.findAll({
                    where: { id_mesin },
                    include: [
                        {
                            model: MasterMesin,
                            as: "mesin",
                            attributes: ['id', 'nama_mesin', 'kode_mesin'],
                        }
                    ]
                });
                res.status(200).json(response);
            } else {
                const response = await InspectionTask.findAll({
                    include: [
                        {
                            model: MasterMesin,
                            as: "mesin",
                            attributes: ['id', 'nama_mesin', 'kode_mesin'],
                        }
                    ]
                });
                res.status(200).json(response);
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createInspectionTask: async (req, res) => {
        try {
            const { id_mesin, inspection_point, task, acceptance_criteria, method, tools } = req.body;

            const response = await InspectionTask.create({
                id_mesin, inspection_point, task, acceptance_criteria, method, tools
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    updateInspectionTask: async (req, res) => {
        const _id = req.params.id;
        const { id_mesin, inspection_point, task, acceptance_criteria, method, tools } = req.body;

        let obj = {}
        if (id_mesin) obj.id_mesin = id_mesin;
        if (inspection_point) obj.inspection_point = inspection_point;
        if (task) obj.task = task;
        if (acceptance_criteria) obj.acceptance_criteria = acceptance_criteria;
        if (method) obj.method = method;
        if (tools) obj.tools = tools;

        try {
            await InspectionTask.update(obj, { where: { id: _id } }),
                res.status(201).json({ msg: "Inspection Task update Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    deleteInspectionTask: async (req, res) => {
        const _id = req.params.id;
        try {
            await InspectionTask.destroy({ where: { id: _id } }),
                res.status(201).json({ msg: "Inspection Task delete Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }
}

module.exports = InspectionTaskController;