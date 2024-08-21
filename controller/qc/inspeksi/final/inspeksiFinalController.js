const InspeksiFinal = require("../../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../../model/qc/inspeksi/final/inspeksiFinalSubModel");

const inspeksiFinalController = {
    getInspeksiFinal: async (req, res) => {
        try {
            const { status, page, limit } = req.query;
            const { id } = req.params;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            let obj = {};
            if (page && limit && (status || tgl || mesin)) {
                if (status) obj.status = status;
                if (tgl) obj.tanggal = tgl;
                if (mesin) obj.mesin = mesin;

                const length = await InspeksiFinal.count({ where: obj });
                const data = await InspeksiFinal.findAll({
                    order: [["createdAt", "DESC"]],
                    limit: parseInt(limit),
                    offset,
                    where: obj,
                });

                return res.status(200).json({
                    data: data,
                    total_page: Math.ceil(length / parseInt(limit)),
                });
            } else if (page && limit) {
                const data = await InspeksiFinal.findAll({
                    order: [["createdAt", "DESC"]],
                    offset,
                    limit: parseInt(limit),
                });
                const length = await InspeksiFinal.count();
                return res.status(200).json({
                    data: data,
                    total_page: Math.ceil(length / parseInt(limit)),
                });
            } else if (status) {
                if (status) obj.status = status;
                if (tgl) obj.tanggal = tgl;
                if (mesin) obj.mesin = mesin;

                const data = await InspeksiFinal.findAll({
                    order: [["createdAt", "DESC"]],
                    where: obj,
                });
                const length = await InspeksiFinal.count({ where: obj });
                return res.status(200).json({
                    data,
                    total_page: Math.ceil(length / parseInt(limit)),
                });
            } else if (id) {
                const data1 = await InspeksiFinal.findByPk(id);

                if (!data1.inspector) {
                    await InspeksiFinal.update({ inspector: req.user.id })
                }

                const data = await InspeksiFinal.findByPk(id, {
                    include: [
                        { model: InspeksiFinalSub, as: "id_inspeksi_sub" },
                        { model: InspeksiFinalPoint, as: "id_inspeksi_point" },
                    ],
                });
                return res.status(200).json({ data });
            } else {
                const data = await InspeksiFinal.findAll({
                    order: [["createdAt", "DESC"]],
                });
                return res.status(200).json({ data });
            }
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    createInspeksiFinal: async (req, res) => {
        const {
            tanggal,
            no_jo,
            no_io,
            quantity,
            jam,
            nama_produk,
            customer,
        } = req.body;

        try {
             await InspeksiFinal.create({
                tanggal,
                no_jo,
                no_io,
                quantity,
                jam,
                nama_produk,
                customer,
            });


            res.status(200).json({ msg: "create Successful" });
        } catch (error) {
            res.status(404).json({ msg: error.message });
        }
    },
};

module.exports = inspeksiCetakController;