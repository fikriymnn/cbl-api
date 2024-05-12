const TicketOs3 = require("../../../model/preventive/pm1/maintenanceTicketPM1Model");
const Users = require("../../../model/userModel")
const Mesin = require("../../../model/masterData/masterMesinModel");
const MasterMesin = require("../../../model/masterData/masterMesinModel");

const ticketOs3Controller = {
    getTicketOs3: async (req, res) => {
        try {
            const { nama_mesin, inspector, leader, supervisor, kabag_mtc, tanggal, status_tiket } = req.query
            if (nama_mesin || inspector || leader || supervisor || kabag_mtc || tanggal || status_tiket) {
                let obj = {}
                if (status_tiket) obj.status_tiket = status_tiket;
                if (tanggal) obj.tanggal = tanggal;
                if (nama_mesin) obj.nama_mesin = nama_mesin;
                if (inspector) obj.inspector = inspector;
                if (leader) obj.leader = leader;
                if (supervisor) obj.supervisor = supervisor;
                if (kabag_mtc) obj.kabag_mtc = kabag_mtc

                const response = await TicketOs3.findAll({
                    where: obj,
                    // include: [
                    //     {
                    //         model: Users,
                    //         as: "leader",
                    //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                    //     },
                    //     {
                    //         model: Users,
                    //         as: "supervisor",
                    //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                    //     },
                    //     {
                    //         model: Users,
                    //         as: "inspector",
                    //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                    //     },
                    //     {
                    //         model: Users,
                    //         as: "kabag_mtc",
                    //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                    //     },
                    //     {
                    //         model: Mesin,
                    //         as: "mesin",
                    //         attributes: ['id', 'nama_mesin', 'kode_mesin'],
                    //     }
                    // ]
                })

                res.status(200).json(response);
            } else {
                const response = await TicketOs3.findAll();
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
                // include: [
                //     {
                //         model: Users,
                //         as: "leader",
                //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                //     },
                //     {
                //         model: Users,
                //         as: "supervisor",
                //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                //     },
                //     {
                //         model: Users,
                //         as: "inspector",
                //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                //     },
                //     {
                //         model: Users,
                //         as: "kabag_mtc",
                //         attributes: ['id', 'uuid', 'nama', 'email', 'role', 'status'],
                //     },
                //     {
                //         model: Mesin,
                //         as: "mesin",
                //         attributes: ['id', 'nama_mesin', 'kode_mesin'],
                //     }
                // ]
            });
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    createTicket: async (req, res) => {
        const {kabag_mtc} = req.body;
        if(!kabag_mtc){
             res.status(400).json({
                msg: "Please add kabag_mtc value to request body"
             })
        }
        try {   
            const data_mesin = await MasterMesin.findAll() 
            if(data_mesin){
                let arr = []
                let i = 0;
                while(i<data_mesin.length){
                    arr.push({
                        nama_mesin: data_mesin[i].nama_mesin,
                        tanggal: new Date(),
                        status_ticket: "pending",
                        kabag_mtc
                    })
                    i++
                }
                if(i==data_mesin.length-1){
                    await TicketOs3.bulkCreate(arr)
                    res.status(200).json({ msg: "Ticket PM 1 create Successfuly" });
                }
            }
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    updateTicketOs3: async (req, res) => {
        const _id = req.params.id;
        const { nama_mesin,inspector,leader,supervisor,kabag_mtc,tanggal,catatan,status_tiket} = req.body;

        let obj = {}
        if (nama_mesin) obj.mesin = nama_mesin;
        if (status_tiket) obj.status_tiket = status_tiket;
        if (inspector) obj.inspector = inspector;
        if (leader) obj.leader = leader;
        if (supervisor) obj.supervisor = supervisor;
        if (kabag_mtc) obj.kabag_mtc = kabag_mtc;
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