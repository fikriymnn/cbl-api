const MasterMesin = require("../../../model/masterData/masterMesinModel");
const InspectionResult = require("../../../model/preventive/pm1/inspectionResult");
const TicketOs3 = require("../../../model/preventive/pm1/maintenanceTicketPM1Model");
const Users = require("../../../model/userModel");

const InspectionResultController = {
    getInspectionResult: async (req, res) => {
        try {
            const { nama_mesin } = req.query

            if (nama_mesin) {
                const response = await InspectionResult.findAll({
                    where: { nama_mesin }
                });
                res.status(200).json(response);
            } else {
                const response = await InspectionResult.findAll();
                res.status(200).json(response);
            }
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createInspectionResult: async (req, res) => {
        try {
            const { nama_mesin,tanggal,inspection_point,hasil,file,catatan,task, acceptance_criteria, method, tools} = req.body;

            const response = await InspectionResult.create({
                nama_mesin,tanggal,inspection_point,hasil,file,catatan
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    updateInspectionResult: async (req, res) => {
        const _id = req.params.id;
        const { nama_mesin,inspection_point,hasil,file,catatan,task, acceptance_criteria, method, tools } = req.body;

        let obj = {}
        if (nama_mesin) obj.nama_mesin = nama_mesin;
        if (inspection_point) obj.inspection_point = inspection_point;
        if (hasil) obj.hasil = hasil;
        if (file) obj.file = file;
        if (catatan) obj.catatan = catatan;

        try {
            await InspectionResult.update(obj, { where: { id: _id } }),
                res.status(201).json({ msg: "Inspection Result update Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    deleteInspectionResult: async (req, res) => {
        const _id = req.params.id;
        try {
            await InspectionResult.destroy({ where: { id: _id } }),
                res.status(201).json({ msg: "Inspection Result delete Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    }
}

module.exports = InspectionResultController;