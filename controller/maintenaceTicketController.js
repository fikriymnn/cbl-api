const Ticket = require("../model/maintenaceTicketModel");
const Users = require("../model/userModel")

const userController = {
    getTicket: async (req, res) => {
      try {
        const {status_tiket,type_mtc,jenis_kendala,nama_customer,bagian_tiket,mesin,tgl} = req.query
        if(status_tiket||type_mtc||jenis_kendala||nama_customer||bagian_tiket||mesin||tgl){
           let obj = {}
           if(status_tiket)obj.status_tiket=status_tiket;
           if(type_mtc)obj.type_mtc=type_mtc;
           if(jenis_kendala)obj.jenis_kendala=jenis_kendala;
           if(nama_customer)obj.nama_customer=nama_customer;
           if(bagian_tiket)obj.bagian_tiket=bagian_tiket;
           if(mesin)obj.mesin=mesin;
           if(tgl)obj.tgl=tgl
           
           const response = await Ticket.findAll({
             where: obj
           })
           res.status(200).json(response);
        }else{
          const response = await Ticket.findAll();
          res.status(200).json(response);
        }
        
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    },
  
    getTiketById: async (req, res) => {
      try {
        const response = await Ticket.findOne({
          
          where: {
            id: req.params.id,
          },

         include:[
          {
            model: Users,
            as: "user_respon_mtc",
            attributes: ["id","uuid", "nama", "email", "role", "no","status"],
          },
          {
          model: Users,
          as: "user_mtc",
          attributes: ["id","uuid", "nama", "email", "role", "no","status"],
        },
        {
          model: Users,
          as: "user_qc",
          attributes: ["id","uuid", "nama", "email", "role", "no","status"],
        }
      ]
        });
        res.status(200).json(response);
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    },
  
    createTiket: async (req, res) => {
      const { id_jo, no_jo, nama_produk, no_io, no_so, nama_customer,qty,qty_druk,spek,proses,mesin,bagian,operator,tgl,jenis_kendala,id_kendala,nama_kendala } = req.body;

      try {
        await Ticket.create({
            id_jo:id_jo , 
            no_jo:no_jo , 
            nama_produk:nama_produk , 
            no_io: no_io, 
            no_so: no_so, 
            nama_customer: nama_customer,
            qty: qty,
            qty_druk: qty_druk,
            spek: spek,
            proses: proses,
            mesin:mesin ,
            bagian: bagian,
            operator: operator,
            tgl: tgl,
            jenis_kendala: jenis_kendala,
            id_kendala: id_kendala,
            nama_kendala: nama_kendala,
        }),
          res.status(201).json({ msg: "Ticket create Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    updateTiket: async (req, res) => {
      const _id = req.params.id;
      const { bagian_tiket, status_tiket, waktu_respon,waktu_selesai_mtc,waktu_selesai,tipe_mtc,id_mtc,id_qc } = req.body;

      let obj = {}
      if(bagian_tiket)obj.bagian_tiket =bagian_tiket;     
      if(status_tiket)obj.status_tiket =status_tiket;
      if(waktu_respon)obj.waktu_respon =waktu_respon;
      if(waktu_selesai_mtc)obj.waktu_selesai_mtc =waktu_selesai_mtc;
      if(waktu_selesai)obj.waktu_selesai =waktu_selesai;
      if(tipe_mtc)obj.tipe_mtc =tipe_mtc;
      if(id_mtc)obj.id_mtc =id_mtc;
      if(id_qc)obj.id_qc =id_qc;
      

      try {
        await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket update Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    updateTiketTypeMtc: async (req, res) => {
      const _id = req.params.id;
      const { tipe_mtc } = req.body;
      let obj = {}
      if(tipe_mtc){
        obj.tipe_mtc = tipe_mtc
        obj.bagian_tiket = "os2"
      }
      
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket update Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    responseMtc: async (req, res) => {
      const _id = req.params.id;
      let obj = {
        id_respon_mtc:req.user.id,
        waktu_respon: new Date() 
      }
          
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Respon Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    requestedDate: async (req, res) => {
      const _id = req.params.id;
      const {tgl_mtc} = req.body;
      let obj = {
        tgl_mtc:tgl_mtc,
        status_tiket: "requested date" 
      }
          
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Respon Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    approveDate: async (req, res) => {
      const _id = req.params.id;
     
      let obj = {       
        status_tiket: "date approved" 
      }
          
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Date Approved" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    tolakDate: async (req, res) => {
      const _id = req.params.id;
     
      let obj = {       
        status_tiket: "date declined", 
      }
          
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Date Declined" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    beginTiket: async (req, res) => {
      const _id = req.params.id;
      
      let obj = {
        status_tiket: "on progress",
      }     
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket maintenance begin Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    finishMtc: async (req, res) => {
      const _id = req.params.id;
      const { skor_mtc } = req.body;
      let obj = {
        status_tiket: "mtc selesai",
        waktu_selesai_mtc: new Date(),
        skor_mtc: skor_mtc,
      }     
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    approveTiket: async (req, res) => {
      const _id = req.params.id;     
      let obj = { 
        waktu_selesai : new Date(),
        id_qc : req.user.id,
        status_tiket: "Qc Approve",       
      }
           
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket approved Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    tolakTiket: async (req, res) => {
      const _id = req.params.id;     
      let obj = { 
        waktu_selesai : new Date(),
        id_qc : req.user.id,
        status_tiket: "Qc Tolak",       
      }
           
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket Tolak Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },
  };
  
  module.exports = userController;