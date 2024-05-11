const TicketOs3 = require("../../../model/preventive/pm1/maintenanceTicketPM1Model");
const Users = require("../../../model/userModel")
const Mesin = require("../../../model/masterData/masterMesinModel")

const ticketOs3Controller = {
    getTicketOs3: async (req, res) => {
        try {
            const { id_mesin, id_inspector, id_leader, id_supervisor, id_kabag_mtc, tanggal, status_tiket } = req.query
            if (id_mesin || id_inspector || id_leader || id_supervisor || id_kabag_mtc || tanggal || status_tiket) {
                let obj = {}
                if (status_tiket) obj.status_tiket = status_tiket;
                if (tanggal) obj.tanggal = tanggal;
                if (id_mesin) obj.id_mesin = id_mesin;
                if (id_inspector) obj.id_inspector = id_inspector;
                if (id_leader) obj.id_leader = id_leader;
                if (id_supervisor) obj.id_supervisor = id_supervisor;
                if (id_kabag_mtc) obj.id_kabag_mtc = id_kabag_mtc

                const response = await TicketOs3.findAll({
                    where: obj,
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
                        },
                        {
                            model: Mesin,
                            as: "mesin",
                            attributes: ['id', 'nama_mesin', 'kode_mesin'],
                        }
                    ]
                })

                res.status(200).json(response);
            } else {
                const response = await TicketOs3.findAll({
                    include:[
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
                        },
                        {
                            model: Mesin,
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

    getTicketOs3ById: async (req, res) => {
        try {
            const response = await TicketOs3.findOne({
                where: {
                    id: req.params.id,
                },
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
                    },
                    {
                        model: Mesin,
                        as: "mesin",
                        attributes: ['id', 'nama_mesin', 'kode_mesin'],
                    }
                ]
            });
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createTicket: async (req, res) => {
        const { id_mesin,id_inspector,id_leader,id_supervisor,id_kabag_mtc,tanggal,catatan,status_tiket } = req.body;

        try {
            await TicketOs3.create({
                id_mesin,id_inspector,id_leader,id_supervisor,id_kabag_mtc,tanggal,catatan,status_tiket
            }),
            
            res.status(201).json({ msg: "Ticket PM 1 create Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    updateTicketOs3: async (req, res) => {
        const _id = req.params.id;
        const { id_mesin,id_inspector,id_leader,id_supervisor,id_kabag_mtc,tanggal,catatan,status_tiket } = req.body;

        let obj = {}
        if (id_mesin) obj.id_mesin = id_mesin;
        if (status_tiket) obj.status_tiket = status_tiket;
        if (id_inspector) obj.id_inspector = id_inspector;
        if (id_leader) obj.id_leader = id_leader;
        if (id_supervisor) obj.id_supervisor = id_supervisor;
        if (id_kabag_mtc) obj.id_kabag_mtc = id_kabag_mtc;
        if (tanggal) obj.tanggal = tanggal;
        if (catatan) obj.catatan = catatan;


        try {
            await TicketOs3.update(obj, { where: { id: _id } }),
                res.status(201).json({ msg: "Ticket update Successfuly" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    deleteTicketOs3: async (req,res)=>{
        const _id = req.params.id;
        try {
            await TicketOs3.destroy({where: {id:_id}}),
              res.status(201).json({ msg: "Ticket PM 1 delete Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    }
};

module.exports = ticketOs3Controller;