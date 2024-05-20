const MasterMesin = require("../../../model/masterData/masterMesinModel");
const InspectionResult = require("../../../model/preventive/pm1/inspectionResult");
const TicketOs3 = require("../../../model/maintenanceTicketOs3Model");
const Users = require("../../../model/userModel");

const InspectionResultController = {
    getInspectionResult: async (req, res) => {
        try {
            const { nama_mesin} = req.query

            if (nama_mesin) {
                const response = await InspectionResult.findAll({
                    where: { nama_mesin },
                    include: [
                        {
                            model: TicketOs3,
                            as: "ticket",
                            attributes: ['nama_mesin',
                            "id_inspector",
                            "id_leader",
                            "id_supervisor",
                            "id_kabag_mtc",
                            "tanggal",
                            "catatan",
                            "bagian_tiket",
                            "status_tiket",
                            "waktu_respon",
                            "waktu_selesai_mtc",
                            "waktu_selesai",
                            "tgl_mtc",
                            "skor_mtc",
                            "cara_perbaikan",
                            "kode_analisis_mtc",
                            "nama_analisis_mtc"],
                            include: [
                                {
                                    model: Users,
                                    as: "leader",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "supervisor",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "inspector",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "kabag_mtc",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                }
                            ]
                        },
                    ]
                }
            );
                res.status(200).json(response);
            } else {
                const response = await InspectionResult.findAll({
                    include: [
                        {
                            model: TicketOs3,
                            as: "ticket",
                            attributes: ['nama_mesin',
                            "id_inspector",
                            "id_leader",
                            "id_supervisor",
                            "id_kabag_mtc",
                            "tanggal",
                            "catatan",
                            "bagian_tiket",
                            "status_tiket",
                            "waktu_respon",
                            "waktu_selesai_mtc",
                            "waktu_selesai",
                            "tgl_mtc",
                            "skor_mtc",
                            "cara_perbaikan",
                            "kode_analisis_mtc",
                            "nama_analisis_mtc"],
                            include: [
                                {
                                    model: Users,
                                    as: "leader",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "supervisor",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "inspector",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                },
                                {
                                    model: Users,
                                    as: "kabag_mtc",
                                    attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                                }
                            ]
                        },
                    ]
                });
                res.status(200).json(response);
            }
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createInspectionResult: async (req, res) => {
        try {
            const { id_ticket,nama_mesin,id_mesin,tanggal,inspection_point,hasil,file,catatan,task, acceptance_criteria, method, tools} = req.body;

            const response = await InspectionResult.create({
                id_ticket,nama_mesin,id_mesin,tanggal,inspection_point,hasil,file,catatan,task, acceptance_criteria, method, tools
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    updateInspectionResult: async (req, res) => {
        const _id = req.params.id;
        const { nama_mesin,inspection_point,hasil,file,catatan} = req.body;

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